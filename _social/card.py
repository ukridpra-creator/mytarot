import json,sys,asyncio,base64,os,random
from playwright.async_api import async_playwright
FD='/home/claude/social/node_modules/@fontsource'
def ff(name,fam,w):
    p=f'{FD}/{name}/files/{name}-thai-{w}-normal.woff2'
    l=f'{FD}/{name}/files/{name}-latin-{w}-normal.woff2'
    b=lambda f:base64.b64encode(open(f,'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b(p)}) format('woff2');unicode-range:U+0E01-0E5B,U+200B-200D,U+25CC}}@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b(l)}) format('woff2');unicode-range:U+0000-00FF}}"
CSS=ff('mitr','Mitr',500)+ff('mitr','Mitr',300)+ff('prompt','Prompt',400)+ff('prompt','Prompt',300)
def stars(n=70,seed=1):
    r=random.Random(seed);s=''
    for _ in range(n):
        s+=f'<i style="left:{r.random()*100:.1f}%;top:{r.random()*100:.1f}%;width:{r.choice([2,3,4])}px;height:{r.choice([2,3,4])}px;opacity:{r.uniform(.3,.95):.2f}"></i>'
    return s
def html(d):
    kind=d.get('kind','list'); title=d['title']; sub=d.get('sub',''); lines=d.get('lines',[]); foot=d.get('foot','mytarot.vip')
    if kind=='list':
        body=''.join(f'<div class="row"><b>{a}</b><span>{b}</span></div>' for a,b in lines)
    elif kind=='grid':
        body='<div class="grid">'+''.join(f'<div class="g"><b>{a}</b><span>{b}</span></div>' for a,b in lines)+'</div>'
    elif kind=='pick':
        body='<div class="cards">'+''.join(f'<div class="cb"><em>{i+1}</em></div>' for i in range(len(lines)))+'</div><div class="hint">'+d.get('hint','')+'</div>'
    else:
        body=f'<div class="big">{d.get("text","")}</div>'
    return f'''<html><head><meta charset="utf-8"><style>{CSS}
*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 18%,#5b2a86 0%,#2a1250 45%,#0d0620 100%);font-family:'Prompt','Mitr',sans-serif;color:#fff}}
i{{position:absolute;background:#ffe9a8;border-radius:50%;box-shadow:0 0 8px #ffd56b}}
.frame{{position:absolute;inset:38px;border:3px solid #e8c36a;border-radius:36px}}.frame:after{{content:'';position:absolute;inset:12px;border:1px solid rgba(232,195,106,.55);border-radius:26px}}
.moon{{position:absolute;top:92px;left:50%;transform:translateX(-50%);width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff7d6,#f1cf7a 60%,#c9a043);box-shadow:0 0 60px rgba(255,214,120,.65)}}
.moon:after{{content:'';position:absolute;left:30px;top:-6px;width:116px;height:116px;border-radius:50%;background:#3a1a66}}
h1{{position:absolute;top:240px;left:0;right:0;text-align:center;font-family:'Mitr';font-weight:500;font-size:84px;line-height:1.2;color:#ffe08a;text-shadow:0 4px 24px rgba(255,200,80,.45);padding:0 80px}}
.sub{{position:absolute;top:{d.get('subtop',405)}px;left:0;right:0;text-align:center;font-size:36px;font-weight:300;color:#f3e6ff;letter-spacing:1px}}
.body{{position:absolute;top:{d.get('bodytop',490)}px;left:90px;right:90px}}
.row{{display:flex;gap:22px;align-items:center;padding:13px 26px;margin-bottom:12px;background:rgba(255,255,255,.08);border:1px solid rgba(232,195,106,.35);border-radius:22px;font-size:{d.get('fs',37)}px;font-weight:300}}
.row b{{font-family:'Mitr';font-weight:500;color:#ffe08a;min-width:{d.get('bw',190)}px;font-size:{d.get('fs',37)+3}px}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}.g{{padding:14px 20px;background:rgba(255,255,255,.08);border:1px solid rgba(232,195,106,.35);border-radius:22px;font-size:29px;font-weight:300;line-height:1.35;min-height:112px}}.g b{{display:block;font-family:'Mitr';font-weight:500;color:#ffe08a;font-size:34px;margin-bottom:2px}}
.cards{{display:flex;gap:30px;justify-content:center;margin-top:20px}}.cb{{width:270px;height:430px;border-radius:22px;border:3px solid #e8c36a;background:repeating-linear-gradient(45deg,#4a2280,#4a2280 14px,#3a1a66 14px,#3a1a66 28px);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(232,195,106,.35)}}.cb em{{font-style:normal;font-family:'Mitr';font-size:120px;color:#ffe08a;text-shadow:0 0 30px #000}}
.hint{{text-align:center;font-size:44px;margin-top:50px;color:#fff3c9;font-family:'Mitr';font-weight:300}}
.big{{font-family:'Mitr';font-size:64px;line-height:1.5;text-align:center;padding-top:40px;color:#fff}}
.foot{{position:absolute;bottom:54px;left:0;right:0;text-align:center;font-size:34px;color:#e8c36a;letter-spacing:3px}}
</style></head><body>{stars()}<div class="frame"></div><div class="moon"></div><h1>{title}</h1><div class="sub">{sub}</div><div class="body">{body}</div><div class="foot">✦ {foot} ✦</div></body></html>'''
async def main(spec,out):
    d=json.load(open(spec))
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1080,'height':1350})
        await pg.set_content(html(d));await pg.wait_for_timeout(500)
        await pg.screenshot(path=out);await b.close()
asyncio.run(main(sys.argv[1],sys.argv[2]))
