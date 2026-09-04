async function checkRenderDeployment() {
  try {
    const res = await fetch('https://ecosytem.onrender.com/qr');
    const data = await res.json();
    console.log('Render Status after Git Push:', {
      status: data.status,
      phone: data.phone,
      hasQr: Boolean(data.qr)
    });
  } catch (e) {
    console.log('Render is currently deploying/restarting:', e.message);
  }
}

checkRenderDeployment();
