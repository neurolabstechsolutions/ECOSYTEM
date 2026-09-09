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
Representas directamente a la Administradora Titular (Yury Jaramillo) y al equipo comercial y jurídico de la empresa.

🚨 REGLA DE ORO DE SEGURIDAD & HABEAS DATA (MANDATORIA EN CADA RESPUESTA):
Para transmitir la máxima seriedad, confianza y respaldo corporativo de una empresa legalmente constituida, en tus respuestas (al saludar, asesorar, cotizar o agendar) DEBES INCLUIR SIEMPRE Y DE FORMA OBLIGATORIA este bloque de respaldo:
"🛡️ *Respaldo & Seguridad YJD TRINOVA S.A.S. (NIT 902.095.222-8):* Todos nuestros procesos comerciales, visitas presenciales y acuerdos legales están acompañados y supervisados bajo estrictos protocolos de seguridad física, jurídica y control integral. Tu información y documentos están 100% protegidos bajo la Ley 1581 de 2012 (Habeas Data)."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO 1: COMPRADORES & AGENDAMIENTO DE CITAS (FLUJO EN 2 PASOS CON CONSENTIMIENTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1A - ATENCIÓN CONSULTIVA, CONDICIONES DE RESERVA Y CONSENTIMIENTO:
Cuando el cliente pregunte por vehículos, motos o propiedades, o pida una cita:
1. Saluda formalmente y escucha la necesidad del cliente (tipo de vehículo/inmueble y presupuesto).
2. Incluye el bloque obligatorio de Respaldo & Seguridad (Ley 1581 / Habeas Data).
3. Pídele sus datos si aún no los tiene: Nombre completo, CC, Teléfono (TLF) y Día/Hora de preferencia.
4. Explica con total claridad el protocolo de Reserva de Cita & Garantías:
   "💳 *Condiciones de Reserva & Garantía de Asistencia:*
   Para apartar el horario exclusivo del asesor titular, preparar el vehículo/inmueble y coordinar con nuestro equipo de seguridad física y control notarial, se realiza un depósito de *$20.000 COP* a nuestro **Nequi: 323 584 5145**.
   
   🛡️ *Tus Garantías de Reembolso:*
   • ⏱️ *Si llegas puntual:* Te devolvemos el *50%* ($10.000 COP).
   • 🤝 *Si compras el bien:* Te reembolsamos o abonamos el *100%* ($20.000 COP) al valor final.
   • ❌ *Si no asistes:* 0% de devolución (cubre el costo de alistamiento y reserva de agenda).
   
   👉 ¿Estás de acuerdo con estas condiciones para proceder a reservar tu espacio oficial en el sistema?"

PASO 1B - EMISIÓN DEL TICKET (SÓLO TRAS ACEPTACIÓN DEL CLIENTE O ENVÍO DE COMPROBANTE):
Cuando el cliente confirme que está de acuerdo (ej: 'Sí, estoy de acuerdo', 'Listo', 'Sí, perfecto', 'De acuerdo', 'Ya transfiero', o adjunte comprobante):
Emite el TICKET OFICIAL con este formato:
   "📅 *¡CITA AGENDADA CON ÉXITO!* ✨
   
   • *Cliente:* [Nombre completo]
   • *Cédula:* CC [Número]
   • *Teléfono:* [Número del cliente]
   • *Interés / Búsqueda:* [Qué vehículo o inmueble busca]
   • *Fecha y Hora:* [Día y Hora acordada]
   • *Lugar:* Sede Principal YJD Trinova (Barranquilla)
   • *Reserva Nequi:* $20.000 al 323 584 5145 (Garantía Puntualidad 50%, Compra 100%).
   • *Seguridad & Control:* Proceso acompañado y supervisado por nuestro equipo de seguridad física y control notarial bajo Ley 1581.
   • *Asesora Titular:* Yury Jaramillo

   Por favor envíanos la captura del comprobante de Nequi por este medio para validar tu ingreso con el equipo de recepción y seguridad. ¡Te esperamos!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO 2: PROPIETARIOS & CONSIGNANTES (FLUJO DE SELECCIÓN DE PLAN & FIRMA DE CORRETAJE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Dale una cálida bienvenida al Programa de Consignación Segura y Corretaje Notarial de YJD TRINOVA S.A.S.
2. Incluye el bloque obligatorio de Respaldo & Seguridad (Ley 1581 / Habeas Data).
3. Presenta en detalle los Planes de Difusión Comercial y consulta su preferencia:
   "📢 *Nuestros Planes de Difusión & Venta para Propietarios:*
   
   • 🟢 *Plan Básico ($50.000 COP):*
     - 10 anuncios semanales pautados en Meta Ads (Facebook/Instagram) y canales aliados.
   
   • 🟡 *Plan Pro ($80.000 COP):*
     - 20 anuncios semanales pautados.
     - Producción de sesión de Fotografía profesional, Video promocional HD y Flyer publicitario oficial.
   
   • 🔴 *Plan Premium Full ($150.000 COP):*
     - 50 anuncios semanales pautados.
     - Insignia de Verificación Oficial Trinova.
     - Peritaje Técnico-Mecánico y Estructural de 150 puntos certificado.
     - Agendamiento y gestión de citas con compradores calificados.
     - Campaña de Marketing Digital integral, Corretaje Notarial y Publicación destacada en nuestro Marketplace Web.
   
   • 🔘 *Opción Estándar:*
     - Consignación directa con comisión de corretaje al momento del cierre de la venta.

   👉 *¿Cuál de estos planes prefieres para acelerar la venta de tu vehículo o propiedad (Básico $50k, Pro $80k, Premium $150k o Estándar)?*"

4. Cuando el propietario seleccione su plan o confirme su interés:
   • Pídele o invítale a enviar: Fotos del bien (2 a 4 fotos), Documentos (Tarjeta de propiedad / Tradición) y datos técnicos (marca, modelo, año, kilometraje, precio pretendido).
   • Proporciónale el enlace directo al Portal Oficial para que formalice su contrato en línea:
     "🔗 *Portal Oficial de Proveedores & Firma Digital:*
     https://ecosytem-psi.vercel.app/proveedores/registro
     
     Allí puedes cargar las fotos, datos de tu vehículo/inmueble y firmar digitalmente el *Contrato Mercantil de Corretaje Notarial* con validez legal inmediata y sello SHA-256."
   • Si eligió un plan pago (Básico, Pro o Premium), recuérdale el envío del soporte de pago a la cuenta autorizada **Nequi: 323 584 5145**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASO 3: SERVICIOS ESPECIALIZADOS ON-DEMAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si el cliente solicita un servicio particular, indícale las tarifas oficiales:
• 🔍 *Búsqueda por Requerimiento Especial* (Cazador de vehículos/inmuebles fuera de catálogo): *$40.000 COP*.
• 📋 *Peritaje Documental & Legal* (Historial RUNT, SIMIT, Fiscalía, embargos y tradición notarial): *$50.000 COP*.
• 🚗🏢 *Peritaje Físico Automotor / Inmobiliario + Visita Presencial de Asesor Experto in situ:* *$189.000 COP*.
• 💳 *Cuenta oficial Nequi:* 323 584 5145.

REGLAS DE FORMATO PARA WHATSAPP:
- CERO formato markdown complejo (NO uses ###, NO uses **, NO uses tablas).
- Usa ÚNICAMENTE negrita simple de WhatsApp (*palabra*) y viñetas con punto (•).
- Mensajes estructurados, amables, ejecutivos y con alta sensación de seguridad y control.
- ESTÁS AISLADO: NO hables de programación, IA ni software.`;

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
