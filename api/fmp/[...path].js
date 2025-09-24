export default async function handler(req, res) {
  try {
    const segments = req.query.path || [];
    const targetPath = '/' + segments.join('/'); // 例: /api/v3/quote/AAPL,MSFT
    if (!targetPath.startsWith('/api/v3/')) {
      return res.status(404).json({ error: 'Not found' });
    }

    const key = process.env.FMP_API_KEY;             // ← Vercel の環境変数で管理
    if (!key) return res.status(500).json({ error: 'Missing FMP_API_KEY env' });

    const url = new URL('https://financialmodelingprep.com' + targetPath);
    Object.entries(req.query).forEach(([k, v]) => { if (k !== 'path') url.searchParams.set(k, String(v)); });
    url.searchParams.set('apikey', key);             // ← ここで自動付与

    const upstream = await fetch(url.toString(), { headers: { accept: 'application/json' } });
    const text = await upstream.text();

    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('cache-control', 'public, max-age=300'); // 5分キャッシュ（任意）
    res.setHeader('access-control-allow-origin', '*');     // 必要に応じて自ドメインに制限
    return res.status(upstream.status).send(text);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
