module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var apiKey = process.env.ANTHROPIC_API_KEY || (req.body && req.body.apiKey);

  if (!apiKey) {
    return res.status(401).json({
      error: 'No API key configured. Set ANTHROPIC_API_KEY in Vercel environment variables, or provide apiKey in request body.'
    });
  }

  try {
    var system = req.body.system || '';
    var messages = req.body.messages;
    var max_tokens = req.body.max_tokens || 2048;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens,
        system: system,
        messages: messages
      })
    });

    if (!response.ok) {
      var errorData = {};
      try { errorData = await response.json(); } catch(e) {}
      return res.status(response.status).json({
        error: (errorData.error && errorData.error.message) || 'Anthropic API error: ' + response.status,
        details: errorData
      });
    }

    var data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
