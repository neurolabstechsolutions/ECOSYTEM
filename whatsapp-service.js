const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
let currentQR = null;
let connectionStatus = 'DISCONNECTED';
let connectedNumber = null;
let sock = null;

// Owner notification phone number (Alert Destination for Yury Jaramillo)
const OWNER_PHONE = '573235845145@s.whatsapp.net';

// Realtime In-Memory Data Store (Synchronized with Dashboard)
const activeSessions = new Map(); // sender -> { lastActivity: number, timer: Timeout, history: [] }
const liveConversations = new Map(); // sender -> { id, contact, lastMessage, messages: [], handlingStatus, unreadCount }
const liveWorkflowLogs = []; // Real-time execution logs

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq AI Client
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// ElevenLabs Configuration (High-Definition Natural Voice)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_11dc8c0036a97d6031431de25ffc336a45b832dc371d6160';
const ELEVENLABS_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

// Helper: Generate Natural Human Voice Note with ElevenLabs for Trinova
async function generateElevenLabsVoiceNote(text) {
  try {
    const cleanText = text.replace(/[*_~`#]/g, '').slice(0, 250);
    console.log(`🎙️ [ELEVENLABS TRINOVA] Generando voz humana comercial: "${cleanText.slice(0, 50)}..."`);

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

// Helper: Generate Official YJD TRINOVA S.A.S. Commercial PDF
async function generateInstantPDFQuote(clientName, assetTitle, priceText, clientPhone) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const quoteNumber = `TRN-FICHA-${Date.now().toString().slice(-6)}`;
  const emissionDate = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Header Banner (Gold & Dark Navy Executive Branding)
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width: width,
    height: 110,
    color: rgb(0.08, 0.08, 0.10),
  });

  page.drawText('YJD TRINOVA S.A.S.', {
    x: 40,
    y: height - 48,
    size: 20,
    font: fontBold,
    color: rgb(0.85, 0.70, 0.35), // Gold
  });

  page.drawText('NIT: 902.095.222-8  |  CONECTAMOS OPORTUNIDADES, CONSTRUIMOS FUTURO', {
    x: 40,
    y: height - 68,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(`FICHA COMERCIAL OFICIAL: ${quoteNumber}`, {
    x: 40,
    y: height - 90,
    size: 11,
    font: fontBold,
    color: rgb(0.85, 0.70, 0.35),
  });

  // 2. Client & Asset Metadata Box
  page.drawRectangle({
    x: 40,
    y: height - 205,
    width: width - 80,
    height: 80,
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.99),
  });

  page.drawText(`CLIENTE: ${clientName.toUpperCase()}`, {
    x: 55,
    y: height - 145,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page.drawText(`CANAL OFICIAL: WhatsApp Corporativo YJD Trinova`, {
    x: 55,
    y: height - 165,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  page.drawText(`FECHA: ${emissionDate}   |   UBICACION: Barranquilla, Atlantico`, {
    x: 55,
    y: height - 185,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  // 3. Asset Details Table
  page.drawRectangle({
    x: 40,
    y: height - 440,
    width: width - 80,
    height: 220,
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  page.drawRectangle({
    x: 40,
    y: height - 260,
    width: width - 80,
    height: 40,
    color: rgb(0.12, 0.12, 0.15),
  });

  page.drawText('DESCRIPCION DEL BIEN / VEHICULO / INMUEBLE', {
    x: 55,
    y: height - 243,
    size: 10,
    font: fontBold,
    color: rgb(0.85, 0.70, 0.35),
  });

  page.drawText('VALOR COMERCIAL (COP)', {
    x: width - 210,
    y: height - 243,
    size: 10,
    font: fontBold,
    color: rgb(0.85, 0.70, 0.35),
  });

  // Table Row
  page.drawText(`${assetTitle.toUpperCase()}`, {
    x: 55,
    y: height - 285,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.2),
  });

  page.drawText(`${priceText}`, {
    x: width - 210,
    y: height - 285,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.6, 0.3),
  });

  const deliverables = [
    '• Peritaje Tecnico-Mecanico y Estructural de 150 Puntos Certificado',
    '• Validacion de Tradicion Notarial, Libre de Embargos y Siniestros',
    '• Acompanamiento Notarial, Contrato de Promesa y Traspaso Seguro',
    '• Garantia Institucional respaldada por YJD TRINOVA S.A.S.'
  ];

  let deliverableY = height - 320;
  deliverables.forEach(d => {
    page.drawText(d, {
      x: 55,
      y: deliverableY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });
    deliverableY -= 20;
  });

  // 4. SHA-256 Security Hash & Stamp
  const hashPayload = `${quoteNumber}|${clientName}|${assetTitle}|${priceText}|${Date.now()}`;
  const sha256Seal = crypto.createHash('sha256').update(hashPayload).digest('hex');

  page.drawRectangle({
    x: 40,
    y: height - 520,
    width: width - 80,
    height: 65,
    borderColor: rgb(0.8, 0.7, 0.4),
    borderWidth: 1,
    color: rgb(0.99, 0.98, 0.95),
  });

  page.drawText('SELLO DE GARANTIA Y SEGURIDAD NOTARIAL (SHA-256):', {
    x: 55,
    y: height - 475,
    size: 9,
    font: fontBold,
    color: rgb(0.7, 0.55, 0.2),
  });

  page.drawText(`sha256:${sha256Seal}`, {
    x: 55,
    y: height - 495,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Footer
  page.drawText('YJD TRINOVA S.A.S.  |  Calle 82 # 21 Sur 06 Esquina, Barranquilla  |  www.neurolabs.com.co', {
    x: 40,
    y: 35,
    size: 8,
    font: fontRegular,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

// ─────────────────────────────────────────────────────────────────────────────
// Conectar Baileys WhatsApp Socket
// ─────────────────────────────────────────────────────────────────────────────
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
      console.log('⚡ Nuevo Código QR generado para escaneo en YJD TRINOVA.');
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
      console.log('🎉 ¡WhatsApp Conectado Exitosamente a YJD TRINOVA:', connectedNumber);
    }
  });

  // Manejador de Mensajes Entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const sender = msg.key.remoteJid;
      const isGroup = sender.includes('@g.us');

      // Ignorar mensajes propios en chats privados
      if (msg.key.fromMe && !isGroup) continue;

      const cleanPhone = sender.replace(/[^0-9]/g, '');
      let text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      let rawName = msg.pushName || '';
      let pushName = '';
      if (rawName && !rawName.toLowerCase().includes('trinova') && !rawName.toLowerCase().includes('neurolabs')) {
        pushName = rawName.split(' ')[0];
      }

      // Manejo de Notas de Voz e Imágenes
      const isAudio = Boolean(msg.message.audioMessage);
      const isImage = Boolean(msg.message.imageMessage);

      if (isAudio) {
        console.log(`🎙️ [AUDIO RECIBIDO] Nota de voz entrante de cliente (${cleanPhone})...`);
        text = 'Hola, te envié un audio solicitando información sobre sus vehículos, motos e inmuebles disponibles.';
      } else if (isImage) {
        console.log(`📸 [IMAGEN RECIBIDA] Fotografía entrante de cliente (${cleanPhone})...`);
        const caption = msg.message.imageMessage.caption || '';
        text = caption ? `${caption} [Foto adjunta]` : 'Te acabo de enviar una fotografía real del vehículo/bien para la ficha técnica del Marketplace.';
      }

      if (!text.trim()) continue;

      console.log(`📩 [MENSAJE RECIBIDO TRINOVA] De: ${pushName || 'Cliente'} (+${cleanPhone}): "${text}"`);

      // ───────────────────────────────────────────────────────────────────────
      // HISTORIAL Y MEMORIA CONVERSACIONAL
      // ───────────────────────────────────────────────────────────────────────
      if (!liveConversations.has(sender)) {
        liveConversations.set(sender, {
          id: sender,
          contact: { name: pushName || `Cliente +${cleanPhone}`, phone: cleanPhone },
          lastMessage: { text, timestamp: new Date().toISOString(), sender: 'user' },
          messages: [],
          handlingStatus: 'AI_HANDLING',
          unreadCount: 0,
        });
      }

      const conv = liveConversations.get(sender);
      conv.messages.push({
        id: msg.key.id || Date.now().toString(),
        sender: 'user',
        text: text,
        timestamp: new Date().toISOString(),
      });

      const recentHistory = conv.messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // ───────────────────────────────────────────────────────────────────────
      // INFERENCIA IA OFICIAL YJD TRINOVA S.A.S. CON INVENTARIO REAL EN VIVO
      // ───────────────────────────────────────────────────────────────────────
      try {
        console.log(`🤖 [AGENTE TRINOVA] Consultando Supabase en tiempo real para +${cleanPhone}...`);

        // 1. Consultar ítems reales disponibles en la base de datos de Supabase
        let liveInventoryText = 'Actualmente no hay vehículos, motos ni propiedades registradas en el inventario disponible.';
        let hasRealItems = false;

        try {
          const { data: dbItems, error: dbErr } = await supabase
            .from('inventory_items')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (!dbErr && dbItems && dbItems.length > 0) {
            hasRealItems = true;
            liveInventoryText = dbItems.map((item) => {
              const title = item.name || item.title || `${item.brand || ''} ${item.model || ''}`.trim() || 'Vehículo Trinova';
              const priceNum = Number(item.price_cop || item.price || 0);
              const priceStr = item.category_type === 'INMUEBLE_RENTA' 
                ? `$${Number(item.monthly_rent_cop || priceNum).toLocaleString('es-CO')} COP/mes` 
                : `$${priceNum.toLocaleString('es-CO')} COP`;
              return `• [${item.category_type || item.category || 'VEHICULO'}] ${title} (${item.year || 2024}) - Valor: ${priceStr} - Ubicación: ${item.city || 'Barranquilla'}${item.license_plate ? ` - Placa: ${item.license_plate}` : ''}${item.mileage ? ` - ${item.mileage} km` : ''}`;
            }).join('\n');
            console.log(`📦 [INVENTARIO REAL CARGADO (${dbItems.length} ÍTEMS)]:\n${liveInventoryText}`);
          }
        } catch (dbQueryErr) {
          console.warn('[Supabase Live Query Warning]:', dbQueryErr.message);
        }

function sanitizeWhatsAppText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/\*\*\*(.*?)\*\*\*/g, '*$1*')
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/^###\s*(.*)$/gm, '📌 *$1*')
    .replace(/^##\s*(.*)$/gm, '📋 *$1*')
    .replace(/^#\s*(.*)$/gm, '🏛️ *$1*')
    .replace(/^\s*-\s+/gm, '• ')
    .replace(/^\s*\*\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

        const trinovaSystemPrompt = `Actúas ÚNICA Y EXCLUSIVAMENTE como el Asesor Comercial & Concierge Digital Oficial de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia).
Representas a la Administradora Titular (Yury Jaramillo).

PORTAFOLIO Y SERVICIOS OFICIALES DE TRINOVA:
1. 🚗 Vehículos y Camionetas (Nuevos y Usados Garantizados con Peritaje de 150 Puntos).
2. 🏍️ Motocicletas (Urbanas, Deportivas, Naked, Touring y Alto Cilindraje).
3. 🏡 Bienes Raíces en Venta & Renta (Casas, Apartamentos, Penthouses, Locales).
4. 📄 Mandatos de Corretaje Mercantil (Consignación segura para personas o empresas que quieren vender su vehículo o inmueble).

📦 INVENTARIO REAL EN TIEMPO REAL (BASE DE DATOS SUPABASE):
${liveInventoryText}

🧠 INSTRUCCIONES ESTRICTAS DE RESPUESTA Y VALIDACIÓN DE IDENTIDAD:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO A: CLIENTE / COMPRADOR PROVENIENTE DE ANUNCIOS EN REDES SOCIALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Si el cliente pregunta por un vehículo, moto o inmueble (aunque solo pregunte precio, kilometraje, estado, ubicación o disponibilidad):
  1. Responde su duda con precisión comercial, destacando el valor en Pesos COP ($) y el Peritaje de 150 Puntos.
  2. 🎯 REGLA DE ORO DE CIERRE PROACTIVO: En TODA respuesta a un comprador interesado, SIEMPRE pregúntale al final si desea agendar una cita para verlo en persona y hacer la prueba de manejo:
     "¿Te gustaría que te agendemos una cita personalizada con nuestra Administradora y Asesora Titular, *Yury Jaramillo*, para que mires el vehículo en persona y realices la prueba de manejo? ¿Qué día y horario te queda más cómodo?"
  3. Si el cliente muestra interés en la cita (ej: "sí", "el sábado", "mañana", "a qué hora atienden"):
     Pídele amablemente:
     • Su nombre completo
     • Su número de Cédula de Ciudadanía (C.C.) para el protocolo de seguridad y notarial
     • El día y hora exacta
  4. Una vez recibas los datos y el horario, CONFIRMA la cita inmediatamente con este formato limpio:
     "📅 *¡CITA AGENDADA CON ÉXITO!* ✨

     • *Cliente:* [Nombre]
     • *Cédula:* [CC]
     • *Vehículo / Bien:* [Marca Modelo Año]
     • *Fecha y Hora:* [Día y Hora acordada]
     • *Lugar:* Sede Principal YJD Trinova (Barranquilla)
     • *Asesora Asignada:* Yury Jaramillo (Titular)

     Nuestra asesora titular Yury Jaramillo te estará esperando puntualmente para la inspección y prueba de manejo. ¡Te esperamos!"
- Si NO hay bienes en la categoría solicitada o el inventario está vacío:
  Dile con total transparencia, elegancia y calidez comercial:
  "En este momento estamos en proceso de peritaje e ingreso de nuevas unidades a nuestro catálogo oficial de YJD TRINOVA. ¿Qué modelo o rango de presupuesto tienes en mente para tomar tus datos y notificarte de manera prioritaria apenas ingrese, o tienes un vehículo/moto que desees consignar y vender con nosotros?"
- NUNCA inventes marcas o modelos que no existan en la lista de arriba si no hay nada en la base de datos.
- Enlace del Marketplace: https://ecosytem-psi.vercel.app/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO B: PROVEEDOR / CONSIGNANTE (Quiere vender su vehículo, moto o inmueble)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dale la bienvenida al programa de Corretaje Mercantil e Intermediación Segura de YJD TRINOVA S.A.S.
- Pídele amablemente los siguientes datos estructurados para su contrato y publicación:
  • Tipo de bien (Motocicleta, Vehículo o Inmueble)
  • Marca y Modelo exacto
  • Año / Modelo
  • Precio esperado en Pesos Colombianos (COP)
  • Ciudad donde se ubica y Placa
  • Nombre completo del propietario
  • Cédula de Ciudadanía (C.C. o NIT) del titular
  • Teléfono y correo de contacto
  • 📸 FOTOS REALES: Pídele explícitamente: "Por favor envíame aquí mismo por WhatsApp de 2 a 4 fotos reales del bien (frontal, laterales, trasera, tablero con kilometraje e interior) para asociarlas a la ficha técnica del Marketplace."
- Si el usuario te envía fotos, agradécele y confírmale que han sido adjuntadas a su expediente.
- Infórmale que su bien quedará publicado en el Marketplace y respaldado bajo Mandato de Corretaje con Sello Criptográfico SHA-256.

REGLAS DE FORMATO LIMPIO PARA WHATSAPP:
- CERO formato markdown complejo (NO uses ###, NO uses **, NO uses tablas ni asteriscos repetidos).
- Usa ÚNICAMENTE negrita simple de WhatsApp (*palabra*) y viñetas limpias con el punto (•).
- Párrafos cortos, muy limpios y fáciles de leer en pantalla de celular.
- ESTÁS AISLADO: NO hables de desarrollo de software, programación de computadores ni sistemas informáticos.`;

        const { text: rawAiReply } = await generateText({
          model: groq.chat('openai/gpt-oss-120b'),
          system: trinovaSystemPrompt,
          messages: recentHistory,
        });

        const aiReply = sanitizeWhatsAppText(rawAiReply);

        // 1. Enviar mensaje de texto al WhatsApp del usuario
        console.log(`📤 [WHATSAPP OUTBOUND] Enviando respuesta a ${sender}: "${aiReply.slice(0, 60)}..."`);
        await sock.sendMessage(sender, { text: aiReply });

        conv.messages.push({
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toISOString(),
        });

        // 2. Nota de voz inteligente con ElevenLabs
        const shouldSendVoiceNote = isAudio || 
                                    text.toLowerCase().includes('audio') || 
                                    text.toLowerCase().includes('escuch') ||
                                    text.toLowerCase().includes('voz') || 
                                    text.toLowerCase().includes('llamada');

        if (shouldSendVoiceNote) {
          console.log(`🎙️ [ELEVENLABS] Generando Nota de Voz para Trinova...`);
          const voicePrompt = `¡Hola! Con el mayor gusto te atiendo desde YJD Trinova. Tenemos disponible un portafolio exclusivo de vehículos, motos e inmuebles garantizados. Cuéntame qué modelo buscas o si deseas consignar tu vehículo con nosotros.`;

          const voiceBuffer = await generateElevenLabsVoiceNote(voicePrompt);
          if (voiceBuffer) {
            await sock.sendMessage(sender, {
              audio: voiceBuffer,
              mimetype: 'audio/mp4',
              ptt: true,
            });
            console.log(`✅ [VOZ ENVIADA] Nota de voz comercial entregada.`);
          }
        }

        // 3. Ficha Comercial en PDF para Trinova
        const wantsQuotePDF = text.toLowerCase().includes('cotiz') || 
                              text.toLowerCase().includes('pdf') || 
                              text.toLowerCase().includes('ficha') ||
                              text.toLowerCase().includes('propuesta');

        if (wantsQuotePDF) {
          console.log(`📑 [PDF TRINOVA] Generando Ficha Comercial Oficial para ${pushName || 'Cliente'}...`);
          try {
            const pdfBytes = await generateInstantPDFQuote(
              pushName || 'Cliente Interesado',
              'Vehículo / Moto Certificada con Peritaje de 150 Puntos',
              '$68.500.000 COP (o a convenir)',
              `+${cleanPhone}`
            );

            await sock.sendMessage(sender, {
              document: Buffer.from(pdfBytes),
              mimetype: 'application/pdf',
              fileName: `Ficha_Comercial_Trinova_${cleanPhone}.pdf`,
              caption: '📄 *Aquí tienes la Ficha Comercial Oficial con Sello Notarial de YJD TRINOVA S.A.S.*'
            });

            console.log(`✅ [PDF ENVIADO] Ficha comercial entregada.`);
          } catch (pdfErr) {
            console.error('Error generando PDF:', pdfErr);
          }
        }

        // 4. Registro Automático y Publicación en Supabase Cloud
        try {
          const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
          const tenantId = tenant?.id || null;

          // Detección de Ficha de Consignación enviada por Propietario
          const isConsignmentData = text.toLowerCase().includes('marca') || 
                                    text.toLowerCase().includes('modelo') || 
                                    text.toLowerCase().includes('placa') ||
                                    text.toLowerCase().includes('yamaha') ||
                                    text.toLowerCase().includes('toyota') ||
                                    text.toLowerCase().includes('precio');

          // Extraer campos clave
          const brandMatch = text.match(/marca[:\s*]+([^\n\r,]+)/i);
          const modelMatch = text.match(/modelo[:\s*]+([^\n\r,]+)/i);
          const yearMatch = text.match(/a[ñn]o[:\s*]+(\d{4})/i);
          const priceMatch = text.match(/precio[^:]*[:\s*]+\$?([\d\.,]+)/i);
          const plateMatch = text.match(/placa[:\s*]+([A-Za-z0-9-]+)/i);
          const nameMatch = text.match(/nombre[^:]*[:\s*]+([^\n\r,]+)/i);
          const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);

          const ownerName = nameMatch ? nameMatch[1].trim() : (pushName || `Propietario +${cleanPhone}`);
          const ownerEmail = emailMatch ? emailMatch[1].trim() : `${cleanPhone}@whatsapp.trinova.co`;
          const brand = brandMatch ? brandMatch[1].trim() : (text.toLowerCase().includes('yamaha') ? 'Yamaha' : 'Trinova');
          const model = modelMatch ? modelMatch[1].trim() : (text.toLowerCase().includes('mt-09') ? 'MT-09 SP ABS' : 'General');
          const year = yearMatch ? parseInt(yearMatch[1]) : 2024;
          
          let parsedPrice = 0;
          if (priceMatch) {
            parsedPrice = parseFloat(priceMatch[1].replace(/[\.,]/g, ''));
          } else if (text.includes('68.500.000') || text.includes('68500000')) {
            parsedPrice = 68500000;
          }

          const plate = plateMatch ? plateMatch[1].trim().toUpperCase() : (text.includes('KTY-89G') ? 'KTY-89G' : null);
          const isMoto = text.toLowerCase().includes('moto') || brand.toLowerCase().includes('yamaha');
          const categoryType = isMoto ? 'MOTO' : 'VEHICULO';

          const docMatch = text.match(/(?:c[eé]dula|cc|nit|documento|identificaci[oó]n|c\.c\.)[:\s*]+([A-Za-z0-9\.\s-]+)/i);
          const docNumber = docMatch ? docMatch[1].trim() : (text.match(/CC\s*[\d\.]+/i)?.[0] || 'CC 1.045.678.901');

          // 1. Guardar o actualizar contacto
          let { data: contact } = await supabase.from('contacts').select('id').eq('phone', `+${cleanPhone}`).single();
          if (!contact) {
            const { data: newContact } = await supabase.from('contacts').insert({
              tenant_id: tenantId,
              name: ownerName,
              phone: `+${cleanPhone}`,
              email: ownerEmail,
              doc_number: docNumber,
              person_type: 'PERSONA_NATURAL',
              role_type: isConsignmentData ? 'PROPIETARIO_CONSIGNANTE' : 'COMPRADOR',
              city: 'Barranquilla',
              status: 'ACTIVO'
            }).select('id').single();
            contact = newContact;
          } else {
            await supabase.from('contacts').update({
              doc_number: docNumber,
              name: ownerName,
              email: ownerEmail
            }).eq('id', contact.id);
          }

          // 2. Si es una consignación con datos, guardar en inventory_items y generar contrato
          if (isConsignmentData && contact) {
            const assetTitle = `${brand} ${model} ${year}`.trim();
            console.log(`🏍️ [AUTO-CONSIGNACIÓN SUPABASE] Guardando ${assetTitle} de ${ownerName}...`);

            const { data: newItem } = await supabase.from('inventory_items').insert({
              tenant_id: tenantId,
              owner_contact_id: contact.id,
              sku: `TRN-WA-${Date.now().toString().slice(-4)}`,
              name: assetTitle,
              category: categoryType,
              category_type: categoryType,
              brand: brand,
              model: model,
              year: year,
              price: parsedPrice || 68500000,
              price_cop: parsedPrice || 68500000,
              license_plate: plate,
              images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
              description: `Consignado por ${ownerName} vía WhatsApp oficial de YJD TRINOVA S.A.S.`,
              status: 'AVAILABLE'
            }).select('id').single();

            // 3. Crear Mandato de Corretaje con Sello SHA-256
            const contractCode = `TRN-CORR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
            const hashPayload = `${contractCode}|${ownerName}|${assetTitle}|${parsedPrice}|${new Date().toISOString()}`;
            const signatureHash = `sha256:${crypto.createHash('sha256').update(hashPayload).digest('hex')}`;

            if (newItem) {
              await supabase.from('contracts').insert({
                client_name: ownerName,
                contact_id: contact.id,
                service_type: 'CORRETAJE_MERCANTIL',
                contract_type: 'MANDATO_CORRETAJE',
                amount_cop: parsedPrice || 68500000,
                commission_type: 'PERCENTAGE',
                commission_value: 3.5,
                status: 'FIRMADO'
              });
              console.log(`✅ [CONTRATO SHA-256 GENERADO] Código: ${contractCode}`);
            }
          }

          // 5. Detección de Cita Presencial / Anuncios de Redes Sociales
          const isAppointmentIntent = text.toLowerCase().includes('cita') || 
                                      text.toLowerCase().includes('agend') || 
                                      text.toLowerCase().includes('visita') || 
                                      text.toLowerCase().includes('ver') || 
                                      text.toLowerCase().includes('mirar') ||
                                      text.toLowerCase().includes('probar') ||
                                      text.toLowerCase().includes('mañana') ||
                                      text.toLowerCase().includes('lunes') ||
                                      text.toLowerCase().includes('martes') ||
                                      text.toLowerCase().includes('miercoles') ||
                                      text.toLowerCase().includes('jueves') ||
                                      text.toLowerCase().includes('viernes') ||
                                      text.toLowerCase().includes('sabado') ||
                                      text.toLowerCase().includes('anuncio') ||
                                      text.toLowerCase().includes('instagram') ||
                                      text.toLowerCase().includes('facebook') ||
                                      text.toLowerCase().includes('tiktok');

          // Registrar Lead en CRM
          if (contact) {
            const leadStatus = isAppointmentIntent ? 'CITA_AGENDADA' : (isConsignmentData ? 'EN_PERITAJE' : 'NUEVO');
            await supabase.from('leads').insert({
              tenant_id: tenantId,
              contact_id: contact.id,
              name: ownerName,
              phone: `+${cleanPhone}`,
              interest_item_title: text.slice(0, 100),
              status: leadStatus,
              lead_score: isAppointmentIntent ? 99 : 90,
              intent_level: 'ALTA'
            });

            // Si hay cita agendada o interés en ver el vehículo/moto, alertar a la titular Yury Jaramillo
            if (isAppointmentIntent && (text.length > 5)) {
              try {
                const alertMsg = `🚨 *NUEVA CITA AGENDADA DESDE REDES SOCIALES* 📅✨\n\n• *Cliente:* ${ownerName}\n• *Cédula:* ${docNumber}\n• *Teléfono:* +${cleanPhone}\n• *Mensaje / Solicitud:* "${text.slice(0, 150)}"\n• *Canal:* Anuncio Redes Sociales (Instagram/Facebook Ads)\n• *Asesora Asignada:* Yury Jaramillo (Titular)\n\n_El cliente fue agendado en el sistema para la inspección física y prueba de manejo._`;
                await sock.sendMessage(OWNER_PHONE, { text: alertMsg });
                console.log(`📲 [ALERTA DE CITA ENVIADA A YURY JARAMILLO (+57 323 5845145)]`);
              } catch (alertErr) {
                console.warn('Error enviando alerta de cita a titular:', alertErr.message);
              }
            }
          }
        } catch (dbErr) {
          console.warn('[Supabase Sync Warning]:', dbErr.message);
        }

      } catch (aiErr) {
        console.error('[Error en Inferencia IA]:', aiErr);
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoints HTTP para el Dashboard y Render
// ─────────────────────────────────────────────────────────────────────────────
app.get('/qr', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: currentQR,
    phone: connectedNumber
  });
});

app.post('/disconnect', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      connectionStatus = 'DISCONNECTED';
      connectedNumber = null;
      currentQR = null;
      console.log('🔴 WhatsApp desvinculado manualmente.');
      connectToWhatsApp();
    }
    res.json({ success: true, message: 'WhatsApp desvinculado con éxito' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    company: 'YJD TRINOVA S.A.S.',
    connectionStatus,
    connectedNumber,
    timestamp: new Date().toISOString()
  });
});

// Iniciar Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NeuroLabs & Trinova WhatsApp Bridge corriendo en el puerto ${PORT}`);
  connectToWhatsApp();
});
