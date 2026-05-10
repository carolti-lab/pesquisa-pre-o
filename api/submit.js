// api/submit.js — usa Upstash Redis via REST API (sem dependência de pacote)

async function redisPipeline(commands) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    if (!data?.answers) return res.status(400).json({ error: 'Dados incompletos' });

    const { q1, q2, q3, q4 } = data.answers;
    if ([q1, q2, q3, q4].some(v => typeof v !== 'number' || v <= 0)) {
      return res.status(400).json({ error: 'Respostas invalidas' });
    }

    const id = `survey_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = JSON.stringify({
      id,
      submittedAt: new Date().toISOString(),
      answers: data.answers,
      identification: data.identification || {},
      meta: { ...data.meta, ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() }
    });

    await redisPipeline([
      ['SET', `survey:${id}`, record],
      ['ZADD', 'surveys:index', Date.now(), id],
      ['INCR', 'surveys:count']
    ]);

    return res.status(200).json({ success: true, id });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Erro ao salvar resposta' });
  }
}
