# CFA L1 Study Map — FSA LM1 (v1.1)

## التشغيل
- ارفع الفولدر ده زي ما هو على GitHub Pages (أو أي سيرفر static). مش محتاج build.
- للتجربة على الجهاز: `python -m http.server` جوه الفولدر وافتح http://localhost:8000

## أول استخدام
1. **Files** → ارفع `FSA-LM01-Schweser.pdf` و `FSA-LM01-Curriculum.pdf`.
2. **Files → Question banks** → ارفع: Schweser `4.1 ... Answers` · UWorld `5. ...` (فيه ✔) · AnalystPrep `6.1 ... Answers` · Curriculum `3. ... Practices`.
3. افتح **Study Map**.

## الملفات
- `data/FSA-LM01.json` ← بيتولد من الإكسل: `python tools/xlsx_to_json.py FSA-LM01_StudyMap_v1.1.xlsx data/FSA-LM01.json`
- أو ارفع الإكسل مباشرة من **Files → Study Map (Excel)**.
- `js/parsers.js` ← قراءة الأسئلة من ملفات الـ PDF على جهازك.
- `js/store.js` ← التخزين (IndexedDB). ده المكان اللي هيتربط بـ Supabase.

## ملاحظات
- نص الأسئلة مش موجود في الموقع؛ بيتقري من ملفاتك على جهازك بس.
- Schweser Quiz (7 أسئلة جوه الكتاب) متعدّة في الخريطة بس مش بتتستورد.
