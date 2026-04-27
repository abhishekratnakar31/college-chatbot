import fetch from 'node-fetch';

async function checkHealth() {
  try {
    const res = await fetch('http://localhost:4000/health');
    const data = await res.json();
    console.log('Health Check Response:', data);
  } catch (err) {
    console.error('Health Check Failed:', err.message);
  }
}

checkHealth();
