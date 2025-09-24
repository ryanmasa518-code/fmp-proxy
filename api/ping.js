export default async function handler(req, res) {
  return res.status(200).json({ ok: true, hasKey: !!process.env.FMP_API_KEY });
}
