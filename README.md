# 🔒 Servidor Proxy para Webhooks de Discord

Este servidor protege tus webhooks de Discord ocultándolos detrás de un proxy en Vercel.

## 📋 PASO 1: CONFIGURAR TUS WEBHOOKS

**IMPORTANTE:** Antes de subir a Vercel, abre el archivo `api/send.js` y reemplaza las URLs de webhook:

```javascript
const WEBHOOKS = {
  webhook1: "https://discord.com/api/webhooks/TU_WEBHOOK_1_AQUI",
  webhook2: "https://discord.com/api/webhooks/TU_WEBHOOK_2_AQUI"
};
```

Cambia:
- `TU_WEBHOOK_1_AQUI` por tu primer webhook real de Discord
- `TU_WEBHOOK_2_AQUI` por tu segundo webhook real de Discord

## 🚀 PASO 2: SUBIR A VERCEL

1. Ve a https://vercel.com
2. Inicia sesión (o crea cuenta)
3. Click en "Add New..." → "Project"
4. Arrastra toda la carpeta `WEBHOOK_SERVER_2HOOKS` a Vercel
5. Click en "Deploy"
6. Espera 1-2 minutos
7. **COPIA TU URL** (ejemplo: `https://webhook-server-2hooks-abc123.vercel.app`)

## 💻 PASO 3: USAR EN TU APLICACIÓN C#

Reemplaza tus llamadas directas a Discord con llamadas a tu proxy:

### Código de Ejemplo:

```csharp
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

public class WebhookProxy
{
    private static readonly HttpClient client = new HttpClient();
    private const string PROXY_URL = "https://TU-URL-DE-VERCEL.vercel.app/api/send";
    
    public static async Task EnviarMensaje(string webhookId, string mensaje)
    {
        var payload = new
        {
            webhook_id = webhookId,  // "webhook1" o "webhook2"
            content = mensaje,
            username = "LatamZ Bot"
        };
        
        var json = JsonConvert.SerializeObject(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(PROXY_URL, content);
        
        if (response.IsSuccessStatusCode)
        {
            Console.WriteLine("✅ Mensaje enviado correctamente");
        }
        else
        {
            Console.WriteLine($"❌ Error: {response.StatusCode}");
        }
    }
}

// USO:
await WebhookProxy.EnviarMensaje("webhook1", "¡Hola desde el proxy!");
await WebhookProxy.EnviarMensaje("webhook2", "Mensaje al segundo webhook");
```

## 📨 FORMATO DE PETICIÓN

Tu aplicación debe enviar un POST a `https://TU-URL.vercel.app/api/send` con este JSON:

```json
{
  "webhook_id": "webhook1",
  "content": "Tu mensaje aquí",
  "username": "Nombre del bot",
  "avatar_url": "https://url-de-avatar.com/imagen.png"
}
```

### Parámetros:

- **webhook_id** (requerido): `"webhook1"` o `"webhook2"` 
- **content** (requerido): El mensaje a enviar
- **username** (opcional): Nombre que aparecerá en Discord
- **avatar_url** (opcional): URL del avatar del bot
- **embeds** (opcional): Array de embeds de Discord

## 📊 ENVIAR CON EMBEDS

```json
{
  "webhook_id": "webhook1",
  "content": "Nuevo evento",
  "embeds": [
    {
      "title": "Título del Embed",
      "description": "Descripción aquí",
      "color": 5814783,
      "fields": [
        {
          "name": "Campo 1",
          "value": "Valor 1",
          "inline": true
        }
      ]
    }
  ]
}
```

## ✅ VENTAJAS DE ESTE SISTEMA

1. ✅ Tus webhooks reales NUNCA están en el .exe
2. ✅ No pueden ser extraídos con herramientas de análisis
3. ✅ Puedes cambiar los webhooks sin recompilar
4. ✅ Control centralizado desde Vercel
5. ✅ Gratis con Vercel

## 🔧 ACTUALIZAR WEBHOOKS

Si necesitas cambiar los webhooks:

1. Ve a tu proyecto en Vercel
2. Edita `api/send.js`
3. Cambia las URLs en el objeto `WEBHOOKS`
4. Guarda → Vercel redeploy automáticamente
5. ¡Listo! Sin tocar el .exe

## ⚠️ IMPORTANTE

- ⚠️ NO compartas tu URL de Vercel públicamente
- ⚠️ NO hagas commits con los webhooks reales a GitHub
- ⚠️ Considera agregar autenticación si es necesario

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "webhook_id inválido"
- Verifica que estás enviando `"webhook1"` o `"webhook2"`

### Error 405
- Asegúrate de usar método POST, no GET

### Error 500
- Verifica que los webhooks en `api/send.js` sean válidos
- Revisa los logs en el dashboard de Vercel

## 📞 TESTING

Puedes probar tu proxy con cURL:

```bash
curl -X POST https://TU-URL.vercel.app/api/send \
  -H "Content-Type: application/json" \
  -d "{\"webhook_id\":\"webhook1\",\"content\":\"Test desde cURL\"}"
```

---

**¡Todo listo para proteger tus webhooks! 🚀**
