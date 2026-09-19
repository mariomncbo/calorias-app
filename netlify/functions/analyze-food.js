const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_PROMPT = 'Eres un asistente de nutrición. Analiza la fotografía de un plato de comida y devuelve únicamente un objeto JSON con exactamente estos campos: {"name": string con el nombre del plato en español, "kcal": número estimado de kilocalorías totales del plato, "description": string breve de máximo dos frases con los ingredientes principales que ves}. No añadas nada que no sea el JSON.';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API_KEY no configurada en el servidor' })
    };
  }

  try {
    const { mime = 'image/jpeg', base64 } = JSON.parse(event.body || '{}');
    if (!base64) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Falta la imagen en el cuerpo de la petición' })
      };
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: GEMINI_PROMPT },
            { inline_data: { mime_type: mime, data: base64 } }
          ]
        }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const payload = await geminiResponse.json().catch(() => null);
    if (!geminiResponse.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: payload?.error?.message || `Gemini ${geminiResponse.status}` })
      };
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const match = /{[\s\S]*}/.exec(text);
    const parsed = match ? JSON.parse(match[0]) : {};

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' })
    };
  }
};