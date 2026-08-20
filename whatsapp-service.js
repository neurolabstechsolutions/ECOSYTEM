const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
let currentQR = null;
let connectionStatus = 'DISCONNECTED';
let connectedNumber = null;
let sock = null;

// Realtime In-Memory Data Store (Synchronized with NeuroLabs Dashboard)
const activeSessions = new Map(); // sender -> { lastActivity: number, timer: Timeout }
const liveConversations = new Map(); // sender -> { id, contact, lastMessage, messages: [], handlingStatus, unreadCount }

// Initialize Groq AI Client
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = await QRCode.toDataURL(qr);
      connectionStatus = 'SCAN_QR';
      console.log('⚡ Nuevo Código QR generado para escaneo.');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      connectionStatus = 'DISCONNECTED';
      console.log('Conexión cerrada. Reconectando...', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      connectionStatus = 'CONNECTED';
      connectedNumber = sock.user?.id?.split(':')[0] || 'Conectado';
      currentQR = null;
      console.log('🎉 ¡WhatsApp Conectado Exitosamente a:', connectedNumber);
    }
  });

  // Handle incoming messages & trigger AI Agent
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const sender = msg.key.remoteJid;
      const cleanPhone = sender.replace(/[^0-9]/g, '');
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const pushName = msg.pushName || `Cliente (+${cleanPhone})`;

      if (!text.trim() || sender.includes('@g.us')) continue;

      console.log(`[Baileys Inbound] De: ${pushName} (${cleanPhone}) -> "${text}"`);

      // Store in Live Conversation Registry
      if (!liveConversations.has(sender)) {
        liveConversations.set(sender, {
          id: `conv_${cleanPhone}`,
          contact: {
            id: `usr_${cleanPhone}`,
            name: pushName,
            phone: `+${cleanPhone}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanPhone}`,
            tenant: 'NeuroLabs Tech Solutions',
            email: `cliente_${cleanPhone}@whatsapp.user`,
          },
          lastMessage: {
            id: msg.key.id || Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date().toISOString(),
          },
          handlingStatus: 'AI_HANDLING',
          unreadCount: 0,
          messages: [],
        });
      }

      const conv = liveConversations.get(sender);
      conv.lastMessage = {
        id: msg.key.id || Date.now().toString(),
        sender: 'user',
        text: text,
        timestamp: new Date().toISOString(),
      };
      conv.messages.push({
        id: msg.key.id || Date.now().toString(),
        sender: 'user',
        text: text,
        timestamp: new Date().toISOString(),
      });

      // Clear existing inactivity timer for this user
      if (activeSessions.has(sender)) {
        const session = activeSessions.get(sender);
        if (session.timer) clearTimeout(session.timer);
      }

      try {
        const { text: aiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: `Actúas como el Asesor Comercial y Consultor Tecnológico Senior de NeuroLabs Tech Solutions S.A.S. (Agencia de Desarrollo de Software, Inteligencia Artificial, Automatizaciones y Soluciones Cloud).

IDENTIDAD Y PROTOCOLO:
1. IDENTIDAD:
   - Representas EXCLUSIVAMENTE a NeuroLabs Tech Solutions S.A.S.
   - NUNCA digas que eres Trinova. Trinova Motors es solo uno de los clientes y casos de éxito de la agencia.
   - Tu misión es presentar los servicios de desarrollo tecnológico y cotizaciones de NeuroLabs.

2. PORTAFOLIO DE SERVICIOS DE NEUROLABS:
   - 💻 Desarrollo de Software a la Medida, Web Apps & SaaS escalables.
   - 🤖 Agentes de Inteligencia Artificial 24/7 y Automatización de Ventas por WhatsApp.
   - ☁️ Arquitectura Cloud, APIs, Integraciones ERP y Ciberseguridad.
   - 📊 Ecosistemas de Comercio Electrónico y Portales Multi-Tenant (como el desarrollado para Trinova).

3. TONO:
   - Ejecutivo, consultivo, empático y estructurado.
   - Al final de tu respuesta, invita al cliente a continuar o agendar una llamada con nuestro equipo.`,
          messages: [{ role: 'user', content: text }],
        });

        console.log(`[Baileys Outbound] Respondiendo a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });

        // Save AI Response in conversation history
        conv.messages.push({
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toISOString(),
        });
        conv.lastMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toISOString(),
        };

        // Set 2-minute inactivity auto-closing timer
        const timer = setTimeout(async () => {
          try {
            console.log(`[Session Timeout] Cerrando chat por inactividad (2 mins) para: ${sender}`);
            const closingText = '⏱️ *Sesión en pausa por inactividad (2 minutos)*\n\nHa sido un placer atenderte. Para retomar la conversación o solicitar una nueva cotización con *NeuroLabs Tech Solutions S.A.S.*, simplemente escribe *Hola* en cualquier momento.\n\n¡Que tengas un excelente día! 👋✨';
            await sock.sendMessage(sender, { text: closingText });
            
            conv.messages.push({
              id: (Date.now() + 2).toString(),
              sender: 'ai',
              text: closingText,
              timestamp: new Date().toISOString(),
            });

            activeSessions.delete(sender);
          } catch (err) {
            console.error('Error al enviar mensaje de cierre por inactividad:', err);
          }
        }, 2 * 60 * 1000); // 2 minutes (120,000 ms)

        activeSessions.set(sender, { lastActivity: Date.now(), timer });

      } catch (err) {
        console.error('Error al generar respuesta IA:', err);
      }
    }
  });
}

// REST Endpoints for NeuroLabs Dashboard
app.get('/qr', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: currentQR,
    phone: connectedNumber
  });
});

app.get('/conversations', (req, res) => {
  const convList = Array.from(liveConversations.values());
  res.json({
    conversations: convList,
    total: convList.length,
    status: connectionStatus,
    phone: connectedNumber
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeuroLabs WhatsApp Bridge', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 NeuroLabs WhatsApp Bridge corriendo en el puerto ${PORT}`);
  connectToWhatsApp();
});
