const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const axios = require('axios');

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
const activeSessions = new Map(); // sender -> { lastActivity: number, timer: Timeout, history: [] }
const liveConversations = new Map(); // sender -> { id, contact, lastMessage, messages: [], handlingStatus, unreadCount }
const liveWorkflowLogs = []; // Real-time execution logs for /app/automations

// Initialize Groq AI Client
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// ElevenLabs Configuration (High-Definition Natural Voice)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_11dc8c0036a97d6031431de25ffc336a45b832dc371d6160';
const ELEVENLABS_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

// Helper: Generate Natural Human Voice Note with ElevenLabs
async function generateElevenLabsVoiceNote(text) {
  try {
    const cleanText = text.replace(/[*_~`#]/g, '').slice(0, 200);
    console.log(`🎙️ [ELEVENLABS NEURAL] Generando voz humana contextual: "${cleanText.slice(0, 50)}..."`);

    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.80,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    return Buffer.from(response.data);
  } catch (err) {
    console.error('Error generando audio en ElevenLabs:', err.response?.data?.toString() || err.message);
    return null;
  }
}

// Helper: Generate Clean Instant Corporate PDF Quotation
async function generateInstantPDFQuote(clientName, serviceTitle, priceText) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  // Header Banner
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

  page.drawText('PROPUESTA TECNICA Y COTIZACION OFICIAL', {
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

  page.drawText(`FECHA DE EMISION: ${new Date().toLocaleDateString('es-CO')}`, {
    x: 40,
    y: height - 160,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`VALIDEZ: 15 DIAS COMERCIALES`, {
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

  page.drawText('DESGLOSE DE LA SOLUCION:', {
    x: 55,
    y: height - 230,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`* ${serviceTitle}`, {
    x: 55,
    y: height - 255,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('* Arquitectura en la nube escalable, APIs seguras y despliegue continuo.', {
    x: 55,
    y: height - 275,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText('* Garantia de 3 meses, soporte tecnico y entrega de codigo fuente.', {
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

  page.drawText('Contacto Comercial: +57 323 5845145 / +57 300 5765530', {
    x: 40,
    y: 35,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
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
      const isAudio = Boolean(msg.message.audioMessage);
      if (isAudio) {
        console.log(`🎙️ [AUDIO RECIBIDO] Nota de voz entrante de ${pushName}...`);
        text = 'Hola, te envié un audio solicitando información sobre sus servicios de desarrollo y software.';
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
        // PASO #2: Inferencia Neuronal Llama 120B (Respuestas Claras, Cortas y Conversacionales)
        console.log(`🤖 [PIPELINE STEP #2] Inferencia Neuronal Llama 120B...`);
        const { text: aiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: `Actúas como el Asesor Comercial Senior de NeuroLabs Tech Solutions S.A.S. (Agencia de Desarrollo de Software, Inteligencia Artificial y Soluciones Cloud).

REGLAS DE COMUNICACIÓN POR WHATSAPP (MUY IMPORTANTE):
1. RESPUESTAS CORTAS Y NATURALES:
   - Responde como un humano por chat: máximo 2 o 3 párrafos cortos (menos de 60 palabras).
   - NUNCA envíes listados gigantes de 6 servicios ni tablas con precios en bloque a menos que el cliente te pregunte por un servicio específico.
   - NO uses asteriscos excesivos (***) ni encabezados de markdown con símbolos raros (#). Usa saltos de línea limpios y emojis con moderación.

2. CONVERSACIÓN FLUIDA:
   - Saluda calurosamente llamando al cliente por su nombre (${pushName}).
   - Pregúntale amablemente qué tipo de proyecto o necesidad tiene su empresa (por ejemplo: desarrollo de una App/Web, automatizar su WhatsApp con IA, o infraestructura en la nube).
   - Ofrécele enviarle una cotización formal en PDF o agendar una llamada rápida cuando tenga clara la necesidad.

3. IDENTIDAD:
   - Tu empresa es NeuroLabs Tech Solutions S.A.S. (Desarrollo de Software & IA).
   - NUNCA digas que eres Trinova.`,
          messages: [{ role: 'user', content: text }],
        });

        // Enviar respuesta de texto al cliente por WhatsApp
        console.log(`📤 [PIPELINE OUTBOUND] Enviando respuesta texto a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });

        // PASO #3: Decisión Inteligente para Nota de Voz (Solo cuando es oportuno, NO SIEMPRE)
        // Solo envía nota de voz si el cliente envió un audio, o si pide audio/llamada explícitamente.
        const shouldSendVoiceNote = isAudio || 
                                    text.toLowerCase().includes('audio') || 
                                    text.toLowerCase().includes('nota de voz') || 
                                    text.toLowerCase().includes('llamada');

        if (shouldSendVoiceNote) {
          console.log(`🎙️ [ELEVENLABS VOZ] Generando Nota de Voz Contextual y Natural para ${pushName}...`);
          // Voz natural, variada y conversacional (sin repetir el nombre de la empresa como un robot)
          const voicePrompt = isAudio 
            ? `Hola ${pushName}, escuché tu mensaje con atención. Ya te dejé los detalles por aquí en el chat para que los revises con calma. Si quieres podemos cuadrar una llamada y revisamos tu proyecto.`
            : `Hola ${pushName}, claro que sí. Te dejé la información por texto. Cuéntame qué tipo de desarrollo necesitas y con gusto te preparo la cotización.`;

          const voiceBuffer = await generateElevenLabsVoiceNote(voicePrompt);

          if (voiceBuffer) {
            await sock.sendMessage(sender, {
              audio: voiceBuffer,
              mimetype: 'audio/mp4',
              ptt: true,
            });
            console.log(`✅ [ELEVENLABS ENVIADO] Nota de voz natural entregada.`);
          }
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

        // PASO #4: Detección de Solicitud de PDF
        const wantsQuotePDF = text.toLowerCase().includes('cotiz') || 
                              text.toLowerCase().includes('pdf') || 
                              text.toLowerCase().includes('propuesta');

        if (wantsQuotePDF) {
          console.log(`📑 [PIPELINE PDF] Generando Cotización Oficial en PDF para ${pushName}...`);
          try {
            const pdfBytes = await generateInstantPDFQuote(
              pushName,
              'Desarrollo de Software a la Medida & Agente de Inteligencia Artificial',
              '$4,800,000 COP (o $1,200 USD)'
            );

            await sock.sendMessage(sender, {
              document: Buffer.from(pdfBytes),
              mimetype: 'application/pdf',
              fileName: `Cotizacion_NeuroLabs_${cleanPhone}.pdf`,
              caption: '📄 *Aquí tienes la propuesta técnica y cotización oficial de NeuroLabs Tech Solutions S.A.S.*'
            });

            console.log(`✅ [PDF ENVIADO] Documento entregado exitosamente.`);
          } catch (pdfErr) {
            console.error('Error generando PDF:', pdfErr);
          }
        }

        // PASO #5: Alerta VIP al WhatsApp del Dueño
        const isHighIntent = wantsQuotePDF || text.toLowerCase().includes('agendar') || text.toLowerCase().includes('reunion') || text.toLowerCase().includes('comprar');
        const calculatedScore = isHighIntent ? 95 : 68;

        if (isHighIntent) {
          console.log(`🚨 [PIPELINE STEP #5] Disparando Alerta VIP al WhatsApp del Dueño (+57 323 5845145)...`);
          try {
            const ownerAlert = `🚀 *¡NUEVO LEAD ATENDIDO POR IA!*
👤 *Cliente:* ${pushName}
📱 *WhatsApp:* +${cleanPhone}
🎯 *Mensaje:* "${text}"
📄 *PDF Generado:* ${wantsQuotePDF ? 'Sí' : 'No'}
🔥 *Score de Cierre:* ${calculatedScore}%
⚡ *Atendido por:* Asesor IA NeuroLabs`;
            
            await sock.sendMessage(OWNER_PHONE, { text: ownerAlert });
            console.log(`✅ [PIPELINE COMPLETE] Alerta entregada al dueño.`);
          } catch (alertErr) {
            console.log(`⚠️ No se pudo enviar alerta a ${OWNER_PHONE}:`, alertErr.message);
          }
        }

        const durationMs = Date.now() - startTime;

        // Registrar en Execution Logs
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
            notaVozEnviada: shouldSendVoiceNote ? 'AUDIO_ENVIADO' : 'NO_REQUERIDO',
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
            const closingText = '⏱️ *Sesión en pausa por inactividad*\n\nHa sido un placer atenderte. Para retomar la conversación o solicitar una nueva cotización con *NeuroLabs Tech Solutions S.A.S.*, simplemente escribe *Hola* en cualquier momento.\n\n¡Que tengas un excelente día! 👋✨';
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
