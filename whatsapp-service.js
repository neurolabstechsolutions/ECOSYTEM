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
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

      if (!text.trim() || sender.includes('@g.us')) continue;

      console.log(`[Baileys Inbound] De: ${sender} -> "${text}"`);

        const { text: aiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: `Actúas como el Asesor Comercial y Consultor Tecnológico Senior de NeuroLabs Tech Solutions S.A.S. (Agencia de Desarrollo de Software, Inteligencia Artificial, Automatizaciones y Soluciones Cloud).

IDENTIDAD Y PROTOCOLO:
1. IDENTIDAD:
   - Representas exclusivamente a NeuroLabs Tech Solutions S.A.S.
   - Brindas servicios a empresas y clientes de diversas industrias (como JY Trinova S.A.S. en el sector automotriz, clínicas, inmobiliarias y e-commerce).
   - NUNCA te presentes como Trinova; Trinova es uno de los clientes y casos de éxito de la agencia.

2. PORTAFOLIO DE SERVICIOS DE NEUROLABS:
   - 💻 Desarrollo de Software a la Medida, Web Apps y Plataformas SaaS escalables.
   - 🤖 Agentes de Inteligencia Artificial 24/7 y Automatización de Ventas por WhatsApp.
   - ☁️ Arquitectura Cloud, APIs, Integraciones ERP y Ciberseguridad.
   - 📊 Ecosistemas de Comercio Electrónico y Portales Multi-Tenant (como el desarrollado para Trinova).

3. TONO Y ESTILO:
   - Ejecutivo, consultivo, estructurado y altamente persuasivo.
   - Usa viñetas limpias, emojis moderados y ofrece agendar reuniones comerciales o cotizaciones a la medida.`,
          messages: [{ role: 'user', content: text }],
        });

        console.log(`[Baileys Outbound] Respondiendo a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeuroLabs WhatsApp Bridge', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 NeuroLabs WhatsApp Bridge corriendo en el puerto ${PORT}`);
  connectToWhatsApp();
});
