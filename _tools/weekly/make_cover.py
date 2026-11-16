"""python3 make_cover.py "16–22 พ.ย. 69"  -> hero-weekly-tarot.webp (1600x900), card-weekly-tarot.webp (1000x563)
Background is built once (bg-weekly.png, fan of cards + stars). Only the text changes each week."""
import sys,os,random,math
from PIL import Image,ImageDraw,ImageFont,ImageFilter
D=os.path.dirname(os.path.abspath(__file__)); OUT=sys.argv[2] if len(sys.argv)>2 else '/mnt/user-data/outputs/stage/images/news'
rng=sys.argv[1]
W,H=1600,900
bgp=os.path.join(D,'bg-weekly.png')
if not os.path.exists(bgp):
    bg=Image.new('RGB',(W,H),(12,8,32)); px=bg.load()
    for y in range(H):
        for x in range(W):
            d=math.hypot(x-1150,y-380)/1100; t=max(0,1-d)
            px[x,y]=(int(14+70*t*t),int(8+20*t),int(36+90*t))
    r=random.Random(7); dr=ImageDraw.Draw(bg)
    for _ in range(160):
        x,y=r.randrange(W),r.randrange(H); s=r.choice([1,1,2]); c=r.randint(120,255); dr.ellipse((x,y,x+s,y+s),fill=(c,c,min(255,c+20)))
    names=['the-magician','the-tower','queen-of-cups','the-chariot','the-hermit']
    cards=[Image.open(f'/mnt/user-data/outputs/stage/images/weekly/c-{n}.webp').convert('RGBA').resize((300,450)) for n in names]
    cx,cy=1250,480
    for i,c in enumerate(cards):
        a=(i-2)*13; c2=c.rotate(-a,expand=True,resample=Image.BICUBIC)
        sh=Image.new('RGBA',c2.size,(0,0,0,0)); sh.paste((0,0,0,140),mask=c2.split()[3]); sh=sh.filter(ImageFilter.GaussianBlur(14))
        x=int(cx+(i-2)*125-c2.width/2); y=int(cy+abs(i-2)*28-c2.height/2)
        bg.paste(sh,(x+8,y+14),sh); bg.paste(c2,(x,y),c2)
    ov=Image.new('RGBA',(W,H)); od=ImageDraw.Draw(ov)
    for x in range(W):
        a=int(235*max(0,1-x/1000)); od.line((x,0,x,H),fill=(8,6,24,a))
    bg=Image.alpha_composite(bg.convert('RGBA'),ov).convert('RGB'); bg.save(bgp)
im=Image.open(bgp).convert('RGB'); d=ImageDraw.Draw(im)
B='/usr/share/fonts/opentype/tlwg/Loma-Bold.otf'
f=lambda s:ImageFont.truetype(B,s)
d.rounded_rectangle((44,40,400,104),radius=30,fill=(251,191,36)); d.text((70,48),'ไพ่ประจำสัปดาห์',font=f(40),fill=(30,20,0))
d.rectangle((44,300,700,470),fill=(37,99,235)); d.text((72,300),'ไพ่ 12 ราศี',font=f(120),fill='white')
d.text((46,500),'ประจำสัปดาห์ '+rng,font=f(58),fill=(252,211,77))
d.text((46,600),'ความรัก การงาน การเงิน ครบทุกราศี',font=f(42),fill='white')
d.text((1400,850),'mytarot.vip',font=f(30),fill=(200,200,215))
im.save(os.path.join(OUT,'hero-weekly-tarot.webp'),'WEBP',quality=84)
im.resize((1000,563),Image.LANCZOS).save(os.path.join(OUT,'card-weekly-tarot.webp'),'WEBP',quality=82)
im.convert('RGB').save('/tmp/hero-weekly.png')
print('ok')
