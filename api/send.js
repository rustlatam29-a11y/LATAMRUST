// Servidor Proxy para proteger Webhooks de Discord
// Este código ofusca tus webhooks reales

const fetch = require('node-fetch');

// WEBHOOKS REALES - PROTEGIDOS POR EL PROXY
const WEBHOOKS = {
  insert: "https://discord.com/api/webhooks/1429918486783594586/N00BIvZbVDLyVYoIpqE23X6g7g-QlEXZLZWS8MngVKDB9FYAl33uhia0sgF6bPA4ylXI",
  capturas: "https://discord.com/api/webhooks/1457437644274405694/1M-JqFYrOqXPCZWu8nWjkezr5SZfgA4YcV_C-WVGuDck5DhAM46oHf-3fc0hKO9gZct7"
};

module.exports = async (req, res) => {
  // Configurar CORS para permitir peticiones desde tu aplicación
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener datos del body
    const { webhook_id, content, embeds, username, avatar_url } = req.body;

    // Validar que se especificó un webhook válido
    if (!webhook_id || !WEBHOOKS[webhook_id]) {
      return res.status(400).json({ 
        error: 'webhook_id inválido',
        valid_ids: Object.keys(WEBHOOKS)
      });
    }

    // Validar que hay contenido
    if (!content && !embeds) {
      return res.status(400).json({ 
        error: 'Debe incluir content o embeds' 
      });
    }

    // Construir el payload para Discord
    const payload = {
      content: content || '',
      username: username || 'LatamZ Bot',
      avatar_url: avatar_url || ''
    };

    // Agregar embeds si existen
    if (embeds) {
      payload.embeds = embeds;
    }

    // Enviar al webhook real de Discord
    const webhookUrl = WEBHOOKS[webhook_id];
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Verificar respuesta de Discord
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Discord:', errorText);
      return res.status(response.status).json({ 
        error: 'Error al enviar a Discord',
        details: errorText 
      });
    }

    // Éxito
    return res.status(200).json({ 
      success: true,
      message: 'Mensaje enviado correctamente',
      webhook_used: webhook_id
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};
