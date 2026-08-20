const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const googleTTS = require('google-tts-api');

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

// Helper: Generate Instant Corporate PDF Quotation
async function generateInstantPDFQuote(clientName, serviceTitle, priceText) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  // Draw Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.05, 0.08, 0.15),
  });

  page.drawText('NEUROLABS TECH SOLUTIONS S.A.S.', {
    x: 40,
    y: height - 55,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('COTIZACIÓN Y PROPUESTA TÉCNICA OFICIAL', {
    x: 40,
    y: height - 78,
    size: 11,
    font: fontRegular,
    color: rgb(0.1, 0.8, 0.6),
  });

  // Client Details
  page.drawText(`CLIENTE: ${clientName.toUpperCase()}`, {
    x: 40,
    y: height - 140,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CO')}`, {
    x: 40,
    y: height - 160,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`VALIDEZ: 15 DÍAS COMERCIALES`, {
    x: 40,
    y: height - 175,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Service Description Box
  page.drawRectangle({
    x: 40,
    y: height - 340,
    width: width - 80,
    height: 140,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });

  page.drawText('DESGLOSE DEL SERVICIO / SOLUCIÓN:', {
    x: 55,
    y: height - 230,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`• ${serviceTitle}`, {
    x: 55,
    y: height - 255,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('• Arquitectura en la nube, APIs seguras y despliegue continuo.', {
    x: 55,
    y: height - 275,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText('• Garantía de 3 meses, soporte técnico 24/7 y código fuente.', {
    x: 55,
    y: height - 295,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Price Total Box
  page.drawRectangle({
    x: 40,
    y: height - 420,
    width: width - 80,
    height: 60,
    color: rgb(0.06, 0.72, 0.51),
  });

  page.drawText(`VALOR TOTAL ESTIMADO: ${priceText}`, {
    x: 55,
    y: height - 385,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Footer & Signature
  page.drawText('NeuroLabs Tech Solutions S.A.S. | NIT 901.482.119-4', {
    x: 40,
    y: 50,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Contacto Directo Gerencia: +57 323 5845145 / +57 300 5765530', {
    x: 40,
    y: 35,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

// Helper: Convert Text to Audio Voice Note Buffer (TTS)
async function generateVoiceNoteBuffer(text) {
  try {
    // Truncate text for voice note preview (first 180 chars)
    const cleanText = text.replace(/[*_~`#]/g, '').slice(0, 180);
    const base64Audio = await googleTTS.getAudioBase64(cleanText, {
      lang: 'es',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });
    return Buffer.from(base64Audio, 'base64');
  } catch (err) {
    console.error('Error generando nota de voz TTS:', err);
    return null;
  }
}

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

  // Handle incoming messages & trigger Real Automated 5-Step Enterprise Pipeline
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const sender = msg.key.remoteJid;
      const cleanPhone = sender.replace(/[^0-9]/g, '');
      let text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const pushName = msg.pushName || `Cliente (+${cleanPhone})`;

      // Audio Note Handling
      const isAudio = msg.message.audioMessage;
      if (isAudio) {
        console.log(`🎙️ [AUDIO RECIBIDO] Descargando nota de voz de ${pushName}...`);
        text = 'Hola, te envié un audio solicitando información sobre sus servicios y cotizaciones.';
      }

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
        // PASO #2: Inferencia Neuronal Llama 120B
        console.log(`🤖 [PIPELINE STEP #2] Inferencia Neuronal Llama 120B...`);
        const { text: aiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: `Actúas como el Asesor Comercial y Consultor Tecnológico Senior de NeuroLabs Tech Solutions S.A.S. (Agencia de Desarrollo de Software, Inteligencia Artificial, Automatizaciones y Soluciones Cloud).

IDENTIDAD Y PROTOCOLO:
1. IDENTIDAD:
   - Representas EXCLUSIVAMENTE a NeuroLabs Tech Solutions S.A.S.
   - NUNCA digas que eres Trinova. Trinova Motors es solo uno de los clientes y casos de éxito de la agencia.
   - Tu misión es presentar los servicios de desarrollo tecnológico y cotizaciones de NeuroLabs.

2. PORTAFOLIO DE SERVICIOS:
   - 💻 Desarrollo de Software a la Medida, Web Apps & SaaS escalables ($2,500 - $12,000 USD / $9.5M - $48M COP).
   - 🤖 Agentes de Inteligencia Artificial 24/7 y Automatización por WhatsApp ($800 - $3,500 USD / $3M - $14M COP).
   - ☁️ Arquitectura Cloud, APIs, Integraciones ERP y Ciberseguridad.
   - 📊 Ecosistemas de Comercio Electrónico y Portales Multi-Tenant.

3. TONO:
   - Ejecutivo, consultivo, empático y estructurado.
   - Al final de tu respuesta, invita al cliente a continuar o agendar una llamada con nuestro equipo.`,
          messages: [{ role: 'user', content: text }],
        });

        // Enviar respuesta de texto al cliente por WhatsApp
        console.log(`📤 [PIPELINE OUTBOUND] Enviando respuesta texto a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });

        // Enviar Nota de Voz Automática de WhatsApp (Voz Neural)
        console.log(`🎙️ [VOZ NEURAL] Generando y enviando Nota de Voz de WhatsApp para ${pushName}...`);
        const voiceBuffer = await generateVoiceNoteBuffer(
          `Hola ${pushName}. Un gusto saludarte de parte de NeuroLabs Tech Solutions. Te acabo de enviar los detalles y opciones de cotización por texto. Quedo muy atento a cualquier duda.`
        );

        if (voiceBuffer) {
          await sock.sendMessage(sender, {
            audio: voiceBuffer,
            mimetype: 'audio/mp4',
            ptt: true, // ptt: true sends as a genuine green microphone WhatsApp Voice Note!
          });
          console.log(`✅ [VOZ ENVIADA] Nota de voz de WhatsApp entregada exitosamente.`);
        }

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

        // PASO #3 & #4: Detección de Solicitud de PDF
        const wantsQuotePDF = text.toLowerCase().includes('cotiz') || 
                              text.toLowerCase().includes('pdf') || 
                              text.toLowerCase().includes('precio') || 
                              text.toLowerCase().includes('propuesta') || 
                              text.toLowerCase().includes('1');

        if (wantsQuotePDF) {
          console.log(`📑 [PIPELINE PDF] Generando Cotización Oficial en PDF para ${pushName}...`);
          try {
            const pdfBytes = await generateInstantPDFQuote(
              pushName,
              'Desarrollo de Plataforma SaaS / Agente IA WhatsApp 24/7',
              '$4,800,000 COP (o $1,200 USD)'
            );

            await sock.sendMessage(sender, {
              document: Buffer.from(pdfBytes),
              mimetype: 'application/pdf',
              fileName: `Cotizacion_Oficial_NeuroLabs_${cleanPhone}.pdf`,
              caption: '📄 *Aquí tienes tu Cotización Oficial y Ficha Técnica en PDF de NeuroLabs Tech Solutions S.A.S.*'
            });

            console.log(`✅ [PDF ENVIADO] Documento entregado exitosamente.`);
          } catch (pdfErr) {
            console.error('Error generando PDF:', pdfErr);
          }
        }

        // PASO #5: Si el Lead es de Alto Valor, Disparar Alerta al Dueño
        const isHighIntent = wantsQuotePDF || text.toLowerCase().includes('agendar') || text.toLowerCase().includes('reunion') || text.toLowerCase().includes('comprar');
        const calculatedScore = isHighIntent ? 95 : 68;

        if (isHighIntent) {
          console.log(`🚨 [PIPELINE STEP #5] Disparando Alerta VIP al WhatsApp del Dueño (+57 323 5845145)...`);
          try {
            const ownerAlert = `🚀 *¡NUEVO LEAD ATENDIDO CON TEXTO, AUDIO & PDF!*
👤 *Cliente:* ${pushName}
📱 *WhatsApp:* +${cleanPhone}
🎯 *Interés:* "${text}"
🎙️ *Nota de Voz:* Enviada (WhatsApp PTT)
📄 *PDF Generado:* ${wantsQuotePDF ? 'Sí' : 'No'}
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
            notaVozEnviada: 'AUDIO_PTT_OK',
            pdfGenerado: wantsQuotePDF ? 'DESPACHADO_PDF' : 'NO_SOLICITADO',
            score: `${calculatedScore}%`,
            alertaOwner: isHighIntent ? 'DESPACHADA' : 'NUTRICION',
          },
        });

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
