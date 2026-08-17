# Drone Designer Lab v2 — Drone Types

الإصدار الثاني يضيف **نوع الدرون نفسه كقرار هندسي** قبل اختيار المكونات.

## أنواع الدرون
- Multirotor
- Fixed Wing
- VTOL Hybrid
- Single-Rotor Helicopter

كل نوع:
- يغيّر النموذج البصري.
- يغيّر خيارات الهيكل.
- يغيّر خيارات عدد المحركات.
- يغيّر خيارات المراوح / الروتور.
- يؤثر على السرعة والثبات والمدى والحمولة والسلامة.
- يرفع أو يخفض Mission Compatibility حسب المهمة.

## أمثلة
- Racing → Multirotor غالباً أفضل.
- Mapping / Survey → Fixed Wing أو VTOL.
- Delivery → VTOL / Helicopter / Multirotor.
- Inspection → Multirotor / Helicopter / VTOL.
- Agriculture → Fixed Wing / VTOL / Multirotor.

## مهم
القيم داخل اللعبة مبسطة للتعليم وليست حسابات هندسية حقيقية.

## GitHub Pages
ارفع فقط:
- index.html
- .nojekyll
- README.md

ثم:
Settings → Pages → Deploy from a branch → main → /root
