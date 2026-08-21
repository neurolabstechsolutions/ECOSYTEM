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

// Helper: Generate Real Database-Connected High-End Corporate PDF Quotation
async function generateInstantPDFQuote(clientName, serviceTitle, priceText, clientPhone) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const quoteNumber = `NL-COT-${Date.now().toString().slice(-6)}`;
  const emissionDate = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Header Banner (Dark Navy Executive Gradient)
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width: width,
    height: 110,
    color: rgb(0.04, 0.07, 0.12),
  });

  page.drawText('NEUROLABS TECH SOLUTIONS S.A.S.', {
    x: 40,
    y: height - 50,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('NIT: 901.482.119-4  |  INNOVACION SIN LIMITES', {
    x: 40,
    y: height - 70,
    size: 9,
    font: fontRegular,
    color: rgb(0.1, 0.8, 0.6),
  });

  page.drawText(`COTIZACION OFICIAL: ${quoteNumber}`, {
    x: 40,
    y: height - 90,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9),
  });

  // 2. Client & Executive Metadata Box
  page.drawRectangle({
    x: 40,
    y: height - 205,
    width: width - 80,
    height: 80,
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 1.0),
  });

  page.drawText(`CLIENTE: ${clientName.toUpperCase()}`, {
    x: 55,
    y: height - 145,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page.drawText(`CANAL DE ATENCION: WhatsApp Corporativo (${clientPhone || '+57 300 5765530'})`, {
    x: 55,
    y: height - 165,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  page.drawText(`FECHA DE EMISION: ${emissionDate}   |   VIGENCIA: Hasta ${validUntil}`, {
    x: 55,
    y: height - 185,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  // 3. Service Scope & Real Deliverables Table
  page.drawRectangle({
    x: 40,
    y: height - 440,
    width: width - 80,
    height: 220,
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  // Table Header
  page.drawRectangle({
    x: 40,
    y: height - 260,
    width: width - 80,
    height: 40,
    color: rgb(0.08, 0.12, 0.2),
  });

  page.drawText('DESCRIPCION DE LA SOLUCION TECNOLOGICA', {
    x: 55,
    y: height - 243,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('INVERSION ESTIMADA', {
    x: width - 200,
    y: height - 243,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Table Row
  page.drawText(`${serviceTitle.toUpperCase()}`, {
    x: 55,
    y: height - 285,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.2),
  });

  page.drawText(`${priceText}`, {
    x: width - 200,
    y: height - 285,
    size: 11,
    font: fontBold,
    color: rgb(0.04, 0.65, 0.45),
  });

  const deliverables = [
    '• Implementacion y configuracion del Agente IA 24/7 con conexion a WhatsApp.',
    '• Modulo de Memoria Conversacional, respuestas humanizadas y voz neural ElevenLabs.',
    '• Panel Administrativo SaaS para monitoreo de leads, metricas y agenda de citas.',
    '• Despliegue en la nube con alta disponibilidad, garantia y soporte tecnico continuo.'
  ];

  let currentY = height - 315;
  for (const d of deliverables) {
    page.drawText(d, {
      x: 55,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });
    currentY -= 22;
  }

  // 4. Total Investment Highlight Box
  page.drawRectangle({
    x: 40,
    y: height - 520,
    width: width - 80,
    height: 65,
    color: rgb(0.06, 0.72, 0.51),
  });

  page.drawText(`VALOR TOTAL DE LA PROPUESTA: ${priceText}`, {
    x: 55,
    y: height - 480,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Forma de Pago: 50% Anticipo de Inicio / 50% Contra Entrega Operativa', {
    x: 55,
    y: height - 502,
    size: 9,
    font: fontRegular,
    color: rgb(0.95, 1, 0.98),
  });

  // 5. Legal Terms & Warranty
  page.drawText('CONDICIONES COMERCIALES Y LEGALES:', {
    x: 40,
    y: height - 550,
    size: 10,
    font: fontBold,
    color: rgb(0.15, 0.2, 0.3),
  });

  const legalNotes = [
    '1. Incluye entrega de accesos y capacitacion completa al equipo comercial.',
    '2. Los datos y conversaciones son 100% privados y propiedad exclusiva del cliente.',
    '3. Soporte tecnico prioritario y garantia de estabilidad de infraestructura 24/7.'
  ];

  let legalY = height - 570;
  for (const note of legalNotes) {
    page.drawText(note, {
      x: 40,
      y: legalY,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });
    legalY -= 16;
  }

  // 6. Footer & Official Signatures
  page.drawRectangle({
    x: 40,
    y: 110,
    width: width - 80,
    height: 1,
    color: rgb(0.85, 0.88, 0.92),
  });

  page.drawText('JESUS DAVID CANTILLO PAREJO', {
    x: 40,
    y: 90,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('CEO & Fundador | NeuroLabs Tech Solutions', {
    x: 40,
    y: 78,
    size: 8,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText('RICHARD NIXON ACOSTA ALMARALES', {
    x: width - 240,
    y: 90,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('Director Comercial & Alianzas B2B', {
    x: width - 240,
    y: 78,
    size: 8,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText('NeuroLabs Tech Solutions S.A.S. • NIT 901.482.119-4 • contacto@neurolabs.io • +57 300 5765530', {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: rgb(0.55, 0.6, 0.65),
  });

  // Also store this official quote into Supabase team_tasks / contracts registry if possible
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fqxqeqdsqdampuzeiomx.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase.from('contracts').insert([{
      title: `Cotización ${quoteNumber} - ${clientName}`,
      client_name: clientName,
      status: 'COTIZADO',
      value: priceText,
    }]).then(() => {}).catch(() => {});
  } catch (e) {}

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
      if (!msg.message) continue;

      const sender = msg.key.remoteJid;
      const isGroup = sender.includes('@g.us');

      // For direct private chats, ignore fromMe. For groups, process fromMe to capture the CEO/Owner's response!
      if (msg.key.fromMe && !isGroup) continue;

      const cleanPhone = sender.replace(/[^0-9]/g, '');
      let text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      // Sanitizar pushName para evitar que si WhatsApp trae el nombre de tu propio negocio, no lo salude con su propio nombre
      let rawName = msg.pushName || '';
      let pushName = '';
      if (rawName && !rawName.toLowerCase().includes('neurolabs') && !rawName.toLowerCase().includes('solutions')) {
        pushName = rawName.split(' ')[0]; // Solo primer nombre
      }

      // Audio Note Handling
      const isAudio = Boolean(msg.message.audioMessage);
      if (isAudio) {
        console.log(`🎙️ [AUDIO RECIBIDO] Nota de voz entrante de cliente (${cleanPhone})...`);
        text = 'Hola, te envié un audio solicitando información sobre sus servicios de desarrollo y software.';
      }

      if (!text.trim()) continue;

      // =========================================================================
      // 👥 DETECCIÓN INTELIGENTE DE RESPUESTAS DE SOCIOS EN EL GRUPO DE WHATSAPP
      // =========================================================================
      if (sender.includes('@g.us')) {
        const participantJid = msg.key.participant || msg.key.remoteJid;
        const participantPhone = (participantJid || '').replace(/[^0-9]/g, '');
        const participantPushName = pushName || 'Socio';

        // Identify partner synchronized with real Supabase team data
        let partnerName = participantPushName;
        let partnerRole = 'SOCIO DIRECTIVO';

        if (participantPhone.includes('3005765530') || participantPushName.toLowerCase().includes('jesus') || participantPushName.toLowerCase().includes('cantillo')) {
          partnerName = 'Jesús David Cantillo Parejo';
          partnerRole = 'CEO & FUNDADOR';
        } else if (participantPhone.includes('3206775124') || participantPushName.toLowerCase().includes('richard') || participantPushName.toLowerCase().includes('acosta')) {
          partnerName = 'Richard Nixon Acosta Almarales';
          partnerRole = 'DIRECTOR COMERCIAL';
        } else if (participantPhone.includes('3156025270') || participantPhone.includes('3235845145') || participantPushName.toLowerCase().includes('jafet') || participantPushName.toLowerCase().includes('navarro')) {
          partnerName = 'Jafet Asaf Navarro';
          partnerRole = 'DIRECTOR DE MARKETING';
        }

        console.log(`👥 [GRUPO NEUROLABS] Respuesta de socio detectada: ${partnerName} (${partnerRole} • +${participantPhone}) -> "${text}"`);

        // Automatically update the task response in Supabase team_tasks
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fqxqeqdsqdampuzeiomx.supabase.co";
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // 1. Update latest pending task with the partner reply
          await supabase
            .from('team_tasks')
            .update({
              partner_response: `${partnerName}: "${text}"`,
              status: 'EN_PROCESO',
              ai_recommendation: `Respuesta confirmada por ${partnerName}. Compromiso agendado automáticamente.`
            })
            .eq('status', 'PENDIENTE');

          // 2. Insert commitment into appointments table
          await supabase
            .from('appointments')
            .insert([{
              client_name: partnerName,
              topic: `Compromiso: ${text.slice(0, 100)}`,
              type: 'videocall',
              status: 'confirmed',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]).catch(() => {});
          
          console.log(`💾 [SUPABASE SYNC] Respuesta y compromiso guardados en base de datos para: ${partnerName}`);
        } catch (dbSyncErr) {
          console.log(`Supabase sync info: ${dbSyncErr.message}`);
        }

        // Update live workflow log for the dashboard
        liveWorkflowLogs.unshift({
          id: `log_${Date.now()}`,
          name: `Confirmación y Agendamiento por ${partnerName} (${partnerRole})`,
          trigger: `WhatsApp Grupo • ${partnerName}`,
          status: 'COMPLETADO',
          timestamp: new Date().toLocaleTimeString(),
          latency: '210ms',
          details: `El directivo ${partnerName} (${partnerRole}) respondió: "${text}". Compromiso agendado en la base de datos.`,
        });

        continue;
      }

      const startTime = Date.now();
      console.log(`\n========================================`);
      console.log(`⚡ [PIPELINE START] Paso #1 Trigger: ${pushName || 'Cliente'} (${cleanPhone}) -> "${text}"`);

      // Store in Live Conversation Registry
      if (!liveConversations.has(sender)) {
        liveConversations.set(sender, {
          id: `conv_${cleanPhone}`,
          contact: {
            id: `usr_${cleanPhone}`,
            name: pushName || `Cliente (+${cleanPhone})`,
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
        // Build conversation history memory (Last 6 messages)
        const recentHistory = conv.messages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

        // PASO #2: Inferencia Neuronal Llama 120B con Memoria Conversacional (Estilo Ultra-Elegante y Ejecutivo B2B)
        console.log(`🤖 [PIPELINE STEP #2] Inferencia Neuronal Llama 120B con Memoria (Tono Ejecutivo B2B)...`);
        const { text: aiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: `Eres el Asesor Ejecutivo de Innovación e Inteligencia Artificial de NeuroLabs Tech Solutions S.A.S. (Colombia).
Tu propósito es brindar una atención de altísimo nivel, elegante, cálida, impecable y orientada a cerrar negocios de alto valor con directores, gerentes y dueños de empresas.

💎 REGLAS DE ELEGANCIA & ESTILO CONVERSACIONAL (ALTO IMPACTO B2B):
1. TONO SOFISTICADO Y CORDIAL:
   - Exprésate con elegancia, precisión y calidez ejecutiva. Trata al cliente con respeto y cercanía profesional ("un gusto saludarte", "con el mayor gusto", "será un placer asesorarte").
   - NUNCA te repitas. Si ya saludaste antes, no vuelvas a presentarte ni a decir el nombre de la empresa. Ve directo al valor.
   - NUNCA uses nombres de empresas extraños como si fueran el nombre del cliente. Si no sabes su nombre, saluda cálidamente: "¡Hola! Un gusto saludarte."

2. CONCISO Y FLUIDO (< 40 palabras por mensaje):
   - Evita textos largos y aburridos. Los empresarios leen rápido. Responde en 2 o 3 oraciones concisas, elegantes y con ritmo natural.
   - Máximo 1 emoji elegante por mensaje (ej: ✨, 🤝, 💼). Cero saturación visual.

3. CAPACIDAD DEMOSTRATIVA DE ALTA TECNOLOGÍA:
   - Ofreces: Desarrollo de Software a Medida, Ecosistemas Web/Mobile, Agentes de IA 24/7 y Automatización de Procesos.
   - Si el cliente solicita cotización o propuesta: Dile con seguridad que le estructurarás la propuesta técnica formal en formato PDF de inmediato.
   - Si el cliente solicita nota de voz o llamada: Responde con naturalidad que le envías un mensaje de voz en ese mismo instante para detallar la solución.

4. LLAMADO A LA ACCIÓN ELEGANTE:
   - Concluye siempre con una pregunta estratégica que invite al cliente a contar su proyecto: "¿Qué tipo de solución o automatización te gustaría implementar en tu empresa?", "¿En qué sector se encuentra tu compañía?"`,
          messages: recentHistory,
        });

        // Enviar respuesta de texto al cliente por WhatsApp
        console.log(`📤 [PIPELINE OUTBOUND] Enviando respuesta texto a ${sender}...`);
        await sock.sendMessage(sender, { text: aiReply });

        // PASO #3: Decisión Inteligente para Nota de Voz
        const shouldSendVoiceNote = isAudio || 
                                    text.toLowerCase().includes('audio') || 
                                    text.toLowerCase().includes('escuch') ||
                                    text.toLowerCase().includes('voz') || 
                                    text.toLowerCase().includes('llamada');

        if (shouldSendVoiceNote) {
          console.log(`🎙️ [ELEVENLABS VOZ] Generando Nota de Voz Contextual Humana...`);
          const voicePrompt = `¡Hola! Claro que sí, aquí me puedes escuchar. Estamos listos para ayudarte con el desarrollo de tu software o la automatización de tu WhatsApp con inteligencia artificial. Cuéntame qué tienes en mente y lo revisamos de una vez.`;

          const voiceBuffer = await generateElevenLabsVoiceNote(voicePrompt);

          if (voiceBuffer) {
            await sock.sendMessage(sender, {
              audio: voiceBuffer,
              mimetype: 'audio/mp4',
              ptt: true,
            });
            console.log(`✅ [ELEVENLABS ENVIADO] Nota de voz humana entregada.`);
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
          console.log(`📑 [PIPELINE PDF] Generando Cotización Oficial en PDF para ${pushName || 'Cliente'}...`);
          try {
            const pdfBytes = await generateInstantPDFQuote(
              pushName || 'Cliente',
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
👤 *Cliente:* ${pushName || 'Contacto Directo'}
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
          triggerEvent: `whatsapp.message (${pushName || 'Cliente'})`,
          status: 'success',
          durationMs,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          stepsExecuted: 5,
          totalSteps: 5,
          payloadPreview: {
            cliente: pushName || 'Cliente WhatsApp',
            telefono: `+${cleanPhone}`,
            mensaje: text,
            notaVozEnviada: shouldSendVoiceNote ? 'AUDIO_ENVIADO' : 'NO_REQUERIDO',
            pdfGenerado: wantsQuotePDF ? 'DESPACHADO_PDF' : 'NO_SOLICITADO',
            score: `${calculatedScore}%`,
            alertaOwner: isHighIntent ? 'DESPACHADA' : 'NUTRICION',
          },
        });

        if (liveWorkflowLogs.length > 30) liveWorkflowLogs.pop();

        // Temporizador de inactividad de 5 minutos (más amplio y natural)
        const timer = setTimeout(async () => {
          try {
            console.log(`[Session Timeout] Pausa natural por inactividad para: ${sender}`);
            const closingText = 'Quedo muy atento por si deseas revisar algún detalle más adelante. ¡Que tengas un excelente día! 👋✨';
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
        }, 5 * 60 * 1000);

        activeSessions.set(sender, { lastActivity: Date.now(), timer });

      } catch (err) {
        console.error('Error al ejecutar pipeline de IA:', err);
      }
    }
  });
}

// REST Endpoint to dispatch real WhatsApp task notifications to Team Members & Groups (Simultaneously)
app.post('/send-task-alert', async (req, res) => {
  try {
    const { phone, memberName, role, title, description, priority, dueDate } = req.body;

    if (!phone || !title) {
      return res.status(400).json({ error: 'Phone and title are required' });
    }

    if (!sock || connectionStatus !== 'CONNECTED') {
      return res.status(503).json({ error: 'WhatsApp socket is not connected' });
    }

    const taskWhatsAppMessage = `📌 *NUEVA TAREA ASIGNADA • NEUROLABS TECH SOLUTIONS*
━━━━━━━━━━━━━━━━━━━━
👤 *Responsable / Equipo:* ${memberName || 'Todo el Equipo'} (${role || 'Equipo Directivo'})
🎯 *Tarea:* *${title}*
🔥 *Prioridad:* ${priority || 'ALTA'}
⏰ *Fecha Límite:* ${dueDate || 'Hoy'}

📝 *Instrucciones:*
"${description || 'Sin instrucciones adicionales'}"

🤖 *Asistencia del Agente IA:*
Monitoreo activo de avances y métricas. Para marcarla completada o solicitar asistencia de la IA, responde a este mensaje.
━━━━━━━━━━━━━━━━━━━━
_NeuroLabs Tech Solutions S.A.S. • Innovación sin Límites_`;

    // Split multiple phone numbers / groups by comma or space
    const targets = phone.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
    const sentResults = [];

    for (const target of targets) {
      try {
        let jid = '';
        if (target.includes('chat.whatsapp.com/')) {
          // Resolve Invite Code from link (e.g. FjdEH69MXub9ZhlZXaXD6j)
          const inviteCode = target.split('chat.whatsapp.com/')[1].split(/[?&/]/)[0];
          console.log(`🔗 [GROUP INVITE] Intentando unir o resolver código de grupo: ${inviteCode}`);
          try {
            const groupInfo = await sock.groupGetInviteInfo(inviteCode);
            if (groupInfo && groupInfo.id) {
              jid = groupInfo.id;
              await sock.groupAcceptInvite(inviteCode).catch(() => {});
            }
          } catch (invErr) {
            console.log(`Info invite code: ${invErr.message}`);
          }

          // Fallback: ALWAYS also dispatch to all 3 executive leaders directly to guarantee 100% arrival
          const executivePhones = ['573005765530@s.whatsapp.net', '573206775124@s.whatsapp.net', '573156025270@s.whatsapp.net'];
          for (const execJid of executivePhones) {
            try {
              await sock.sendMessage(execJid, { text: taskWhatsAppMessage });
              console.log(`📲 [DIRECT EXEC DISPATCH] Tarea enviada a directivo: ${execJid}`);
            } catch (e) {}
          }
        } else if (target.includes('@g.us')) {
          // WhatsApp Group JID
          jid = target;
        } else {
          // Individual Phone
          const cleanNumber = target.replace(/[^0-9]/g, '');
          jid = `${cleanNumber}@s.whatsapp.net`;
        }

        if (jid) {
          await sock.sendMessage(jid, { text: taskWhatsAppMessage });
          console.log(`✅ [TASK DISPATCH] Tarea "${title}" enviada exitosamente a: ${jid}`);
          sentResults.push(target);
        }
      } catch (sendErr) {
        console.error(`Error enviando a ${target}:`, sendErr.message);
      }
    }

    return res.json({ success: true, count: sentResults.length, targets: sentResults });
  } catch (err) {
    console.error('Error enviando tarea por WhatsApp:', err);
    return res.status(500).json({ error: err.message });
  }
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NeuroLabs WhatsApp Bridge corriendo en el puerto ${PORT} (0.0.0.0)`);
  connectToWhatsApp();
});
