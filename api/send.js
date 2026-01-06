// Updated: 2026-01-06 20:35:36
// Servidor Proxy TRANSPARENTE para proteger Webhooks de Discord
// Reenvía TODA la data tal cual llega (multipart, json, etc)

const https = require('https');
const http = require('http');

// WEBHOOKS REALES - PROTEGIDOS POR EL PROXY
const WEBHOOKS = {
  insert: "https://discord.com/api/webhooks/1429918486783594586/N00BIvZbVDLyVYoIpqE23X6g7g-QlEXZLZWS8MngVKDB9FYAl33uhia0sgF6bPA4ylXI",
  capturas: "https://discord.com/api/webhooks/1457437644274405694/1M-JqFYrOqXPCZWu8nWjkezr5SZfgA4YcV_C-WVGuDck5DhAM46oHf-3fc0hKO9gZct7"
};

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener webhook_id de la URL (después del /api/send?webhook_id=XXX)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const webhook_id = url.searchParams.get('webhook_id');

    // Validar que se especificó un webhook válido
    if (!webhook_id || !WEBHOOKS[webhook_id]) {
      return res.status(400).json({ 
        error: 'webhook_id inválido o no especificado',
        valid_ids: Object.keys(WEBHOOKS),
        received: webhook_id,
        url: req.url
      });
    }

    // Obtener el webhook real
    const webhookUrl = WEBHOOKS[webhook_id];
    const url = new URL(webhookUrl);

    // Preparar opciones para la petición
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Content-Length': req.headers['content-length']
      }
    };

    // Crear promesa para manejar la petición
    return new Promise((resolve, reject) => {
      const proxyReq = https.request(options, (proxyRes) => {
        let responseData = '';

        proxyRes.on('data', (chunk) => {
          responseData += chunk;
        });

        proxyRes.on('end', () => {
          // Reenviar la respuesta de Discord
          res.status(proxyRes.statusCode);
          
          // Copiar headers de respuesta
          Object.keys(proxyRes.headers).forEach(key => {
            res.setHeader(key, proxyRes.headers[key]);
          });

          if (proxyRes.statusCode === 204 || proxyRes.statusCode === 200) {
            res.json({ 
              success: true, 
              message: 'Enviado correctamente',
              webhook_used: webhook_id 
            });
          } else {
            res.send(responseData);
          }
          
          resolve();
        });
      });

      proxyReq.on('error', (error) => {
        console.error('Error al enviar a Discord:', error);
        res.status(500).json({ 
          error: 'Error al conectar con Discord',
          message: error.message 
        });
        reject(error);
      });

      // Reenviar el body tal cual llega
      req.pipe(proxyReq);
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};
