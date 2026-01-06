// Endpoint para webhook CAPTURAS
const https = require('https');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1457437644274405694/1M-JqFYrOqXPCZWu8nWjkezr5SZfgA4YcV_C-WVGuDck5DhAM46oHf-3fc0hKO9gZct7";

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const url = new URL(WEBHOOK_URL);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Content-Length': req.headers['content-length']
    }
  };

  return new Promise((resolve, reject) => {
    const proxyReq = https.request(options, (proxyRes) => {
      let responseData = '';
      
      proxyRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode);
        
        if (proxyRes.statusCode === 204 || proxyRes.statusCode === 200) {
          res.json({ success: true, message: 'Enviado correctamente' });
        } else {
          res.send(responseData);
        }
        
        resolve();
      });
    });

    proxyReq.on('error', (error) => {
      res.status(500).json({ error: 'Error al conectar con Discord', message: error.message });
      reject(error);
    });

    req.pipe(proxyReq);
  });
};
