async function resetAndGetQr() {
  try {
    console.log('Sending disconnect/reset to Render...');
    const disRes = await fetch('https://ecosytem.onrender.com/disconnect', { method: 'POST' });
    console.log('Disconnect response:', await disRes.json());

    // Wait 4 seconds for new QR generation
    await new Promise(r => setTimeout(r, 4000));

    const qrRes = await fetch('https://ecosytem.onrender.com/qr');
    const qrData = await qrRes.json();
    console.log('Fresh QR Status:', {
      status: qrData.status,
      hasQr: Boolean(qrData.qr)
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

resetAndGetQr();
