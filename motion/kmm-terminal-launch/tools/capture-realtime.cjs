// Capture en temps réel d'une page à la taille iPhone (393x852 @2x), pour les vues qui bloquent sous temps virtuel.
// Captures d'écran enchaînées et horodatées, puis rééchantillonnées à 30 i/s (image la plus récente à chaque instant).
// Usage : PW=<playwright> PRETAPS='[[x,y],...]' node capture-realtime.cjs <url> <dossier> <durée_s> <attente_s>
const { chromium } = require(process.env.PW);
const fs = require('fs');
(async () => {
  const [url, out, secs, warm] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  await p.goto(url); await p.waitForTimeout(+warm * 1000);
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  for (const [x, y] of JSON.parse(process.env.PRETAPS || '[]')) { await p.touchscreen.tap(x, y); await p.waitForTimeout(1500); }
  const cdp = await ctx.newCDPSession(p);
  const shots = []; const t0 = Date.now();
  while (Date.now() - t0 < +secs * 1000 + 300) {
    const ts = (Date.now() - t0) / 1000;
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 393, height: 852, scale: 2 } });
    shots.push([ts, Buffer.from(r.data, 'base64')]);
  }
  const n = Math.round(+secs * 30); let j = 0;
  for (let i = 0; i < n; i++) { const t = i / 30; while (j + 1 < shots.length && shots[j + 1][0] <= t) j++;
    fs.writeFileSync(`${out}/f${String(i).padStart(5, '0')}.jpg`, shots[j][1]); }
  console.log(n, 'frames from', shots.length, 'shots', (shots.length / (+secs + .3)).toFixed(1), 'shots/s');
  await b.close();
})();
