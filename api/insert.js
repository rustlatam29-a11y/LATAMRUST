// Endpoint para webhook INSERT - Soporte completo para multipart/form-data
const https = require('https');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1429918486783594586/N00BIvZbVDLyVYoIpqE23X6g7g-QlEXZLZWS8MngVKDB9FYAl33uhia0sgF6bPA4ylXI";

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    
    // Copiar TODOS los headers del request original (incluido Content-Type con boundary)
    const headers = {};
    Object.keys(req.headers).forEach(key => {
      // Copiar todos excepto host
      if (key.toLowerCase() !== 'host') {
        headers[key] = req.headers[key];
      }
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: headers
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let responseData = '';
      
      proxyRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode);
        
        if (proxyRes.statusCode === 204 || proxyRes.statusCode === 200) {
          res.json({ success: true, message: 'Enviado correctamente a Discord' });
        } else {
          res.send(responseData);
        }
        
        resolve();
      });
    });

    proxyReq.on('error', (error) => {
      console.error('Error al reenviar a Discord:', error);
      res.status(500).json({ 
        error: 'Error al conectar con Discord', 
        message: error.message 
      });
      reject(error);
    });

    // Reenviar el body completo (funciona con multipart)
    req.pipe(proxyReq);
  });
};
