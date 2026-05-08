// GitHub OAuth init endpoint for Sveltia/Decap CMS.
// CMS hits this with ?provider=github&scope=repo&site_id=...
// We redirect to GitHub's OAuth authorize page.
export default function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirect_uri = `${proto}://${host}/api/callback`;

  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri,
    scope: req.query.scope || "repo,user",
    state: req.query.state || "",
    allow_signup: "false",
  });

  res.statusCode = 302;
  res.setHeader("Location", `https://github.com/login/oauth/authorize?${params}`);
  res.end();
}
