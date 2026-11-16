import json,re,sys,html
U='/mnt/user-data/uploads/mytarot/'
O='/mnt/user-data/outputs/stage/'
SIGNS={'aries':('เมษ','21 มี.ค. – 19 เม.ย.'),'taurus':('พฤษภ','20 เม.ย. – 20 พ.ค.'),'gemini':('เมถุน','21 พ.ค. – 20 มิ.ย.'),'cancer':('กรกฎ','21 มิ.ย. – 22 ก.ค.'),'leo':('สิงห์','23 ก.ค. – 22 ส.ค.'),'virgo':('กันย์','23 ส.ค. – 22 ก.ย.'),'libra':('ตุลย์','23 ก.ย. – 22 ต.ค.'),'scorpio':('พิจิก','23 ต.ค. – 21 พ.ย.'),'sagittarius':('ธนู','22 พ.ย. – 21 ธ.ค.'),'capricorn':('มังกร','22 ธ.ค. – 19 ม.ค.'),'aquarius':('กุมภ์','20 ม.ค. – 18 ก.พ.'),'pisces':('มีน','19 ก.พ. – 20 มี.ค.')}
SUIT_TH={'Cups':'ถ้วย','Swords':'ดาบ','Wands':'ไม้เท้า','Pentacles':'เหรียญ'}
def fixth(en,th):
    m=re.match(r'(King|Queen|Page|Ace) of (Cups|Swords|Wands|Pentacles)$',en)
    if not m: return th
    return {'King':'พระราชาถือ','Queen':'ราชินีถือ','Page':'เด็กถือ','Ace':'หนึ่ง'}[m.group(1)]+SUIT_TH[m.group(2)]

SHARE='<div class="share-row"><button type="button" class="share-btn" id="shareBtn">🔗 คัดลอกลิงก์ไปแชร์</button></div>\n<style>.share-row{text-align:center;margin:14px 0 4px}.share-btn{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.5);color:#f0d77a;padding:10px 22px;border-radius:999px;font-size:14px;font-family:inherit;cursor:pointer}.share-btn:active{transform:scale(.97)}</style>\n<script>(function(){var b=document.getElementById(\'shareBtn\');if(!b)return;b.addEventListener(\'click\',function(){var u=location.origin+\'/news/weekly-tarot\';function ok(){b.textContent=\'✓ คัดลอกลิงก์แล้ว\';setTimeout(function(){b.textContent=\'🔗 คัดลอกลิงก์ไปแชร์\'},2200)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,fb)}else fb();function fb(){var t=document.createElement(\'textarea\');t.value=u;document.body.appendChild(t);t.select();try{document.execCommand(\'copy\');ok()}catch(e){prompt(\'คัดลอกลิงก์นี้\',u)}document.body.removeChild(t)}})})();</script>\n\n'

