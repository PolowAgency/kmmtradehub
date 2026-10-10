// Capture image par image en temps virtuel : iPhone 15 Pro 393x852 @3x, 30 i/s, net et sans saccade.
const { chromium } = require(process.env.PW);
const fs = require('fs');
(async () => {
  const [url, out, secs, warm, actions] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  await p.goto(url); await p.waitForTimeout(+warm * 1000);
  // Masque l'indicateur de développement Next.js (badge « N ») et mesure le bouton Espace.
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  const esp = await p.evaluate(() => { const el = [...document.querySelectorAll('a,button')].find(e => /Espace/.test(e.textContent)); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  console.log('espace', JSON.stringify(esp));
  const cdp = await ctx.newCDPSession(p);
  const acts = actions ? JSON.parse(actions) : [];   // [{t:2.0, tap:[x,y]}]
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
  const n = Math.round(+secs * 30);
  for (let i = 0; i < n; i++) {
    const t = i / 30;
    for (const a of acts) if (Math.abs(a.t - t) < 1 / 60) { await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: 1 }); await p.touchscreen.tap(a.tap[0], a.tap[1]).catch(()=>{}); }
    await new Promise(r => { cdp.once('Emulation.virtualTimeBudgetExpired', r); cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pauseIfNetworkFetchesPending', budget: 1000 / 30 }); });
    const buf = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 393, height: 852, scale: 3 } });
    fs.writeFileSync(`${out}/f${String(i).padStart(5, '0')}.jpg`, Buffer.from(buf.data, 'base64'));
  }
  console.log(n, 'frames');
  await b.close();
})();
