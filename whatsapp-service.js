require('dotenv').config();
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
// Sincronización Permanente de Credenciales WhatsApp con Supabase Cloud
// ─────────────────────────────────────────────────────────────────────────────
const AUTH_DIR = 'auth_info_baileys';
let saveAuthDebounceTimer = null;

async function restoreAuthFromSupabase() {
  try {
    const { data: record, error } = await supabase
      .from('contacts')
      .select('address')
      .eq('phone', '+570000000000')
      .maybeSingle();

    if (error || !record || !record.address) {
      console.log('ℹ️ [AUTH SYNC] No hay credenciales previas guardadas en Supabase.');
      return false;
    }

    let files;
    try {
      files = JSON.parse(record.address);
    } catch (parseErr) {
      console.warn('⚠️ [AUTH SYNC] Error parseando credenciales de Supabase:', parseErr.message);
      return false;
    }

    if (!files || !files['creds.json']) {
      console.log('ℹ️ [AUTH SYNC] Credenciales vacías o corruptas en Supabase.');
      return false;
    }

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    for (const [filename, content] of Object.entries(files)) {
      const filePath = `${AUTH_DIR}/${filename}`;
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    console.log(`✅ [AUTH SYNC] ¡Sesión de WhatsApp restaurada exitosamente desde Supabase Cloud! (${Object.keys(files).length} archivos cargados)`);
    return true;
  } catch (err) {
    console.warn('⚠️ [AUTH SYNC] Error restaurando sesión desde Supabase:', err.message);
    return false;
  }
}

async function saveAuthToSupabase() {
  if (saveAuthDebounceTimer) clearTimeout(saveAuthDebounceTimer);

  saveAuthDebounceTimer = setTimeout(async () => {
    try {
      if (!fs.existsSync(AUTH_DIR)) return;

      const fileList = fs.readdirSync(AUTH_DIR);
      if (fileList.length === 0 || !fileList.includes('creds.json')) return;

      const payload = {};
      for (const file of fileList) {
        const filePath = `${AUTH_DIR}/${file}`;
        if (fs.statSync(filePath).isFile()) {
          payload[file] = fs.readFileSync(filePath, 'utf-8');
        }
      }

      const stringifiedPayload = JSON.stringify(payload);
      const tenantId = '0814ddb6-1ad3-4f76-873e-d4c0e52c710a';

      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('phone', '+570000000000')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('contacts')
          .update({ address: stringifiedPayload, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('contacts')
          .insert({
            tenant_id: tenantId,
            name: '__WHATSAPP_AUTH_STATE__',
            phone: '+570000000000',
            email: 'auth_system@trinova.local',
            doc_number: 'SYSTEM_AUTH',
            person_type: 'PERSONA_JURIDICA',
            role_type: 'PROPIETARIO_CONSIGNANTE',
            city: 'Barranquilla',
            status: 'ACTIVO',
            address: stringifiedPayload
          });
      }

      console.log(`☁️ [AUTH SYNC] Sesión de WhatsApp respaldada permanentemente en Supabase Cloud (${fileList.length} archivos).`);
    } catch (err) {
      console.warn('⚠️ [AUTH SYNC] Error guardando sesión en Supabase:', err.message);
    }
  }, 1200);
}

async function clearAuthInSupabase() {
  try {
    await supabase
      .from('contacts')
      .update({ address: null, updated_at: new Date().toISOString() })
      .eq('phone', '+570000000000');
    console.log('🗑️ [AUTH SYNC] Credenciales eliminadas de Supabase Cloud.');
  } catch (err) {
    console.warn('Error limpiando credenciales en Supabase:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conectar Baileys WhatsApp Socket
// ─────────────────────────────────────────────────────────────────────────────
async function connectToWhatsApp() {
  await restoreAuthFromSupabase();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    saveAuthToSupabase();
  });

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
        await clearAuthInSupabase();
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
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
      saveAuthToSupabase();
    }
  });

function extractMessageText(msg) {
  if (!msg || !msg.message) return '';
  const m = msg.message;
  return m.conversation ||
         m.extendedTextMessage?.text ||
         m.ephemeralMessage?.message?.extendedTextMessage?.text ||
         m.ephemeralMessage?.message?.conversation ||
         m.viewOnceMessage?.message?.extendedTextMessage?.text ||
         m.viewOnceMessage?.message?.conversation ||
         m.viewOnceMessageV2?.message?.extendedTextMessage?.text ||
         m.viewOnceMessageV2?.message?.conversation ||
         m.imageMessage?.caption ||
         m.videoMessage?.caption ||
         m.documentMessage?.caption ||
         '';
}

  // Manejador de Mensajes Entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const sender = msg.key.remoteJid;
      if (!sender || sender.includes('status@broadcast')) continue;
      const isGroup = sender.includes('@g.us');

      let text = extractMessageText(msg);

      // Manejo de Notas de Voz e Imágenes
      const isAudio = Boolean(msg.message.audioMessage || msg.message.ephemeralMessage?.message?.audioMessage);
      const isImage = Boolean(msg.message.imageMessage || msg.message.ephemeralMessage?.message?.imageMessage);

      if (isAudio) {
        console.log(`🎙️ [AUDIO RECIBIDO] Nota de voz entrante de cliente (${sender})...`);
        text = 'Hola, te envié un audio solicitando información sobre sus vehículos, motos e inmuebles disponibles.';
      } else if (isImage) {
        console.log(`📸 [IMAGEN RECIBIDA] Fotografía entrante de cliente (${sender})...`);
        const caption = msg.message.imageMessage?.caption || msg.message.ephemeralMessage?.message?.imageMessage?.caption || '';
        text = caption ? `${caption} [Foto adjunta]` : 'Te acabo de enviar una fotografía real del vehículo/bien para la ficha técnica del Marketplace.';
      }

      if (!text || !text.trim()) continue;

      // Filtrado Antiloop de Mensajes Propios
      if (msg.key.fromMe) {
        const isBotOutbound = text.includes('🛡️') || text.includes('YJD TRINOVA') || text.includes('¡CITA AGENDADA') || text.includes('Nequi: 323 584 5145') || text.includes('🚨');
        if (isBotOutbound || !isGroup && sender !== connectedNumber + '@s.whatsapp.net' && sender !== sock.user?.id) {
          continue;
        }
      }

      const cleanPhone = sender.replace(/[^0-9]/g, '');
      
      let rawName = msg.pushName || '';
      let pushName = '';
      if (rawName && !rawName.toLowerCase().includes('trinova') && !rawName.toLowerCase().includes('neurolabs')) {
        pushName = rawName.split(' ')[0];
      }

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

        const trinovaSystemPrompt = `Eres el Asesor Comercial & Concierge Digital Oficial de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla, Colombia).
Representas directamente a la Administradora Titular (Yury Jaramillo) y al equipo comercial y jurídico de la empresa.

TU OBJETIVO PRINCIPAL:
Atender al cliente con la más alta excelencia ejecutiva, empatía, calidez y perspicacia comercial por WhatsApp para asesorarlo en la compra, venta o consignación de vehículos, motos de todo cilindraje y propiedades inmobiliarias, así como servicios de peritaje y corretaje notarial.

PORTAFOLIO COMERCIAL YJD TRINOVA:
• 🏍️ *Motocicletas:* Modelos urbanos, trabajo y alto cilindraje (Bajaj Boxer CT 100, Pulsar, AKT, Yamaha MT/FZ/R3/NMAX, Kawasaki, Suzuki, KTM, BMW, etc.).
• 🚗 *Vehículos:* Sedanes, hatchbacks, camionetas SUV y 4x4 (Toyota, Mazda, Chevrolet, Renault, Ford, etc.).
• 🏢 *Inmuebles:* Venta y arriendo de casas, apartamentos, locales y oficinas en Barranquilla.
• 🔑 *Consignación:* Publicidad y corretaje notarial con firma digital.

REGLAS DE ORO CONVERSACIONALES:
1. DINAMISMO Y FLUIDEZ REAL (NO SEAS ROBÓTICO NI REPITAS PLANTILLAS):
   - Responde de forma directa, ágil y conversacional a lo que el cliente te escribe.
   - NUNCA envíes textos gigantescos o listas innecesarias de golpe. Lleva una conversación fluida de ventas.
   - En el primer contacto o saludo institucional, da la bienvenida formal mencionando a *YJD TRINOVA S.A.S. (NIT 902.095.222-8)* y que nuestros procesos y datos están protegidos bajo la *Ley 1581 de 2012 (Habeas Data)*.
   - En mensajes posteriores de la conversación, mantén el profesionalismo y la seguridad SIN repetir el párrafo legal completo si ya fue presentado.

2. ATENCIÓN A COMPRADORES (VEHÍCULOS, MOTOS DE ALTO CILINDRAJE E INMUEBLES):
   - Escucha y profundiza en lo que el cliente busca (tipo, marca, modelo, preferencias y presupuesto aproximado).
   - Destaca el respaldo de calidad: Peritaje de 150 Puntos Certificado (motor, chasis, caja, antecedentes RUNT, SIMIT, Fiscalía y tradición libre de gravámenes/embargos).
   - Cuando el cliente manifieste interés en agendar una cita o visitar la Sede Principal en Barranquilla (Calle 82 # 21 Sur 06 Esquina), explícale con total claridad y amabilidad las condiciones de reserva:
     • Depósito de *$20.000 COP* a nuestro **Nequi: 323 584 5145**.
     • ⏱️ *Garantía de Puntualidad:* Devolución del *50%* ($10.000 COP) con solo llegar puntual.
     • 🤝 *Garantía de Compra:* Reembolso o abono del *100%* ($20.000 COP) al valor del bien.
     • ❌ *Inasistencia sin previo aviso:* 0% devolución (cubre gastos de agenda y alistamiento).
   - Solicita amablemente los datos del cliente: Nombre completo, Cédula (CC), y Día/Hora preferido.
   - SÓLO cuando el cliente acepte las condiciones o envíe sus datos/comprobante, emite el TICKET OFICIAL:
     📅 *¡CITA AGENDADA CON ÉXITO!* ✨
     • *Cliente:* [Nombre]
     • *Cédula:* CC [Número]
     • *Teléfono:* [Número]
     • *Interés:* [Vehículo / Moto / Inmueble]
     • *Fecha y Hora:* [Día y Hora]
     • *Lugar:* Sede Principal YJD Trinova (Barranquilla)
     • *Reserva Nequi:* $20.000 al 323 584 5145 (Garantía Puntualidad 50%, Compra 100%).
     • *Asesora Titular:* Yury Jaramillo

3. ATENCIÓN A VENDEDORES & PROPIETARIOS (CONSIGNACIÓN & DIFUSIÓN):
   - Presenta el Programa de Consignación Segura y Corretaje Notarial.
   - Si piden información sobre cómo vender o publicar, preséntale los Planes de Difusión Comercial:
     • 🟢 *Plan Básico ($50.000 COP):* 10 anuncios semanales pautados en Meta Ads.
     • 🟡 *Plan Pro ($80.000 COP):* 20 anuncios semanales + Producción fotográfica, video promocional HD y flyer publicitario oficial.
     • 🔴 *Plan Premium Full ($150.000 COP):* 50 anuncios semanales + Insignia de Verificación Oficial Trinova + Peritaje de 150 puntos certificado + Agendamiento de citas con compradores calificados + Campaña digital integral + Corretaje notarial + Destacado en Marketplace Web.
     • 🔘 *Opción Estándar:* Consignación directa con comisión de corretaje al momento del cierre de la venta.
   - Bríndale el enlace oficial para el registro de su vehículo/inmueble y la firma digital del contrato:
     🔗 *Portal de Proveedores & Firma Digital:* https://ecosytem-psi.vercel.app/proveedores/registro
   - Para planes pagos, indícale el pago a Nequi: 323 584 5145.

4. MANEJO DE OBJECIONES Y PREGUNTAS FRECUENTES:
   - Si el cliente pregunta "¿Por qué cobran 20.000 pesos de reserva?": Explica que es un protocolo de seguridad física en sede, reserva la agenda exclusiva de la titular Yury Jaramillo y cubre el alistamiento del vehículo, recordando que se le reembolsa el 50% con solo asistir puntual y el 100% si compra.
   - Ubicación: Sede Principal Calle 82 # 21 Sur 06 Esquina, Barranquilla (Lunes a Sábado de 8:00 AM a 6:00 PM).
   - Servicios On-Demand: Búsqueda por requerimiento ($40.000 COP), Peritaje documental y legal ($50.000 COP), Peritaje físico in situ ($189.000 COP).

5. REGLAS DE FORMATO:
   - Formato limpio de WhatsApp: usa negrita (*texto*) y viñetas (•).
   - CERO código markdown complejo (sin ###, sin tablas, sin **).
   - NUNCA menciones que eres una IA, modelo de lenguaje ni hables de software.`;

function generateRuleBasedReply(text, pushName, cleanPhone, recentHistory) {
  const lower = text.toLowerCase().trim();

  // 1. Preguntas / Dudas / Objecciones sobre el pago de los $20.000 de Reserva (Nequi)
  if (
    lower.includes('por que') || lower.includes('porque') || lower.includes('por qué') ||
    lower.includes('20000') || lower.includes('20.000') || lower.includes('20 mil') ||
    lower.includes('cobran') || lower.includes('debo pagar') || lower.includes('tengo que pagar') ||
    lower.includes('deposito') || lower.includes('depósito') || lower.includes('anticipo') ||
    lower.includes('reserva') || lower.includes('por que pagan') || lower.includes('gratis') ||
    (lower.includes('pagar') && lower.includes('cita'))
  ) {
    return `¡Con todo el gusto te explico! El depósito de *$20.000 COP* es una política de **compromiso, seguridad física y respeto mutuo del tiempo**, diseñada para brindarte una atención 100% personalizada y segura:

1. 🔒 *Seguridad Física & Control:* Preparamos el registro notarial de tu ingreso en recepción y asignamos personal de seguridad en nuestra Sede Principal.
2. ⏱️ *Bloqueo Exclusivo de Agenda:* Apartamos el tiempo dedicado de nuestra titular (*Yury Jaramillo*) para atenderte solo a ti, sin esperas.
3. 🏍️🚗 *Alistamiento Técnico:* La unidad se prepara, limpia y verifica con peritaje de 150 puntos para tu prueba presencial.

🛡️ *Y lo más importante: es 100% reembolsable:*
• ⏱️ *Llegas puntual:* Te devolvemos de inmediato el *50%* ($10.000 COP).
• 🤝 *Compras el bien:* Te reembolsamos o abonamos el *100%* ($20.000 COP) al valor de compra.
• ❌ *Solo si no asistes sin avisar:* Se retiene para cubrir los costos logísticos del asesor.

¿Te gustaría apartar tu cita? Compártenos tu nombre, cédula (CC) y el día/hora que te convenga.`;
  }

  // 2. Ubicación, Sede, Dirección y Horarios
  if (
    lower.includes('donde estan') || lower.includes('donde están') || lower.includes('donde queda') ||
    lower.includes('ubicacion') || lower.includes('ubicación') || lower.includes('direccion') ||
    lower.includes('dirección') || lower.includes('sede') || lower.includes('horario') ||
    lower.includes('abierto') || lower.includes('atencion') || lower.includes('atención') ||
    lower.includes('calle') || lower.includes('carrera')
  ) {
    return `¡Con gusto! Nuestra Sede Principal y Sala de Negocios está ubicada en:

🏛️ *YJD TRINOVA S.A.S. (NIT 902.095.222-8)*
📍 *Dirección:* Calle 82 # 21 Sur 06 Esquina, Barranquilla, Atlántico.
⏰ *Horario de Atención:* Lunes a Sábado de 8:00 AM a 6:00 PM (Jornada Continua).

🛡️ *Protocolo de Seguridad:* Toda visita presencial se atiende bajo cita previa confirmada para garantizar tu acompañamiento de seguridad física y jurídica.

¿Qué día y hora te gustaría visitarnos para agendarte con nuestra titular Yury Jaramillo?`;
  }

  // 3. Garantías, Peritaje, Financiación y Traspasos
  if (
    lower.includes('garantia') || lower.includes('garantía') || lower.includes('peritaje') ||
    lower.includes('traspaso') || lower.includes('papeles') || lower.includes('credito') ||
    lower.includes('crédito') || lower.includes('financiacion') || lower.includes('financiación') ||
    lower.includes('banco') || lower.includes('libre de') || lower.includes('embargo') ||
    lower.includes('soat') || lower.includes('tecnomecanica') || lower.includes('tecnomecánica')
  ) {
    return `En *YJD TRINOVA S.A.S.* todos nuestros vehículos, motos e inmuebles cuentan con el más alto estándar de respaldo legal y técnico:

🛡️ *Garantías & Certificaciones Oficiales:*
• 🔍 *Peritaje de 150 Puntos Certificado:* Revisión exhaustiva de motor, caja, chasis, estructura, pintura y frenos.
• 📑 *Historial & Tradición 100% Limpio:* Validación en RUNT, SIMIT, Fiscalía y Registro de Instrumentos Públicos (Libre de embargos, prendas, siniestros y gravámenes).
• ✍️ *Acompañamiento Notarial:* Contratos de promesa y traspaso seguro respaldados por la empresa.
• 💳 *Asesoría en Crédito:* Convenios y viabilidad financiera para tu compra.

¿Te gustaría agendar una cita para revisar las unidades disponibles? Compártenos tus datos de contacto (Nombre, CC y Horario).`;
  }

  // 4. Consentimiento / Aprobación / Envío de datos para Cita
  const isAgreeing = lower === 'si' || lower === 'sí' || lower.includes('de acuerdo') || lower.includes('acepto') || lower.includes('listo') || lower.includes('perfecto') || lower.includes('ya transfiero') || lower.includes('transferí') || lower.includes('comprobante');
  const hasContactInfo = lower.includes('cc') || lower.includes('cédula') || lower.includes('cedula') || /[0-9]{7,10}/.test(lower);
  const hasTime = lower.includes('mañana') || lower.includes('pm') || lower.includes('am') || lower.includes('sabado') || lower.includes('lunes') || lower.includes('martes') || lower.includes('miercoles') || lower.includes('jueves') || lower.includes('viernes');

  if (isAgreeing || (hasContactInfo && hasTime)) {
    let clientName = pushName && pushName !== 'Cliente' ? pushName : 'Cliente Interesado';
    const nameMatch = text.match(/(?:mi nombre es|me llamo|soy|nombre[:\s*]+)\s*([A-Za-zÀ-ÿ\s]{3,35})/i);
    if (nameMatch) clientName = nameMatch[1].replace(/(?:y mi|con|cedula|cc|telefono|mi cc).*/i, '').trim();

    let doc = 'CC En Validación';
    const docMatch = text.match(/(?:c[eé]dula|cc|c\.c\.|nit|documento|identificaci[oó]n)[:\s*]+([0-9\.\s-]+)/i) || text.match(/\b([1-9][0-9]{6,9})\b/);
    if (docMatch) doc = `CC ${docMatch[1].replace(/[^0-9]/g, '')}`;

    return `¡Perfecto, ${clientName}! Tu cita ha quedado registrada en nuestro sistema. 📅✨

📅 *¡CITA AGENDADA CON ÉXITO!*
• *Cliente:* ${clientName}
• *Cédula:* ${doc}
• *Teléfono:* +${cleanPhone}
• *Interés / Búsqueda:* Vehículo / Moto / Inmueble Trinova
• *Fecha y Hora:* Horario acordado para tu atención
• *Lugar:* Sede Principal YJD Trinova (Barranquilla)
• *Reserva Nequi:* $20.000 al 323 584 5145 (Garantía Puntualidad 50% devolución, Compra 100% devolución).
• *Seguridad & Control:* Proceso acompañado y supervisado por nuestro equipo de seguridad física y control notarial bajo Ley 1581.
• *Asesora Titular:* Yury Jaramillo

Por favor envíanos la captura del comprobante de Nequi por este medio para validar tu ingreso con el equipo de recepción y seguridad. ¡Te esperamos!`;
  }

  // 5. Venta / Consignación / Proveedores
  if (lower.includes('vender') || lower.includes('consignar') || lower.includes('publicar') || lower.includes('proveedor') || lower.includes('comision') || lower.includes('contrato')) {
    return `¡Bienvenido al Programa de Consignación Segura y Corretaje Notarial de *YJD TRINOVA S.A.S.*! 🔑🚗

🛡️ *Respaldo & Seguridad YJD TRINOVA S.A.S. (NIT 902.095.222-8):* Todos nuestros procesos comerciales, visitas y acuerdos legales están respaldados bajo estrictos protocolos de seguridad física y jurídica (Ley 1581 Habeas Data).

📢 *Nuestros Planes de Difusión & Venta para Propietarios:*

• 🟢 *Plan Básico ($50.000 COP):* 10 anuncios semanales pautados en Meta Ads (Facebook / Instagram).
• 🟡 *Plan Pro ($80.000 COP):* 20 anuncios semanales + Producción fotográfica, video HD y flyer publicitario oficial.
• 🔴 *Plan Premium Full ($150.000 COP):* 50 anuncios semanales + Insignia de Verificación Oficial Trinova + Peritaje de 150 puntos certificado + Agendamiento de citas con compradores + Campaña digital integral + Corretaje notarial + Destacado web.
• 🔘 *Opción Estándar:* Consignación directa con comisión de corretaje al momento del cierre de la venta.

🔗 *Portal Oficial de Proveedores & Firma Digital:*
👉 https://ecosytem-psi.vercel.app/proveedores/registro

👉 *¿Cuál de estos planes prefieres para acelerar la venta de tu vehículo o propiedad (Básico $50k, Pro $80k, Premium $150k o Estándar)?*`;
  }

  // 6. Solicitud directa de Agendamiento / Cita
  if (lower.includes('cita') || lower.includes('agendar') || lower.includes('visita') || lower.includes('visitar') || lower.includes('cuando puedo ir')) {
    return `¡Con gusto coordinamos tu Cita Presencial en nuestra Sede Principal en Barranquilla (Calle 82 # 21 Sur 06 Esquina) con nuestra titular Yury Jaramillo! 📅✨

💳 *Condiciones de Reserva & Garantías:*
Para apartar el horario exclusivo y coordinar con el equipo de seguridad física:
• Depósito de *$20.000 COP* a nuestro **Nequi: 323 584 5145**.
• ⏱️ *Llegas puntual:* Te devolvemos el *50%* ($10.000 COP).
• 🤝 *Compras el bien:* Reembolso o abono del *100%* ($20.000 COP).
• ❌ *No asistes:* 0% devolución.

👉 Compártenos tu nombre completo, cédula (CC) y el día/hora que te convenga para apartar tu espacio.`;
  }

  // 7. Motocicletas
  if (lower.includes('moto') || lower.includes('cilindraje') || lower.includes('yamaha') || lower.includes('kawasaki') || lower.includes('ktm') || lower.includes('bmw') || lower.includes('suzuki') || lower.includes('honda') || lower.includes('mt09') || lower.includes('z900') || lower.includes('duke') || lower.includes('r3') || lower.includes('r6')) {
    return `¡Hola${pushName ? `, ${pushName}` : ''}! Qué excelente elección, las motocicletas de alto cilindraje son una de nuestras especialidades en *YJD TRINOVA S.A.S.* 🏍️💨

🛡️ Todas nuestras unidades cuentan con peritaje certificado de 150 puntos (motor, chasis, frenos) e historial limpio en RUNT y Fiscalía.

Cuéntame: ¿Qué marca o modelo tienes en mente (Yamaha, Kawasaki, KTM, BMW, Suzuki) y qué presupuesto aproximado manejas?`;
  }

  // 8. Carros & Camionetas SUV
  if (lower.includes('carro') || lower.includes('auto') || lower.includes('camioneta') || lower.includes('suv') || lower.includes('vehiculo') || lower.includes('vehículo') || lower.includes('toyota') || lower.includes('mazda') || lower.includes('chevrolet') || lower.includes('ford') || lower.includes('renault')) {
    return `¡Hola${pushName ? `, ${pushName}` : ''}! Qué gusto atenderte desde *YJD TRINOVA S.A.S.* para la compra de tu próximo vehículo. 🚗✨

🛡️ Disponemos de automóviles y camionetas SUV certificadas con peritaje de 150 puntos y tradición libre de embargos.

Cuéntame: ¿Qué tipo de vehículo estás buscando (sedán, SUV, 4x4) y qué presupuesto aproximado manejas?`;
  }

  // 9. Inmuebles / Finca Raíz
  if (lower.includes('casa') || lower.includes('apartamento') || lower.includes('inmueble') || lower.includes('propiedad') || lower.includes('penthouse') || lower.includes('arriendo') || lower.includes('alquiler') || lower.includes('local') || lower.includes('lote')) {
    return `¡Hola${pushName ? `, ${pushName}` : ''}! Bienvenido al área de Bienes Raíces & Finca Raíz Exclusiva de *YJD TRINOVA S.A.S.* 🏢✨

🛡️ Gestionamos propiedades residenciales y comerciales de alta gama en Barranquilla con estudio de títulos notarial 100% garantizado.

Cuéntame: ¿Qué tipo de inmueble buscas (casa, apartamento, penthouse, local), en qué sector y qué presupuesto tienes proyectado?`;
  }

  // 10. Servicios On-Demand
  if (lower.includes('peritaje') || lower.includes('buscar') || lower.includes('requerimiento') || lower.includes('inspeccion') || lower.includes('inspección') || lower.includes('precio') || lower.includes('cuanto vale') || lower.includes('tarifa')) {
    return `¡Con gusto te compartimos nuestras tarifas de servicios especializados en *YJD TRINOVA S.A.S.*! 📋✨

• 🔍 *Búsqueda por Requerimiento Especial* (Cazador de vehículos/inmuebles): *$40.000 COP*.
• 📋 *Peritaje Documental & Legal* (Historial RUNT, SIMIT, Fiscalía y tradición notarial): *$50.000 COP*.
• 🚗🏢 *Peritaje Físico Automotor / Inmobiliario + Visita Presencial in situ:* *$189.000 COP*.
• 💳 *Cuenta oficial Nequi:* 323 584 5145.

¿Cuál de estos servicios requieres para coordinar tu atención?`;
  }

  // 11. Saludo y Menú General
  return `¡Hola${pushName ? `, ${pushName}` : ''}! Bienvenido a *YJD TRINOVA S.A.S.* (NIT 902.095.222-8). 🚗🏍️🏢

🛡️ *Respaldo & Seguridad:* Todos nuestros procesos comerciales, visitas y acuerdos legales están acompañados bajo estrictos protocolos de seguridad física, jurídica y control integral (Ley 1581 Habeas Data).

Te ofrecemos asesoría integral en:
1. 🚗 Compra de Vehículos y Camionetas SUV Certificadas.
2. 🏍️ Motocicletas de Alto Cilindraje.
3. 🏢 Inmuebles y Finca Raíz Exclusiva.
4. 🔑 Consignación Segura con Planes de Publicidad.

¿En cuál de nuestros servicios te gustaría recibir asesoría hoy?`;
}

        let rawAiReply = '';
        try {
          const result = await generateText({
            model: groq('openai/gpt-oss-120b'),
            system: trinovaSystemPrompt,
            messages: recentHistory,
            maxTokens: 400,
          });
          rawAiReply = result.text;
        } catch (groqErr1) {
          console.warn('⚠️ [Groq AI 120B Warning]:', groqErr1.message, 'Intentando con openai/gpt-oss-20b...');
          try {
            const result2 = await generateText({
              model: groq('openai/gpt-oss-20b'),
              system: trinovaSystemPrompt,
              messages: recentHistory,
              maxTokens: 400,
            });
            rawAiReply = result2.text;
          } catch (groqErr2) {
            console.warn('⚠️ [Groq AI Fallback Warning]:', groqErr2.message, 'Ejecutando motor conversacional contextual...');
            rawAiReply = generateRuleBasedReply(text, pushName, cleanPhone, recentHistory);
          }
        }

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
• *Cédula:* ${finalContactDoc}
• *Correo:* ${finalContactEmail || 'Pendiente por registrar'}
• *Interés / Búsqueda:* ${ticketItem !== 'Vehículo / Inmueble Trinova' ? ticketItem : text.slice(0, 120)}
• *Fecha y Hora de Cita:* ${hasConfirmedTicket ? ticketSchedule : (isAppointmentIntent ? 'Por coordinar' : 'No solicitada')}
• *Protocolo de Seguridad:* Proceso acompañado y supervisado bajo Ley 1581
• *Validación Nequi (3235845145):* ${hasConfirmedTicket ? 'Validar depósito de reserva ($20.000 COP)' : 'Pendiente según servicio'}
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
      await clearAuthInSupabase();
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      } catch (e) {}
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

app.get('/groq-models', async (req, res) => {
  try {
    const resp = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    res.json({ success: true, models: resp.data.data.map(m => m.id) });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

app.get('/test-ai', async (req, res) => {
  const q = req.query.q || 'necesito una marca boxer con presupuesto de 1.300.000';
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const groqKeyPrefix = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 8) : 'NONE';
  try {
    const modelId = req.query.model || 'qwen/qwen3.8-27b';
    const result = await generateText({
      model: groq(modelId),
      system: 'Eres el Asesor Comercial & Concierge Digital de YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla). Responde de forma cordial, ejecutiva y directa.',
      prompt: q,
      maxTokens: 350,
    });
    res.json({ success: true, modelUsed: modelId, hasGroqKey, groqKeyPrefix, reply: result.text });
  } catch (err) {
    res.json({ success: false, hasGroqKey, groqKeyPrefix, error: err.message, stack: err.stack });
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