def esc(s): return html.escape(s,quote=False)
def build(data,slug='weekly-tarot'):
    base=open(U+'horoscope/2570-cny.html',encoding='utf8').read()
    head=base[:base.index('<body>')]
    url=f'https://www.mytarot.vip/news/{slug}'
    T=f"ไพ่ทาโรต์ประจำสัปดาห์ {data['range']} ดวง 12 ราศี | mytarot.vip"
    desc=f"ไพ่ทาโรต์ประจำสัปดาห์ {data['range']} เปิดไพ่ครบ 12 ราศี ความรัก การงาน การเงิน และคำแนะนำของแต่ละราศี {data['hook']} ค่ะ"
    kw='ไพ่ทาโรต์ประจำสัปดาห์,ดูดวงไพ่ยิปซีรายสัปดาห์,ดวงรายสัปดาห์ 12 ราศี,ไพ่ยิปซี 12 ราศี'
    head=re.sub(r'<title>.*?</title>',f'<title>{T}</title>',head)
    for pat,val in [(r'(<meta name="description" content=")[^"]*(")',desc),(r'(<meta name="keywords" content=")[^"]*(")',kw),(r'(<link rel="canonical" href=")[^"]*(")',url),(r'(<meta property="og:title" content=")[^"]*(")',T),(r'(<meta property="og:description" content=")[^"]*(")',desc),(r'(<meta property="og:url" content=")[^"]*(")',url),(r'(<meta property="og:image" content=")[^"]*(")','https://www.mytarot.vip/images/news/hero-weekly-tarot.webp'),(r'(<meta name="twitter:title" content=")[^"]*(")',T),(r'(<meta name="twitter:description" content=")[^"]*(")',desc),(r'(<meta name="twitter:image" content=")[^"]*(")','https://www.mytarot.vip/images/news/hero-weekly-tarot.webp')]:
        head=re.sub(pat,lambda m:m.group(1)+val+m.group(2),head)
    css='''<style>
.wk-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:18px;padding:14px;margin-bottom:14px;}
.wk-top{display:flex;gap:12px;align-items:center;margin-bottom:10px;}
.wk-zi{width:54px;height:54px;border-radius:14px;flex:none;}
.wk-sign{font-size:16px;font-weight:800;color:#fff;}
.wk-date{font-size:11.5px;color:rgba(255,255,255,0.4);}
.wk-body{display:flex;gap:12px;align-items:flex-start;}
.wk-img{width:96px;border-radius:10px;flex:none;border:1px solid rgba(255,255,255,0.12);}
.wk-cardname{font-size:13px;font-weight:700;color:#fbbf24;margin-bottom:4px;}
.wk-cardname a{color:#fbbf24;text-decoration:none;border-bottom:1px dotted rgba(251,191,36,0.5);}
.wk-kw{font-size:11.5px;color:rgba(255,255,255,0.45);margin-bottom:6px;}
.wk-txt p{margin:0 0 6px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.78);}
.wk-txt b{color:#e9d5ff;font-weight:700;}
.sec-box a{color:#d8c9ff;text-decoration:underline;text-underline-offset:3px;}
@media(max-width:380px){.wk-img{width:80px}}
</style>
'''
    head=head.replace('</head>',css+'</head>')
    cs='color:rgba(255,255,255,0.3);text-decoration:none;'
    out=head+'<body>\n\n'
    out+=f'<nav aria-label="breadcrumb" style="padding:16px 20px 0;font-size:12px;color:rgba(255,255,255,0.3);"><a href="/" style="{cs}">mytarot.vip</a><span> › </span><a href="/news/" style="{cs}">ข่าวดูดวง</a><span> › </span><span style="color:rgba(255,255,255,0.5);">ไพ่ประจำสัปดาห์</span></nav>\n<a href="/news/" class="back-link">← ข่าวดูดวง</a>\n<img src="/images/news/hero-weekly-tarot.webp" alt="ไพ่ประจำสัปดาห์ '+esc(data["range"])+' ดวง 12 ราศี" width="1600" height="900" fetchpriority="high" decoding="async" style="display:block;width:100%;max-width:720px;height:auto;margin:0 auto;aspect-ratio:16/9;">\n\n'
    out+=f'<div class="hero">\n  <div class="eyebrow">✦ ไพ่ทาโรต์ประจำสัปดาห์ · {esc(data["range"])}</div>\n  <h1 class="hero-title">ไพ่ประจำสัปดาห์<br><span>ดวง 12 ราศี {esc(data["range"])}</span></h1>\n  <p class="hero-sub">{esc(data["sub"])}</p>\n</div>\n\n'+SHARE
    out+=f'<div class="sec">\n  <div class="sec-box">\n    <h2 class="sec-label">✦ ธีมสัปดาห์นี้</h2>\n    <p class="sec-text">{data["theme"]}</p>\n    <p class="sec-text" style="font-size:12.5px;color:rgba(255,255,255,0.5);">เปิดไพ่จากสำรับของ mytarot.vip ให้ราศีละ 1 ใบ สุ่มโดยระบบ แล้วตีความตามความหมายของไพ่ ใช้ราศีตามวันเกิดแบบสากล (21 มี.ค. = เมษ) อ่านเพื่อความบันเทิงและเป็นแง่คิดนะคะ</p>\n  </div>\n</div>\n\n'
    out+='<div class="sec">\n'
    for z,d in data['draws'].items():
        n,dr=SIGNS[z]
        out+=f'''  <article class="wk-card" id="{z}">
    <div class="wk-top"><img class="wk-zi" src="/images/weekly/z-{z}.webp" alt="ราศี{n}" width="54" height="54" loading="lazy"><div><div class="wk-sign">ราศี{n}</div><div class="wk-date">{dr}</div></div></div>
    <div class="wk-body"><img class="wk-img" src="/images/weekly/c-{d['img']}.webp" alt="ไพ่ {esc(d['en'])} ราศี{n}" width="96" height="144" loading="lazy"><div class="wk-txt">
      <div class="wk-cardname"><a href="{d['link']}">{esc(d['en'])} · {esc(fixth(d['en'],d['th']))}</a></div>
      <div class="wk-kw">{esc(d['kw'])}</div>
      <p><b>ภาพรวม</b> {d['all']}</p>
      <p><b>❤️ ความรัก</b> {d['love']}</p>
      <p><b>💼 การงาน/เงิน</b> {d['work']}</p>
      <p><b>✨ คำแนะนำ</b> {d['tip']}</p>
    </div></div>
  </article>
'''
    out+='</div>\n\n'
    out+='<div class="sec">\n  <div class="sec-box">\n    <h2 class="sec-label">✦ อยากให้ไพ่ตอบเรื่องของตัวเอง</h2>\n    <p class="sec-text">ไพ่ประจำสัปดาห์เป็นภาพรวมกว้างๆ ของแต่ละราศี ถ้าอยากถามเรื่องเฉพาะของคุณ เช่น ความรัก การงาน หรือคำถามใช่/ไม่ใช่ ลองเปิดไพ่เองฟรีได้ที่ <a href="/pages/tarot">ดูดวงไพ่ยิปซีออนไลน์</a> หรือ <a href="/pages/tarot-yesno">ไพ่ยิปซี Yes or No</a></p>\n  </div>\n</div>\n\n'
    out+='<div class="cta-box">\n  <div class="cta-title">เปิดไพ่ยิปซีของคุณเอง</div>\n  <div class="cta-desc">ตั้งคำถามในใจ แล้วให้ไพ่ตอบ ฟรี ภาษาไทย</div>\n  <a href="/pages/tarot" class="cta-btn">🔮 ดูดวงไพ่ยิปซี · ฟรี</a>\n  <a href="/learn/tarot-meaning" class="cta-btn-sec">📖 ความหมายไพ่ทาโรต์ 78 ใบ</a>\n</div>\n\n'
    faq=[('ไพ่ทาโรต์ประจำสัปดาห์เปิดยังไง','เปิดไพ่จากสำรับของ mytarot.vip ราศีละ 1 ใบ โดยให้ระบบสุ่มแล้วตีความตามความหมายไพ่ ปรับข้อความให้เข้ากับความรัก การงาน การเงิน และคำแนะนำของแต่ละราศีค่ะ'),
         ('ต้องอ่านราศีไหน','อ่านราศีตามวันเกิดแบบสากล เช่น เกิด 21 มี.ค.–19 เม.ย. คือราศีเมษ ถ้าอยากอ่านเพิ่ม ลองอ่านราศีลัคนาหรือราศีของคนใกล้ตัวด้วยได้ค่ะ'),
         ('ไพ่ประจำสัปดาห์อัปเดตเมื่อไหร่','อัปเดตทุกวันจันทร์ ครอบคลุมสัปดาห์จันทร์ถึงอาทิตย์ค่ะ'),
         ('คำทำนายแม่นแค่ไหน','เป็นการตีความไพ่เพื่อความบันเทิงและเป็นแง่คิด ไม่ใช่การรับประกันเหตุการณ์ ใช้ประกอบการตัดสินใจร่วมกับข้อมูลจริงของคุณค่ะ')]
    out+='<div class="seo-block">\n  <h2>ไพ่ทาโรต์ประจำสัปดาห์ '+esc(data['range'])+' ดวง 12 ราศี</h2>\n  <p>'+desc+'</p>\n'+''.join(f'  <h3>{q}</h3>\n  <p>{a}</p>\n' for q,a in faq)+'</div>\n\n'
    bc={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"mytarot.vip","item":"https://www.mytarot.vip"},{"@type":"ListItem","position":2,"name":"ข่าวดูดวง","item":"https://www.mytarot.vip/news"},{"@type":"ListItem","position":3,"name":"ไพ่ประจำสัปดาห์"}]}
    art={"@context":"https://schema.org","@type":"Article","headline":T.replace(' | mytarot.vip',''),"description":desc,"image":"https://www.mytarot.vip/images/news/hero-weekly-tarot.webp","inLanguage":"th","datePublished":data['iso'],"dateModified":data['iso'],"author":{"@type":"Organization","name":"mytarot.vip"},"publisher":{"@type":"Organization","name":"mytarot.vip","logo":{"@type":"ImageObject","url":"https://www.mytarot.vip/images/favicon.png"}},"mainEntityOfPage":url}
    fq={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]}
    for d in (bc,art,fq): out+='<script type="application/ld+json">\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n</script>\n\n'
    out+='</body>\n</html>\n'
    p=O+'news/'+slug+'.html'
    import os; os.makedirs(os.path.dirname(p),exist_ok=True)
    open(p,'wb').write(out.replace('\r\n','\n').replace('\n','\r\n').encode('utf8')); print('wrote',p,len(out))
if __name__=='__main__': build(json.load(open(sys.argv[1],encoding='utf8')))
