export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const reqUrl = new URL(req.url);

    // 受け口: /api/fmp/以下をそのまま上流パスに
    const upstreamPath = reqUrl.pathname.replace(/^\/api\/fmp/, ''); // 例: /api/v3/quote/AAPL,MSFT
    if (!upstreamPath.startsWith('/api/v3/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'content-type': 'application/json' }
      });
    }

    const key = process.env.FMP_API_KEY; // Edgeでも環境変数OK
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing FMP_API_KEY env' }), {
        status: 500, headers: { 'content-type': 'application/json' }
      });
    }

    // クエリを移植し、apikey付与
    const fmpUrl = new URL('https://financialmodelingprep.com' + upstreamPath);
    reqUrl.searchParams.forEach((v, k) => fmpUrl.searchParams.set(k, v));
    fmpUrl.searchParams.set('apikey', key);

    const upstream = await fetch(fmpUrl.toString(), { headers: { 'accept': 'application/json' } });

    // そのまま透過
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json',
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
