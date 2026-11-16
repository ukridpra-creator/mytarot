"""Usage: python3 draw_and_thumbs.py <ISO monday date e.g. 2026-11-23>
Draws 12 cards (one per sign, no repeats) deterministically from cards.json,
prints the draw as JSON skeleton, and (if source PNGs are staged under
/mnt/user-data/uploads/mytarot/learn/images/) writes webp thumbs to
/mnt/user-data/outputs/stage/images/weekly/ . Zodiac thumbs z-*.webp already exist on the site."""
import json,random,sys,os
iso=sys.argv[1]
cards=json.load(open(os.path.join(os.path.dirname(__file__),'cards.json'),encoding='utf8'))
signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']
random.seed(f'mytarot-weekly-{iso}')
pick=random.sample(range(78),12)
out={}
for s,i in zip(signs,pick):
    c=cards[i]; out[s]={'en':c['en'],'th':c['th_pron'],'img':c['img'],'link':c['link'],'kw':c['kw'],'src':c['src'],'meaning':c['meaning']}
print(json.dumps(out,ensure_ascii=False,indent=1))
if len(sys.argv)>2 and sys.argv[2]=='thumbs':
    from PIL import Image
    os.makedirs('/mnt/user-data/outputs/stage/images/weekly',exist_ok=True)
    for d in out.values():
        p='/mnt/user-data/uploads/mytarot/learn/images/'+d['src']
        im=Image.open(p).convert('RGB'); im.thumbnail((360,540)); im.save(f"/mnt/user-data/outputs/stage/images/weekly/c-{d['img']}.webp",'WEBP',quality=80)
