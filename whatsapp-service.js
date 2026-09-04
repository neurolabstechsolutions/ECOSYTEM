const express = require('express');
const cors = require('cors');
const fs = require('fs');
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
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      console.log('⚠️ [WHATSAPP CLOSED] Código de estado:', statusCode, 'LoggedOut:', isLoggedOut);

      connectionStatus = 'DISCONNECTED';
      connectedNumber = null;

      if (isLoggedOut) {
        console.log('🗑️ Sesión cerrada en celular. Limpiando credenciales y generando nuevo QR...');
        try {
          fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        } catch (e) {
          console.warn('Error limpiando auth_info_baileys:', e.message);
        }
      }

      setTimeout(() => {
        console.log('🔄 Reconectando socket de WhatsApp Trinova...');
        connectToWhatsApp();
      }, 3000);
    } else if (connection === 'open') {
      connectionStatus = 'CONNECTED';
      connectedNumber = sock.user?.id?.split(':')[0] || '573005765530';
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
Representas directamente a la Administradora Titular (Yury Jaramillo) y al equipo comercial de la empresa.

MISIÓN Y OBJETIVO COMERCIAL:
YJD TRINOVA S.A.S. es una firma empresarial de intermediación, corretaje mercantil y comercialización de:
1. 🚗 Vehículos y Camionetas SUV (Nuevos y Seminuevos Certificados con Peritaje de 150 Puntos).
2. 🏍️ Motocicletas de Alto Cilindraje y Líneas Deportivas / Naked / Touring.
3. 🏢 Bienes Raíces & Finca Raíz de Alta Gama (Venta & Renta: Casas, Apartamentos, Penthouses, Locales).
4. 📄 Consignación Segura & Corretaje Notarial (Para personas que quieren vender su vehículo o propiedad al mejor precio).

ESTADO ACTUAL DEL CATÁLOGO:
Estamos actualmente en fase de recepción, peritaje técnico de 150 puntos y carga de nuevas unidades exclusivas al inventario oficial. Por tanto:
- Conversa con total cercanía, educación, calidez y profesionalismo con el cliente.
- NO inventes datos técnicos rígidos ni especulaciones.
- Pregúntale al cliente con interés genuino qué busca: ¿Qué tipo de vehículo (carro, SUV, moto) o propiedad (apartamento, casa, penthouse) tiene en mente, y qué presupuesto aproximado maneja?

PROTOCOLO DE ATENCIÓN Y AGENDAMIENTO DE CITAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO 1: COMPRADORES & CLIENTES INTERESADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Saluda cordialmente y escucha la necesidad del cliente.
2. Explícale que en YJD TRINOVA todas las unidades cuentan con peritaje certificado de 150 puntos (motor, caja, chasis, pintura) y garantía legal sin gravámenes.
3. Pídele amablemente sus datos de contacto para registrar su solicitud en el sistema:
   • Nombre completo
   • WhatsApp / Teléfono
   • Correo electrónico real (para enviarle el catálogo oficial, confirmaciones y cotizaciones)
   • Ciudad donde se encuentra
4. 🎯 CIERRE PROACTIVO: Ofrécele agendar una Cita Presencial en nuestra Sede Principal en Barranquilla o una Asesoría Telefónica Prioritaria con la titular Yury Jaramillo para revisar opciones que se ajusten a su presupuesto.
5. Cuando el cliente te dé sus datos o fecha/hora de preferencia, CONFIRMA LA CITA con este formato limpio:
   "📅 *¡CITA AGENDADA CON ÉXITO!* ✨

   • *Cliente:* [Nombre completo]
   • *Teléfono / WhatsApp:* [Número del cliente]
   • *Correo:* [Correo real del cliente]
   • *Interés / Búsqueda:* [Qué vehículo o propiedad busca / presupuesto]
   • *Fecha y Hora:* [Día y Hora acordada]
   • *Lugar:* Sede Principal YJD Trinova (Barranquilla) o Asesoría Prioritaria
   • *Asesora Asignada:* Yury Jaramillo (Titular)

   Nuestro equipo comercial ha registrado tu cita y te estará esperando puntualmente para brindarte la mejor atención. ¡Te esperamos!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO 2: PROPIETARIOS / CONSIGNANTES (Desean vender su carro, moto o inmueble)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dale una cálida bienvenida al Programa de Corretaje Mercantil e Intermediación Segura de YJD TRINOVA S.A.S.
2. Solicita los datos del bien:
   • Tipo de bien (Carro, Moto o Propiedad)
   • Marca, Modelo y Año
   • Precio esperado en Pesos Colombianos (COP)
   • Ciudad y Placa (si aplica)
3. Solicita sus datos de contacto (Nombre completo, Teléfono, Correo real y Cédula/NIT).
4. Invítale a enviar de 2 a 4 fotos por este mismo WhatsApp para iniciar la pre-evaluación y peritaje.
5. Confírmale que su solicitud ha sido ingresada al sistema y que la titular Yury Jaramillo coordinará la revisión.

REGLAS DE FORMATO PARA WHATSAPP:
- CERO formato markdown complejo (NO uses ###, NO uses **, NO uses tablas).
- Usa ÚNICAMENTE negrita simple de WhatsApp (*palabra*) y viñetas con punto (•).
- Mensajes claros, elegantes, concisos y fáciles de leer en celular.
- ESTÁS AISLADO: NO hables de desarrollo de software ni programación.`;

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

        // 2. Nota de voz inteligente con ElevenLabs si aplica
        const shouldSendVoiceNote = isAudio || 
                                    text.toLowerCase().includes('audio') || 
                                    text.toLowerCase().includes('escuch') ||
                                    text.toLowerCase().includes('voz') || 
                                    text.toLowerCase().includes('llamada');

        if (shouldSendVoiceNote) {
          try {
            console.log(`🎙️ [ELEVENLABS] Generando Nota de Voz para Trinova...`);
            const voicePrompt = `¡Hola! Con el mayor gusto te atiendo desde YJD Trinova. Cuéntame qué modelo o tipo de vehículo estás buscando, o si deseas consignar y vender tu vehículo con nosotros, para brindarte asesoría personalizada.`;

            const voiceBuffer = await generateElevenLabsVoiceNote(voicePrompt);
            if (voiceBuffer) {
              await sock.sendMessage(sender, {
                audio: voiceBuffer,
                mimetype: 'audio/mp4',
                ptt: true,
              });
              console.log(`✅ [VOZ ENVIADA] Nota de voz comercial entregada.`);
            }
          } catch (vErr) {
            console.warn('Error enviando nota de voz:', vErr.message);
          }
        }

        // 3. Ficha Comercial en PDF para Trinova si el usuario la pide
        const wantsQuotePDF = text.toLowerCase().includes('cotiz') || 
                              text.toLowerCase().includes('pdf') || 
                              text.toLowerCase().includes('ficha') ||
                              text.toLowerCase().includes('propuesta');

        if (wantsQuotePDF) {
          console.log(`📑 [PDF TRINOVA] Generando Ficha Comercial Oficial para ${pushName || 'Cliente'}...`);
          try {
            const pdfBytes = await generateInstantPDFQuote(
              pushName || 'Cliente Interesado',
              'Portafolio Oficial Garantizado con Peritaje de 150 Puntos',
              'A convenir según modelo seleccionado',
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

        // 4. Extracción de Datos, Registro en Supabase y Reporte de Cita a +57 323 5845145
        try {
          const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
          const tenantId = tenant?.id || null;

          // Extracción Inteligente de Nombre Real
          let extractedName = null;
          const nameMatch = text.match(/(?:mi nombre es|me llamo|soy|nombre[:\s*]+)\s*([A-Za-zÀ-ÿ\s]{3,35})/i);
          if (nameMatch) {
            extractedName = nameMatch[1].replace(/(?:y mi|con|cedula|cc|telefono|mi cc).*/i, '').trim();
          }
          const ownerName = extractedName || (pushName && pushName !== 'Cliente' ? pushName : `Cliente (+${cleanPhone.slice(-4)})`);

          // Extracción Inteligente de Correo Real
          const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
          const ownerEmail = emailMatch ? emailMatch[1].trim().toLowerCase() : null;

          // Extracción Inteligente de Cédula Real
          let extractedDoc = null;
          const docMatch = text.match(/(?:c[eé]dula|cc|c\.c\.|nit|documento|identificaci[oó]n)[:\s*]+([0-9\.\s-]+)/i) ||
                           text.match(/\b([1-9][0-9]{6,9})\b/);
          if (docMatch) {
            extractedDoc = docMatch[1].trim();
          }
          const docNumber = extractedDoc ? `CC ${extractedDoc.replace(/[^0-9]/g, '')}` : 'CC En Validación';

          // Detección de rol (Consignante vs Comprador)
          const isConsignmentData = text.toLowerCase().includes('vender') || 
                                    text.toLowerCase().includes('consignar') || 
                                    text.toLowerCase().includes('mandato') ||
                                    text.toLowerCase().includes('placa') ||
                                    (text.toLowerCase().includes('marca') && text.toLowerCase().includes('modelo'));

          const roleType = isConsignmentData ? 'PROPIETARIO_CONSIGNANTE' : 'COMPRADOR';

          // 1. Guardar o actualizar contacto con Teléfono Real (+cleanPhone)
          let { data: contact } = await supabase.from('contacts').select('id, email, doc_number, name').eq('phone', `+${cleanPhone}`).single();
          
          if (!contact) {
            const { data: newContact } = await supabase.from('contacts').insert({
              tenant_id: tenantId,
              name: ownerName,
              phone: `+${cleanPhone}`,
              email: ownerEmail || 'Pendiente por registrar',
              doc_number: docNumber,
              person_type: 'PERSONA_NATURAL',
              role_type: roleType,
              city: 'Barranquilla',
              status: 'ACTIVO'
            }).select('id, email, doc_number, name').single();
            contact = newContact;
          } else {
            const updatePayload = {
              status: 'ACTIVO',
              role_type: roleType
            };
            if (ownerName && ownerName !== contact.name && !ownerName.includes('Cliente (+')) updatePayload.name = ownerName;
            if (ownerEmail) updatePayload.email = ownerEmail;
            if (extractedDoc) updatePayload.doc_number = docNumber;
            await supabase.from('contacts').update(updatePayload).eq('id', contact.id);
          }

          // Detección de Ticket de Cita Oficial en la Respuesta de la IA
          const hasConfirmedTicket = aiReply.includes('CITA AGENDADA') || aiReply.includes('CITA CONFIRMADA') || aiReply.includes('¡CITA AGENDADA');
          
          let ticketClientName = ownerName;
          let ticketDocNumber = docNumber;
          let ticketEmail = ownerEmail;
          let ticketItem = 'Vehículo / Inmueble Trinova';
          let ticketSchedule = 'Horario acordado';

          if (hasConfirmedTicket) {
            const nameFromReply = aiReply.match(/Cliente:\s*([^\n\r*]+)/i);
            const docFromReply = aiReply.match(/C[eé]dula:\s*([^\n\r*]+)/i);
            const emailFromReply = aiReply.match(/Correo:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
            const itemFromReply = aiReply.match(/(?:Bien|Veh[ií]culo|Inter[eé]s):\s*([^\n\r*]+)/i);
            const scheduleFromReply = aiReply.match(/Fecha y Hora:\s*([^\n\r*]+)/i);

            if (nameFromReply) ticketClientName = nameFromReply[1].trim();
            if (docFromReply) {
              const rawDoc = docFromReply[1].trim();
              ticketDocNumber = rawDoc.startsWith('CC') ? rawDoc : `CC ${rawDoc}`;
            }
            if (emailFromReply) ticketEmail = emailFromReply[1].trim().toLowerCase();
            if (itemFromReply) ticketItem = itemFromReply[1].trim();
            if (scheduleFromReply) ticketSchedule = scheduleFromReply[1].trim();

            console.log(`🎟️ [TICKET DE CITA CONFIRMADO]: ${ticketClientName} | ${ticketDocNumber} | ${ticketEmail || 'Sin correo'} | ${ticketSchedule}`);
          }

          // Detección de intención general de cita o interés calificado
          const isAppointmentIntent = text.toLowerCase().includes('cita') || 
                                      text.toLowerCase().includes('agend') || 
                                      text.toLowerCase().includes('visita') || 
                                      text.toLowerCase().includes('ver') || 
                                      text.toLowerCase().includes('probar') ||
                                      text.toLowerCase().includes('mañana') ||
                                      text.toLowerCase().includes('sábado') ||
                                      text.toLowerCase().includes('sabado') ||
                                      text.toLowerCase().includes('lunes');

          // Registrar Lead en Supabase Cloud
          if (contact) {
            const finalContactName = hasConfirmedTicket ? ticketClientName : ownerName;
            const finalContactDoc = hasConfirmedTicket ? ticketDocNumber : docNumber;
            const finalContactEmail = hasConfirmedTicket ? (ticketEmail || ownerEmail) : ownerEmail;
            const leadStatus = (hasConfirmedTicket || isAppointmentIntent) ? 'CITA_AGENDADA' : 'NUEVO';

            if (hasConfirmedTicket) {
              const contactUpdatePayload = {
                name: finalContactName,
                doc_number: finalContactDoc,
                status: 'ACTIVO',
                role_type: roleType
              };
              if (finalContactEmail) contactUpdatePayload.email = finalContactEmail;
              await supabase.from('contacts').update(contactUpdatePayload).eq('id', contact.id);
            }

            await supabase.from('leads').insert({
              tenant_id: tenantId,
              contact_id: contact.id,
              name: finalContactName,
              phone: `+${cleanPhone}`,
              interest_item_title: hasConfirmedTicket ? `${ticketItem} (${ticketSchedule})` : text.slice(0, 100),
              status: leadStatus,
              lead_score: hasConfirmedTicket ? 100 : (isAppointmentIntent ? 99 : 90),
              intent_level: 'ALTA'
            });

            // ───────────────────────────────────────────────────────────────────
            // 🚨 ENVIAR AVISO / REPORTE AL NÚMERO PROPIO DE LA EMPRESA (+57 323 5845145)
            // ───────────────────────────────────────────────────────────────────
            const isNotOwnAlert = !sender.includes('573235845145') || !text.includes('🚨');
            
            if (isNotOwnAlert && (hasConfirmedTicket || isAppointmentIntent || isConsignmentData || ownerEmail || extractedName)) {
              try {
                const alertTitle = hasConfirmedTicket 
                  ? '🚨 *NUEVA CITA AGENDADA EN YJD TRINOVA* 📅✨' 
                  : (isConsignmentData 
                      ? '🔑 *NUEVA SOLICITUD DE CONSIGNACIÓN* 📋' 
                      : '🛒 *NUEVO CLIENTE INTERESADO REGISTRADO* 💬');

                const alertMsg = `${alertTitle}

• *Tipo:* ${roleType === 'PROPIETARIO_CONSIGNANTE' ? '🔑 Vendedor / Consignante' : '🛒 Comprador Interesado'}
• *Cliente:* ${finalContactName}
• *Teléfono / WhatsApp:* +${cleanPhone}
• *Correo:* ${finalContactEmail || 'Pendiente por registrar'}
• *Cédula:* ${finalContactDoc}
• *Interés / Búsqueda:* ${ticketItem !== 'Vehículo / Inmueble Trinova' ? ticketItem : text.slice(0, 120)}
• *Fecha y Hora de Cita:* ${hasConfirmedTicket ? ticketSchedule : (isAppointmentIntent ? 'Por coordinar' : 'No solicitada')}
• *Ciudad:* Barranquilla
• *Último Mensaje:* "${text.slice(0, 150)}"

_Contacto sincronizado en tiempo real con el panel administrativo de Supabase._`;

                await sock.sendMessage(OWNER_PHONE, { text: alertMsg });
                console.log(`📲 [ALERTA DE CITA ENVIADA AL NÚMERO DE LA EMPRESA (+57 323 5845145)]`);
              } catch (alertErr) {
                console.warn('Error enviando alerta de cita a la empresa (+57 323 5845145):', alertErr.message);
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
