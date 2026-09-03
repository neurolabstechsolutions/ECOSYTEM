async function testEndpoint() {
  const res = await fetch('https://ecosytem-psi.vercel.app/api/trinova/dashboard');
  if (res.ok) {
    const json = await res.json();
    console.log('✅ /api/trinova/dashboard Live Response:');
    console.log('Inventory Count:', json.inventory?.length);
    console.log('Contacts Count:', json.contacts?.length);
    console.log('Contracts Count:', json.contracts?.length);
    console.log('Inventory Sample:', json.inventory);
  } else {
    console.log('Status:', res.status, await res.text());
  }
}

testEndpoint();
