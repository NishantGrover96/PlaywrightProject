const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3333,
  path: '/api/events',
  method: 'GET',
  headers: {
    'Accept': 'text/event-stream'
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Received:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Connection ended');
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();

// Keep alive for 10 seconds
setTimeout(() => {
  console.log('Closing after timeout');
  process.exit(0);
}, 10000);
