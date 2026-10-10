"""Planche d'images clés pour validation avant rendu.
Usage : python3 preview.py <page.html> <planche.jpg> 1.2,3.5,8.0,...  (W/H en variables d'env si vertical)
Chaque vignette porte son temps. Affiche les erreurs JS de la page."""
import asyncio, sys, os, io
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
HS='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
page,out=sys.argv[1],sys.argv[2]; TS=[float(x) for x in sys.argv[3].split(',')]
W,H=int(os.environ.get('W',1920)),int(os.environ.get('H',1080))
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(executable_path=HS,args=['--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await br.new_page(viewport={'width':W,'height':H}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+os.path.abspath(page)+'?export'); await pg.evaluate('window.ready')
        ims=[]
        for t in TS:
            await pg.evaluate(f'window.renderAt({t})')
            ims.append(Image.open(io.BytesIO(await pg.screenshot(type='jpeg',quality=80))))
        await br.close()
    tw=480 if W>=H else 270; th=int(tw*H/W); cols=3 if W>=H else 4; rows=-(-len(ims)//cols)
    sheet=Image.new('RGB',(tw*cols,th*rows)); d=ImageDraw.Draw(sheet)
    for i,(im,t) in enumerate(zip(ims,TS)):
        x,y=(i%cols)*tw,(i//cols)*th; sheet.paste(im.resize((tw,th)),(x,y)); d.rectangle([x,y,x+52,y+18],fill=(0,0,0)); d.text((x+4,y+3),f'{t:.2f}s',fill=(255,160,90))
    sheet.save(out); print('erreurs JS :',errs)
asyncio.run(main())
