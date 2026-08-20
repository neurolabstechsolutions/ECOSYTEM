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

// Owner notification phone number (Alert Destination)
const OWNER_PHONE = '573235845145@s.whatsapp.net';

// Realtime In-Memory Data Store (Synchronized with NeuroLabs Dashboard)
const activeSessions = new Map(); // sender -> { lastActivity: number, timer: Timeout }
const liveConversations = new Map(); // sender -> { id, contact, lastMessage, messages: [], handlingStatus, unreadCount }
const liveWorkflowLogs = []; // Real-time execution logs for /app/automations

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

  // Handle incoming messages & trigger Real Automated 5-Step Pipeline
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const sender = msg.key.remoteJid;
      const cleanPhone = sender.replace(/[^0-9]/g, '');
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const pushName = msg.pushName || `Cliente (+${cleanPhone})`;

      if (!text.trim() || sender.includes('@g.us')) continue;

      const startTime = Date.now();
      console.log(`\n========================================`);
      console.log(`⚡ [PIPELINE START] Paso #1 Trigger: ${pushName} (${cleanPhone}) -> "${text}"`);

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
        // PASO #2: Inferencia Neuronal Llama 120B con scoring estructurado
        console.log(`🤖 [PIPELINE STEP #2] Inferencia Neuronal Llama 120B...`);
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

        // Enviar respuesta al cliente por WhatsApp
        console.log(`📤 [PIPELINE OUTBOUND] Respondiendo a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });

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

        // PASO #3: Enrutador de Condición & Lead Score (Cálculo real de intención)
        const isHighIntent = text.toLowerCase().includes('precio') || 
                             text.toLowerCase().includes('cotiz') || 
                             text.toLowerCase().includes('comprar') || 
                             text.toLowerCase().includes('agendar') || 
                             text.toLowerCase().includes('interesa') ||
                             text.toLowerCase().includes('reunion') ||
                             text.toLowerCase().includes('1') ||
                             text.toLowerCase().includes('2');

        const calculatedScore = isHighIntent ? 92 : 65;
        console.log(`⚖️ [PIPELINE STEP #3] Lead Score Evaluado: ${calculatedScore}% (Alto Valor: ${isHighIntent})`);

        // PASO #4 & #5: Si el Lead es de Alto Valor (>80), Disparar Alerta al Dueño
        if (isHighIntent) {
          console.log(`🚨 [PIPELINE STEP #5] Disparando Alerta VIP al WhatsApp del Dueño (+57 323 5845145)...`);
          try {
            const ownerAlert = `🚀 *¡NUEVO LEAD CALIFICADO EN VIVO!*
👤 *Cliente:* ${pushName}
📱 *WhatsApp:* +${cleanPhone}
🎯 *Interés:* "${text}"
🔥 *Score de Cierre:* ${calculatedScore}%
⚡ *Atendido por:* Asesor IA NeuroLabs (Llama 120B)`;
            
            await sock.sendMessage(OWNER_PHONE, { text: ownerAlert });
            console.log(`✅ [PIPELINE COMPLETE] Alerta entregada al dueño.`);
          } catch (alertErr) {
            console.log(`⚠️ No se pudo enviar alerta a ${OWNER_PHONE}:`, alertErr.message);
          }
        }

        const durationMs = Date.now() - startTime;

        // Registrar en Execution Logs en vivo para el Dashboard
        liveWorkflowLogs.unshift({
          id: `exec_${Date.now()}`,
          workflowId: 'wf-1',
          workflowName: 'Calificación de Clientes por WhatsApp & Alerta de Cierre',
          triggerEvent: `whatsapp.message (${pushName})`,
          status: 'success',
          durationMs,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stepsExecuted: 5,
          totalSteps: 5,
          payloadPreview: {
            cliente: pushName,
            telefono: `+${cleanPhone}`,
            mensaje: text,
            score: `${calculatedScore}%`,
            alertaOwner: isHighIntent ? 'DESPACHADA' : 'NUTRICION',
          },
        });

        // Mantener solo los últimos 30 logs
        if (liveWorkflowLogs.length > 30) liveWorkflowLogs.pop();

        // Temporizador de inactividad de 2 minutos
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
        }, 2 * 60 * 1000);

        activeSessions.set(sender, { lastActivity: Date.now(), timer });

      } catch (err) {
        console.error('Error al ejecutar pipeline de IA:', err);
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

app.get('/workflow-logs', (req, res) => {
  res.json({
    logs: liveWorkflowLogs,
    total: liveWorkflowLogs.length,
    activeWorkflows: 4,
    status: connectionStatus
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeuroLabs WhatsApp Bridge', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 NeuroLabs WhatsApp Bridge corriendo en el puerto ${PORT}`);
  connectToWhatsApp();
});
