"""Rendu image par image d'une page HTML pilotée par window.renderAt(t, frame).
Usage : python3 render_frames.py <page.html> <dossier_sortie> <debut> <fin> [budget_s] [fps] [fenetres]
- Reprend là où il s'est arrêté : relancer avec le "next" affiché tant que next < fin.
- fenetres : "0-2.7,6.4-8.8" = plages (secondes) rendues avec flou de mouvement (SUB sous-images,
  180° d'obturateur). Variable d'env SUB=4 (défaut) ; 6-8 pour les mouvements très rapides.
- CUTS="3.2,7.95" : coupes franches, jamais de flou à travers une coupe.
- budget_s : s'arrêter avant la limite de 5 min par commande (défaut 265).
- W/H en variables d'environnement (défaut 1920x1080). DSF=2 = supersampling (texte plus net, 2x plus lent).
"""
import asyncio, sys, io, os, time
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
HS='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
page,out,a,b=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
BUDGET=float(sys.argv[5]) if len(sys.argv)>5 else 265
FPS=int(sys.argv[6]) if len(sys.argv)>6 else 30
WIN=[tuple(map(float,w.split('-'))) for w in sys.argv[7].split(',')] if len(sys.argv)>7 and sys.argv[7] else []
N=int(os.environ.get('SUB',4)); SHUTTER=.5
SUB=[(k+.5)/N*SHUTTER-SHUTTER/2 for k in range(N)]
CUTS=[float(c) for c in os.environ.get('CUTS','').split(',') if c]
W,H=int(os.environ.get('W',1920)),int(os.environ.get('H',1080)); DSF=float(os.environ.get('DSF',1))
FLAGS=['--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist',
       '--font-render-hinting=none','--force-color-profile=srgb']  # --deterministic-mode bloque requestAnimationFrame en headless
os.makedirs(out,exist_ok=True)
def fast(t): return any(x<=t<y for x,y in WIN)
def side_ok(t,ts):  # l'échantillon reste du même côté d'une coupe que l'image
    return not any((t<c)!=(ts<c) for c in CUTS)
async def shot(pg):
    raw=await pg.screenshot(type='jpeg',quality=95)  # jpeg : 3x plus rapide que png
    im=Image.open(io.BytesIO(raw)).convert('RGB')
    return im.resize((W,H),Image.LANCZOS) if DSF!=1 else im
async def main():
    t0=time.time()
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path=HS,args=FLAGS)
        pg=await br.new_page(viewport={'width':W,'height':H},device_scale_factor=DSF)
        await pg.goto('file://'+os.path.abspath(page)+'?export'); await pg.evaluate('window.ready')
        f=a
        while f<b and time.time()-t0<BUDGET:
            t=f/FPS
            if fast(t):
                acc=None; n=0
                for s in SUB:
                    ts=t+s/FPS
                    if not side_ok(t,ts): continue
                    await pg.evaluate(f'window.renderAt({ts},{f})')
                    im=np.asarray(await shot(pg),dtype=np.float32); acc=im if acc is None else acc+im; n+=1
                Image.fromarray((acc/n).clip(0,255).astype(np.uint8)).save(f'{out}/f_{f:05d}.jpg',quality=94)
            else:
                await pg.evaluate(f'window.renderAt({t},{f})')
                (await shot(pg)).save(f'{out}/f_{f:05d}.jpg',quality=94)
            f+=1
        await br.close()
    print('next',f)
asyncio.run(main())
