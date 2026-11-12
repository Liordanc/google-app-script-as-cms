# CMS Personal — Design System

מסמך עיצוב ייעודי לממשק הניהול של `google-app-script-as-cms`. הוא מאחד את כל החלטות העיצוב למוצר אחד, במקום לערבב בין דוגמאות השראה של Figma, Anthropic ו־Clay. קובצי ההשראה נשארים references בלבד; אין תלות במותגים, פונטים קנייניים או צבעי המותג שלהם.

## מטרות

- ממשק CMS אישי, שקט, ברור ויעיל לעורך יחיד.
- עברית ו־RTL כברירת מחדל, כולל טיפול נכון בשדות מזהים, slugs ותאריכים.
- ממשק ניהול לעמודים/כתבות, עם סטטוסים, Preview וקישור ל־Google Docs.
- מערכת רכיבים קטנה ועקבית; צבע משמש למשמעות ולא לקישוט.
- עיצוב רספונסיבי ונגיש למקלדת ולקוראי מסך.

## שפה חזותית

**הכיוון:** סביבת עבודה נקייה וממוקדת. רקע אפור־בהיר, משטחי תוכן לבנים, טיפוגרפיה כהה, צבע ראשי אינדיגו לפעולה, וצבעים סמנטיים לסטטוסים. סרגל צד כהה משמש ניווט בלבד. להימנע ממשטחי פסטל גדולים, צללים כבדים, גרדיאנטים דקורטיביים ויותר מדי accent colors.

### טוקני צבע

| Token | ערך | שימוש |
|---|---|---|
| `canvas` | `#F6F7FB` | רקע האפליקציה |
| `surface` | `#FFFFFF` | כרטיסים, טבלאות, טפסים |
| `surface-muted` | `#F9FAFC` | רקע שורת כותרת/מצב משני |
| `ink` | `#172033` | טקסט ראשי |
| `muted` | `#687386` | תיאור, עזרה, metadata |
| `line` | `#E5E9F0` | מסגרות ומפרידים |
| `primary` | `#5146E5` | פעולה ראשית, קישור ופוקוס |
| `primary-hover` | `#4035C7` | hover לפעולה הראשית |
| `success` | `#147D52` | פורסם/הצלחה |
| `warning` | `#925500` | טיוטה/אזהרה |
| `danger` | `#B42335` | שגיאה/פעולה הרסנית |
| `info` | `#1769AA` | מידע/בדיקה |
| `nav` | `#171B2E` | משטח ניווט צדדי |

יש לוודא ניגודיות WCAG AA בכל זוג צבעים בפועל. אין להסתמך על צבע בלבד כדי לזהות סטטוס — להציג גם תווית טקסט.

### טיפוגרפיה

- עברית: `Assistant`, עם fallback ל־`Heebo`, `Arial`, `sans-serif`.
- לטינית וקוד: אותו font stack; מזהי `id`, כתובות slug ו־URLs מוצגים ב־LTR (`dir="ltr"`, `unicode-bidi: plaintext`).
- `display`: 32px / 1.2 / 700 — כותרת מסך.
- `heading`: 19px / 1.35 / 700 — אזור/כרטיס.
- `body`: 14–15px / 1.55 / 400 — גוף ממשק.
- `label`: 12–13px / 1.4 / 650 — label ושדות.
- `caption`: 11–12px / 1.45 / 400 — metadata, hint ו־timestamps.

### ריווח, צורה ותנועה

- בסיס ריווח 4px; צעדים נפוצים: 4, 8, 12, 16, 20, 24, 32, 40.
- כפתור/שדה: גובה מינימום 40px; שדות עיקריים 44px.
- radius: 8px לשדות, 10px לכפתורים, 14–16px לכרטיסים, pill לתגיות.
- מסגרת 1px. צל עדין רק להרמת modal/popover; לא להשתמש בצל כתחליף לגבול.
- transitions קצרים של 120–180ms; לכבד `prefers-reduced-motion`.
- אזורי לחיצה מומלצים לפחות 40×40px, ורכיבים קריטיים למגע לפחות 44×44px.

## מבנה מוצר

1. **Sidebar:** סקירה, תוכן, טיוטות, פורסם, הגדרות. ביוזר יחיד אין מסכי Users/Roles.
2. **Topbar:** breadcrumb, פעולה ראשית ומצב חשבון.
3. **Overview:** מדדי תוכן, תוכן אחרון, פעילות ופעולות מהירות.
4. **Content list:** חיפוש, סינון, טבלה רספונסיבית, pagination, פעולות שורה ומצב ריק.
5. **Editor:** כותרת, slug, סוג, שפה, תקציר, status, קישור Doc, חותמות זמן, Save/Preview/Publish.
6. **Preview:** תצוגת תוכן נפרדת שמסומנת בבירור כטיוטה עד פרסום.
7. **System feedback:** loading, empty, success, warning, error, confirmation dialog ו־toast.

