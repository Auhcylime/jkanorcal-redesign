// GitHub OAuth callback for Sveltia/Decap CMS.
// 1. Exchange ?code= for an access token.
// 2. Return an HTML page that postMessages the token back to the CMS popup opener.
export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return sendError(res, "Missing ?code");
  }

  let token;
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
      }),
    });
    const data = await r.json();
    if (!data.access_token) {
      return sendError(res, data.error_description || "GitHub did not return a token");
    }
    token = data.access_token;
  } catch (err) {
    return sendError(res, err.message || String(err));
  }

  const payload = JSON.stringify({ token, provider: "github" });
  const successMessage = `authorization:github:success:${payload}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.statusCode = 200;
  res.end(`<!doctype html>
<html>
<head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<p>Authorizing… If this window doesn't close, you can close it manually.</p>
<script>
(function() {
  var message = ${JSON.stringify(successMessage)};
  function send(targetOrigin) {
    if (window.opener) {
      window.opener.postMessage(message, targetOrigin || "*");
    }
  }
  window.addEventListener("message", function(e) {
    // CMS will respond with the origin we should send the token to.
    send(e.origin);
  });
  // Announce we're ready; CMS replies with origin info.
  if (window.opener) {
    window.opener.postMessage("authorizing:github", "*");
  }
})();
</script>
</body>
</html>`);
}

function sendError(res, message) {
  const payload = JSON.stringify({ message });
  const errMessage = `authorization:github:error:${payload}`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.statusCode = 200;
  res.end(`<!doctype html>
<html><body>
<p>Authorization failed: ${escapeHtml(message)}</p>
<script>
(function(){
  if (window.opener) window.opener.postMessage(${JSON.stringify(errMessage)}, "*");
})();
</script>
</body></html>`);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
