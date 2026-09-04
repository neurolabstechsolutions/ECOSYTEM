async function checkRenderStatus() {
  try {
    const resHealth = await fetch('https://ecosytem.onrender.com/health');
    const healthData = await resHealth.json();
    console.log('Health Data:', healthData);

    const resQr = await fetch('https://ecosytem.onrender.com/qr');
    const qrData = await resQr.json();
    console.log('QR Data:', {
      status: qrData.status,
      phone: qrData.phone,
      hasQr: Boolean(qrData.qr)
    });
  } catch (e) {
    console.error('Error contacting Render:', e.message);
  }
}

checkRenderStatus();
