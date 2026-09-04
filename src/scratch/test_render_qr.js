async function testRenderQr() {
  try {
    const res = await fetch('https://ecosytem.onrender.com/qr');
    const data = await res.json();
    console.log('Render QR endpoint response:', {
      status: data.status,
      phone: data.phone,
      hasQr: Boolean(data.qr)
    });
  } catch (e) {
    console.log('Error reaching Render:', e.message);
  }
}

testRenderQr();
