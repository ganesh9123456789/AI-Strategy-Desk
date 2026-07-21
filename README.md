# Deploying the AI Strategy Desk

This site has two parts:

- **`index.html`** — the static frontend. Goes on GitHub Pages.
- **`worker.js`** — a small backend proxy. Goes on Cloudflare Workers (free tier). It holds your Anthropic API key so it's never exposed in the page's source code.

You need both — GitHub Pages alone can't run the AI feature, because it can only serve static files and has nowhere safe to store a secret key.

## 1. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign in / sign up.
2. Create an API key under **API Keys**.
3. Copy it somewhere safe — you'll paste it into Cloudflare in step 2, not into any file here.

Note: API usage is billed per token by Anthropic (separate from any Claude.ai subscription). Check current pricing on the Anthropic site before deploying somewhere with public traffic.

## 2. Deploy the backend (Cloudflare Worker)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up for a free account.
2. In the sidebar, go to **Workers & Pages** → **Create** → **Create Worker**.
3. Give it a name (e.g. `strategy-desk-proxy`) and deploy the default template.
4. Click **Edit code**, delete the placeholder code, and paste in the contents of `worker.js`.
5. Click **Deploy**.
6. Go to the worker's **Settings** → **Variables and Secrets** → **Add** → name it `ANTHROPIC_API_KEY`, paste your key from step 1, mark it as **Secret**, and save.
7. Copy the worker's URL — it looks like `https://strategy-desk-proxy.yourname.workers.dev`.

## 3. Connect the frontend to the backend

1. Open `index.html`.
2. Find this line near the top of the `<script>` block:
   ```js
   const API_ENDPOINT = "PASTE_YOUR_WORKER_URL_HERE";
   ```
3. Replace the placeholder with your worker URL from step 2.7, e.g.:
   ```js
   const API_ENDPOINT = "https://strategy-desk-proxy.yourname.workers.dev";
   ```

## 4. Publish on GitHub Pages

1. Create a new GitHub repository (public or private both work, but Pages on a free plan needs the repo to be public unless you're on GitHub Pro/Team).
2. Upload `index.html` (with your edited `API_ENDPOINT`) to the repo root.
3. Go to the repo's **Settings** → **Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch," pick your default branch (e.g. `main`) and folder `/ (root)`.
5. Save. GitHub will give you a URL like `https://yourusername.github.io/your-repo-name/`. It takes a minute or two to go live.

## 5. Test it

Open your GitHub Pages URL, submit a case, and confirm you get a full analysis back. If it fails, check:

- Is `API_ENDPOINT` in `index.html` actually your worker URL (no leftover placeholder)?
- Did you save `ANTHROPIC_API_KEY` as a **Secret** variable on the worker (not left blank)?
- Open your browser's dev tools (F12) → Console/Network tab for the exact error.

## Optional: tighten CORS

By default `worker.js` allows requests from any origin (`Access-Control-Allow-Origin: "*"`). Once your Pages site is live, you can lock the worker down to only accept requests from it by replacing `"*"` in `worker.js` with your exact Pages URL, e.g. `"https://yourusername.github.io"`, and redeploying the worker.
