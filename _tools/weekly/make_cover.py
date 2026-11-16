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
# headline: gold gradient text with glow, thin gold rule, date in glass pill
def gold_text(im,xy,txt,size):
    from PIL import ImageChops
    ft=f(size); m=Image.new('L',im.size,0); ImageDraw.Draw(m).text(xy,txt,font=ft,fill=255)
    glow=m.filter(ImageFilter.GaussianBlur(18)).point(lambda v:int(v*0.55))
    im.paste(Image.new('RGB',im.size,(255,170,40)),(0,0),glow)
    sh=m.filter(ImageFilter.GaussianBlur(4)); sh=ImageChops.offset(sh,4,6).point(lambda v:int(v*0.7))
    im.paste(Image.new('RGB',im.size,(10,4,24)),(0,0),sh)
    g=Image.new('RGB',im.size); gd=ImageDraw.Draw(g); y0=xy[1]
    for y in range(im.size[1]):
        t=min(1,max(0,(y-y0)/(size*1.35)))
        c=(int(255-(255-214)*t),int(244-(244-150)*t),int(190-(190-40)*t)); gd.line((0,y,im.size[0],y),fill=c)
    im.paste(g,(0,0),m)
gold_text(im,(48,250),'ไพ่ 12 ราศี',150)
d=ImageDraw.Draw(im)
d.line((52,452,640,452),fill=(251,191,36),width=3); d.ellipse((640,447,652,459),fill=(251,191,36))
pill=Image.new('RGBA',im.size,(0,0,0,0)); pd=ImageDraw.Draw(pill)
pd.rounded_rectangle((44,492,760,576),radius=42,fill=(20,10,50,170),outline=(251,191,36,200),width=2)
im=Image.alpha_composite(im.convert('RGBA'),pill).convert('RGB'); d=ImageDraw.Draw(im)
d.text((78,500),'ประจำสัปดาห์ '+rng,font=f(52),fill=(255,255,255))
d.text((50,610),'ความรัก การงาน การเงิน ครบทุกราศี',font=f(40),fill=(253,230,138))
d.text((1400,850),'mytarot.vip',font=f(30),fill=(200,200,215))
im.save(os.path.join(OUT,'hero-weekly-tarot.webp'),'WEBP',quality=84)
im.resize((1000,563),Image.LANCZOS).save(os.path.join(OUT,'card-weekly-tarot.webp'),'WEBP',quality=82)
im.convert('RGB').save('/tmp/hero-weekly.png')
print('ok')

# ---- vertical 2:3 Pinterest pin (same background) ----
bg=Image.open(bgp).convert('RGB'); sc=1500/900; big=bg.resize((int(1600*sc),1500),Image.LANCZOS)
x0=int(1250*sc)-500; pin=big.crop((x0,0,x0+1000,1500))
ov=Image.new('RGBA',pin.size,(0,0,0,0)); od=ImageDraw.Draw(ov)
for y in range(0,700): od.line((0,y,1000,y),fill=(10,5,30,int(230*(1-y/700))))
pin=Image.alpha_composite(pin.convert('RGBA'),ov).convert('RGB'); d=ImageDraw.Draw(pin)
d.rounded_rectangle((300,60,700,124),radius=32,fill=(251,191,36)); d.text((500,92),'ไพ่ประจำสัปดาห์',font=f(40),fill=(30,20,0),anchor='mm')
d.text((500,260),'ไพ่ 12 ราศี',font=f(150),fill=(252,224,140),anchor='mm')
d.text((500,395),rng,font=f(64),fill='white',anchor='mm')
d.text((500,1400),'ความรัก การงาน การเงิน ครบทุกราศี',font=f(42),fill=(253,230,138),anchor='mm')
d.text((500,1455),'mytarot.vip',font=f(30),fill=(210,210,225),anchor='mm')
pin.save(os.path.join(OUT,'pin-weekly-tarot.jpg'),'JPEG',quality=88)
