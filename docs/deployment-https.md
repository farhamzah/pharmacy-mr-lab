# HTTPS Deployment Guide for Meta Quest Browser

## Why WebXR Needs HTTPS

WebXR immersive sessions require a secure context. Meta Quest Browser will not start `immersive-ar` from ordinary HTTP LAN URLs.

## Why `http://192.168.x.x:5173` Fails

An IP-based local network URL such as `http://192.168.x.x:5173` is not treated as a trusted secure context by Meta Quest Browser. The app may load, but `navigator.xr` or `immersive-ar` can be unavailable and permission prompts may never appear.

## Recommended Testing Hosts

- Vercel
- Netlify
- GitHub Pages
- Trusted HTTPS reverse tunnel such as Cloudflare Tunnel or ngrok

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the project in Vercel.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Open the `https://...vercel.app` URL in Meta Quest Browser.

## Deploy to Netlify

1. Run `npm run build`.
2. Upload the `dist` folder to Netlify, or connect the GitHub repo.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Open the Netlify HTTPS URL in Meta Quest Browser.

## Deploy to GitHub Pages

GitHub Pages can work if served over HTTPS. If the app is hosted under a repository path instead of the domain root, configure Vite `base` accordingly before building.

## Local HTTPS

Local HTTPS can be configured with tools like mkcert and Vite HTTPS config, but Quest may not trust a local certificate. For quick demo testing, Vercel or Netlify is usually safer.

## Troubleshooting

- `not secure`: deploy to HTTPS.
- `navigator.xr unavailable`: confirm secure context and Meta Quest Browser.
- `immersive-ar not supported`: confirm Quest Browser version and passthrough capability.
- Permission prompt does not appear: clear Quest Browser cache and reload HTTPS URL.
- HTTPS page with mixed content: ensure all assets are loaded over HTTPS or local relative paths.
- Quest Browser cache: clear site data or open a fresh deployment URL.