## ספריית רכיבים

| רכיב | וריאציות/מצבים | כללי שימוש |
|---|---|---|
| `Button` | primary, secondary, ghost, danger, icon, small, disabled, loading | פעולה ראשית אחת בולטת באזור; כפתור icon מחייב accessible label |
| `TextField` | default, focus, error, disabled, read-only | label גלוי, hint אופציונלי, error משויך ב־`aria-describedby` |
| `Textarea` | default, focus, error, disabled | מתאים לתקציר; גוף עשיר נשאר ב־Docs |
| `Select` | default, focus, disabled | להציג label; לא להשתמש ב־placeholder במקום label |
| `Checkbox` / `Switch` | checked, unchecked, disabled | טקסט מסביר; switch רק להגדרה בינארית מיידית |
| `StatusBadge` | draft, review, published, archived, error | צבע + טקסט; לא לשנות משמעות צבע בין מסכים |
| `Card` | default, interactive, muted | כותרת, גוף ופעולות לפי צורך; לא לקנן כרטיסים ללא סיבה |
| `DataTable` | default, hover, selected, empty, loading | כותרות סמנטיות, פעולות בשורה, overflow אופקי במובייל |
| `SearchFilter` | idle, active, empty result | אפשר לנקות בקלות; filter state מוצג למשתמש |
| `Pagination` | current, disabled, first/last | labels נגישים לעמוד קודם/הבא |
| `Alert` | success, info, warning, error | הודעה קצרה, פעולה מתקנת במידת הצורך |
| `Toast` | success, info, error | לא להציג שגיאה חשובה לזמן קצר בלבד; `aria-live` |
| `Dialog` | confirm, form, preview | כותרת, סגירה, Escape, ניהול והחזרת focus |
| `EmptyState` | no content, no results, setup required | הסבר קצר ופעולת המשך אחת |
| `LoadingState` | inline, page, table | להציג טקסט/`aria-busy`, לא spinner בלבד |
| `PreviewFrame` | draft, published | להציג status וסימון Preview; לא לחשוף טיוטה ל־API הציבורי |
| `ActivityItem` | publish, edit, create, error | זמן, פעולה ואובייקט; בלי תוכן רגיש בלוג |

## כללי כתיבה ומיקרוקופי

- להשתמש בפעלים קצרים: **שמירת טיוטה**, **תצוגה מקדימה**, **פרסום**, **ביטול פרסום**.
- להבחין בין שמירה, פרסום ויציאה. אין לקרוא לכל אלה “שמירה”.
- שגיאה מתארת מה נכשל ואיך לתקן: “ה־slug כבר בשימוש. בחר כתובת אחרת.”
- לשמור תאריכים לפי locale `he-IL`, ולסמן שדות טכניים ב־LTR.
- נתוני demo מסומנים ככאלה; אין להציג מספרים מדומים כאילו הם מגיעים מה־CMS.

## נגישות והתנהגות

- landmark סמנטיים: `header`, `nav`, `main`, `section`, `table`, `footer`.
- כל שדה מקבל `label`; כפתור אייקון מקבל `aria-label`; focus גלוי תמיד.
- modal סוגר עם Escape, שומר focus בתוכו, ומחזיר focus לפתיחתו.
- לשמור על סדר focus תואם לסדר הקריאה ב־RTL.
- תמיכה ברוחבים 320px ומעלה; sidebar הופך לתפריט נפתח; טבלה יכולה לגלול לרוחב.
- להעדיף `textContent` להצגת תוכן דינמי. HTML שמגיע מתוכן חיצוני מחייב sanitizer לפני הצגה.
- לא להשתמש ב־`title` בלבד כתחליף לטקסט נגיש.

## מיפוי בין עיצוב לנתונים

- טבלת תוכן מציגה `title`, `slug`, `status`, `type`, `language`, `updatedAt`.
- `status` ממופה ל־`StatusBadge`; רק `published` מוצג ב־Public API.
- הקישור ל־Google Docs מוצג כפעולה נפרדת; הממשק לא מציג `docId` מלא כברירת מחדל.
- מדדי overview מחושבים מהנתונים בפועל. עד שיש חיבור ל־GAS, להשתמש בתווית “נתוני הדגמה”.
- פעולות Publish/Unpublish מקבלות confirmation לפי הצורך, בודקות שדות ומציגות הודעת תוצאה.

## מצב מימוש

`front-end/design-system.html` הוא showcase חזותי ואינטראקטיבי של הרכיבים, עם נתוני demo. הוא אינו Admin app, אינו מחובר ל־Google Sheets/Docs ואינו מבצע פעולות CMS. אין לפרוס אותו כ־CMS פעיל עד להוספת הרשאות, חיבור backend ובדיקות.
