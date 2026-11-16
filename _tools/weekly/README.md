# Weekly tarot (news/weekly-tarot) — how to update each week
1. python3 draw_and_thumbs.py <ISO Monday> thumbs   -> prints the 12-card draw (stage source PNGs under /mnt/user-data/uploads/mytarot/learn/images/ first)
2. Write a JSON like w2569-11-16.json (range, iso, sub, hook, theme, draws{sign:{en,th,img,link,kw,all,love,work,tip}}). Each sign must have DIFFERENT text, based on the card meaning. Gentle tone for hard cards (Tower, Death, 3/10 Swords). Entertainment only; no medical/legal/financial promises.
3. Archive the previous week: copy news/weekly-tarot.html to news/weekly-tarot-<prevISO>.html, replace canonical and og:url with its own URL, add it to sitemap.xml.
3b. Cover: python3 make_cover.py "23–29 พ.ย. 69" (same background bg-weekly.png, only the date text changes) -> images/news/hero-weekly-tarot.webp + card-weekly-tarot.webp. Archived weeks keep a copy of their own cover (rename before overwriting).
4. python3 build_weekly.py <json>  -> writes /mnt/user-data/outputs/stage/news/weekly-tarot.html
5. Commit weekly-tarot.html, new thumbs (images/weekly/c-*.webp) and sitemap to D:\mytarot. The user pushes with git.
6. Update the card in news/index.html (title with new date range, date label) .
