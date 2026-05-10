// api/admin.js — lista respostas, protegido por senha

async function redisGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result;
}

async function redisZrange(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}/zrange/${encodeURIComponent(key)}/0/-1/rev`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result || [];
}

export default async function handler(req, res) {
  const providedKey = req.query.key || req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) return res.status(500).json({ error: 'ADMIN_KEY nao configurada' });
  if (providedKey !== expectedKey) return res.status(401).json({ error: 'Nao autorizado' });

  try {
    const ids = await redisZrange('surveys:index');
    if (!ids || ids.length === 0) return res.status(200).json({ count: 0, surveys: [] });

    const surveys = await Promise.all(
      ids.map(async id => {
        const raw = await redisGet(`survey:${id}`);
        try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
        catch { return null; }
      })
    );

    return res.status(200).json({
      count: surveys.filter(Boolean).length,
      surveys: surveys.filter(Boolean)
    });
  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: 'Erro ao buscar respostas' });
  }
}
