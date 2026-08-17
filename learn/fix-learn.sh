#!/bin/bash
# แก้ไฟล์ไพ่ในโฟลเดอร์ learn ทั้งหมดทีเดียว (ใช้ได้กับ Git Bash บน Windows ไม่ต้องมี Python)
#   1) แก้ชื่อใน breadcrumb JSON-LD ที่เป็น "The Fool" ทุกใบ ให้เป็นชื่อไพ่จริง
#   2) แก้ og:image / twitter:image จากรูปกลาง เป็นรูปไพ่ของใบนั้นๆ
#
# วิธีใช้:  วางไฟล์นี้ไว้ในโฟลเดอร์ learn แล้วรัน   bash fix-learn.sh

FIX_OG_IMAGE=1     # ไม่อยากแก้ og:image ให้เปลี่ยนเป็น 0

mkdir -p _backup
n=0

for f in *.html; do
  [ "$f" = "index.html" ] && continue
  [ -f "$f" ] || continue

  # ดึงชื่อไพ่จาก titleEn ใน cardData
  raw=$(sed -n 's/.*titleEn:[[:space:]]*"\([^"]*\)".*/\1/p' "$f" | head -1)
  if [ -z "$raw" ]; then
    echo "  ข้าม $f (ไม่เจอ titleEn)"
    continue
  fi

  # ACE OF WANDS -> Ace of Wands
  name=$(echo "$raw" | awk '{
    out="";
    for (i=1; i<=NF; i++) {
      w = tolower($i);
      if (i > 1 && (w=="of" || w=="the" || w=="and")) t = w;
      else t = toupper(substr(w,1,1)) substr(w,2);
      out = (i==1) ? t : out " " t;
    }
    print out;
  }')

  cp "$f" "_backup/$f"

  # 1) breadcrumb — เฉพาะบรรทัด position 3 เท่านั้น
  sed -i "s|\(\"position\": 3, \"name\": \)\"[^\"]*\"|\1\"$name\"|" "$f"

  # 2) og:image + twitter:image
  if [ "$FIX_OG_IMAGE" = "1" ]; then
    img=$(sed -n 's/.*"image":[[:space:]]*"\(https:[^"]*\)".*/\1/p' "$f" | head -1)
    if [ -n "$img" ]; then
      sed -i "s|\(<meta property=\"og:image\" content=\)\"[^\"]*\"|\1\"$img\"|" "$f"
      sed -i "s|\(<meta name=\"twitter:image\" content=\)\"[^\"]*\"|\1\"$img\"|" "$f"
    fi
  fi

  echo "  แก้แล้ว $f -> $name"
  n=$((n+1))
done

echo ""
echo "เสร็จแล้วครับ แก้ไป $n ไฟล์"
echo "ไฟล์เดิมสำรองไว้ในโฟลเดอร์ _backup"
