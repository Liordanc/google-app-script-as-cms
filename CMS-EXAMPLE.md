# דוגמה מקצה לקצה — CMS אישי ב־GAS

מסמך דוגמה שמחבר את רכיבי ה־CMS: Google Sheets, Google Docs, Google Apps Script, API ציבורי, פעולות ניהול, Preview, פרסום ו־frontend.

> **חשוב:** זהו מפרט ודוגמת אינטגרציה, לא הצהרה שכל הרכיבים כבר ממומשים או נפרסו. יש להתאים שמות גיליונות, הגדרות פריסה ו־frontend לריפו ולחשבון Google שלך. בדוק בסביבת פיתוח לפני שימוש בנתוני אמת.

## 1. תרשים מערכת

```text
עורך (בעלים יחיד)
  │
  ├── Google Docs: עריכת גוף התוכן
  └── ממשק Admin (עתידי/מינימלי)
          │ בקשת ניהול מוגנת
          ▼
   GAS Admin Web App ─────► Google Sheets: Content
          │                 Google Docs: גוף תוכן
          └───────────────► AuditLog (אופציונלי)

גולש ──► אתר frontend ──► GAS Public Web App ──► published בלבד
```

למוצר אישי, מומלץ להפריד בין הפריסה הציבורית לקריאה לבין פריסת הניהול המוגבלת לבעלים. אין לחשוף פעולות עריכה דרך Web App אנונימי או להסתמך על API key שנשלח מהדפדפן.

## 2. Google Sheets

צור Spreadsheet ייעודי עם גיליון `Content`. שורת הכותרות חייבת להיות בדיוק כך:

```text
id | type | title | slug | summary | docId | status | language | category | createdAt | updatedAt | publishedAt | version
```

דוגמת רשומה:

| id | type | title | slug | summary | docId | status | language | category | createdAt | updatedAt | publishedAt | version |
|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `f981d1e4-9f4b-4dd9-9ad5-0bd133ed1c16` | article | ברוכים הבאים | welcome | תוכן לדוגמה | `GOOGLE_DOC_ID` | draft | he | כללי | זמן ISO | זמן ISO | ריק | 1 |

הגדרות:
- `id` הוא מפתח יציב; לא להשתמש במספר שורה כמזהה.
- `slug` חייב להיות ייחודי לכל שפה/אתר לפי כללי הפרויקט.
- `status` מקבל `draft`, `published` או `archived`.
- `docId` הוא מזהה מסמך Google Docs, לא URL מלא.
- `createdAt`, `updatedAt`, `publishedAt` נשמרים כ־ISO-8601/UTC.

גיליונות אופציונליים:
- `AuditLog`: `timestamp | actorEmail | action | contentId | result | details`.
- `Categories`: להוסיף רק אם נדרש ניהול קטגוריות נפרד.
- `Users`: לא נדרש לפרויקט אישי עם בעלים יחיד.

## 3. Google Docs

צור מסמך לכל כתבה/עמוד, כתוב בו את גוף התוכן, ושמור את מזהה המסמך בעמודת `docId`. המסמך נשאר פרטי לעורך; ה־API הציבורי מחזיר את גוף התוכן רק כאשר הרשומה ב־Sheets מסומנת `published`.

בשלב הראשון מומלץ להשתמש בטקסט פשוט. אם מציגים HTML שנוצר מתוכן Docs, יש לטהר אותו לפני הזרקה ל־DOM.

## 4. הגדרות Apps Script

ב־Apps Script Project Settings → Script Properties הוסף:

```text
CONTENT_SPREADSHEET_ID = מזהה ה־Spreadsheet של התוכן
CONTENT_SHEET_NAME = Content
AUDIT_SPREADSHEET_ID = מזהה Spreadsheet לוגים (אופציונלי)
AUDIT_SHEET_NAME = AuditLog
CMS_OWNER_EMAIL = כתובת חשבון הבעלים
```

אל תכניס ערכים אמיתיים, מזהים פרטיים או סודות לקובצי Git. `PropertiesService` אינו תחליף להגבלת גישה לפרויקט ול־Spreadsheet.

## 5. מבנה קוד GAS מוצע

```text
back-end-script/
  Config.gs                 # קריאת Script Properties וגישה לגיליונות
  Routes.gs                 # doGet/doPost וניתוב פעולות
  CheckAuthorization.gs     # הרשאת בעלים לפעולות ניהול
  ContentRepository.gs      # קריאה/כתיבה ל־Content לפי כותרות
  DocumentService.gs        # קריאת Google Docs לפי docId
  ContentService.gs         # create, preview, publish, unpublish
  FormValidations.gs        # בדיקות תוכן ו־slug
  Response.gs               # JSON אחיד
  AuditLog.gs               # לוג פעולות (אופציונלי)
```

אפשר למפות את האחריות הזו לקבצים הקיימים במקום ליצור את כולם בבת אחת. יש להימנע מגישה ל־Spreadsheet בזמן טעינת הסקריפט; לפתוח אותו בתוך פונקציות כדי למנוע שגיאת אתחול כשחסר ID.

## 6. חוזה API לדוגמה

### קריאות ציבוריות — GET

```text
?action=listPublished&page=1&limit=10&language=he
?action=getPublishedBySlug&slug=welcome&language=he
```

תגובה לדוגמה:

```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "f981d1e4-9f4b-4dd9-9ad5-0bd133ed1c16",
        "type": "article",
        "title": "ברוכים הבאים",
        "slug": "welcome",
        "summary": "תוכן לדוגמה",
        "body": "גוף התוכן שנקרא מ-Google Docs",
        "language": "he",
        "publishedAt": "2026-11-12T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  },
  "error": null
}
```

ה־Public API חייב לסנן `status === published` בשרת, לא בדפדפן.

### פעולות ניהול — POST

פעולות ניהול לדוגמה:

```text
createDraft
saveMetadata
previewContent
publishContent
unpublishContent
archiveContent
```

בקשה לוגית לדוגמה:

```json
{
  "action": "publishContent",
  "id": "f981d1e4-9f4b-4dd9-9ad5-0bd133ed1c16"
}
```

כל פעולת ניהול חייבת לאמת הרשאה בצד השרת. למערכת אישית מומלץ לפרוס Web App נפרד שמוגבל לחשבון הבעלים, ולבדוק את התנהגות זהות המשתמש בפועל. אין להגן על Publish בעזרת מפתח קבוע שמוטמע ב־frontend.

## 7. דוגמת לוגיקת שירות

הדוגמה להמחשה: יש להתאים את חתימות הפונקציות ל־router הקיים, להוסיף בדיקת הרשאה ותנאי שגיאה, ולבדוק בפרויקט GAS לפני פריסה.

```javascript
function listPublishedContent_(options) {
  var all = readContentObjects_();
  var language = String(options.language || '');
  var items = all.filter(function (item) {
    return String(item.status).toLowerCase() === 'published' &&
      (!language || String(item.language).toLowerCase() === language);
  });

  var page = Math.max(1, Number(options.page) || 1);
  var limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
  var start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit).map(toPublicContent_),
    page: page,
    limit: limit,
    total: items.length
  };
}

function toPublicContent_(item) {
  // Allowlist only: never serialize an entire Sheet row to the public API.
  return {
    id: String(item.id),
    type: String(item.type),
    title: String(item.title),
    slug: String(item.slug),
    summary: String(item.summary || ''),
    language: String(item.language || ''),
    publishedAt: item.publishedAt || null,
    body: readDocumentText_(String(item.docId))
  };
}

function readDocumentText_(docId) {
  if (!docId) throw new Error('Missing document ID');
  return DocumentApp.openById(docId).getBody().getText();
}
```

`readContentObjects_()` צריך לקרוא את שורת הכותרות, לוודא שקיימות העמודות הנדרשות, ולהמיר כל שורה לאובייקט. פעולות כתיבה צריכות להשתמש ב־`LockService`, לאתר רשומות לפי `id`, ולעדכן את כל השורה בכתיבה מקובצת.

## 8. תהליך פרסום לדוגמה

1. יוצרים טיוטה ב־Sheets עם `id` יציב.
2. יוצרים או בוחרים Google Doc ושומרים את `docId`.
3. עורכים את הטקסט ב־Docs וממלאים כותרת, slug ושפה.
4. מפעילים `previewContent`; הפעולה בודקת גישה למסמך אך לא משנה סטטוס.
5. מפעילים `publishContent` מתוך ממשק ניהול מוגן.
6. השרת בודק שדות חובה, slug ייחודי ומסמך נגיש; לאחר מכן מעדכן `status`, `publishedAt`, `updatedAt`, `version` ורושם AuditLog.
7. האתר הציבורי מבקש את התוכן מה־Public API.
8. ביטול פרסום מחזיר את הסטטוס ל־`draft` או `archived`, כך שהפריט נעלם מה־API הציבורי אך נשאר ב־Drive וב־Sheets.

## 9. דוגמת קריאה מה־frontend הציבורי

```javascript
const API_URL = 'YOUR_PUBLIC_GAS_WEB_APP_URL';

async function loadPublishedContent() {
  const url = new URL(API_URL);
  url.searchParams.set('action', 'listPublished');
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '10');
  url.searchParams.set('language', 'he');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Content request failed');

  const result = await response.json();
  if (!result.ok) throw new Error(result.error && result.error.message || 'CMS error');
  return result.data.items;
}
```

לא להוסיף לקטע הזה API key או הרשאות ניהול. עבור GAS יש לבדוק CORS, פרמטרים ופורמט התגובה בפריסה בפועל; לעיתים ניתן להגיש את האתר עצמו דרך `HtmlService` במקום לקרוא ל־Web App חיצוני.

## 10. בדיקות ידניות לפני פרסום

- [ ] `listPublished` מחזיר רק רשומות `published`.
- [ ] `getPublishedBySlug` לא חושף טיוטה גם אם ה־slug נכון.
- [ ] Preview קורא את Doc ואינו משנה את הסטטוס.
- [ ] Publish נדחה כשהכותרת, slug או docId חסרים.
- [ ] Publish נדחה כשה־slug כבר בשימוש.
- [ ] משתמש לא מורשה לא יכול לבצע פעולת POST ניהולית.
- [ ] Unpublish מסיר את התוכן מה־API הציבורי אך לא מוחק אותו.
- [ ] מפתחות ומזהי קבצים לא מופיעים ב־frontend או בתגובות ציבוריות.
- [ ] תוכן HTML לא מהימן אינו מוכנס לדף ללא טיהור.

## 11. סדר מימוש מומלץ

1. ליצור Sheets בדיקה עם סכימת `Content`.
2. להעביר את ההגדרות ל־Script Properties ולוודא שאין סודות ב־Git.
3. לממש repository לקריאה לפי כותרות ו־`id`.
4. לממש Public API שמחזיר תוכן שפורסם בלבד.
5. לחבר Google Docs ולבנות Preview.
6. להוסיף הרשאת בעלים, Publish/Unpublish, `LockService` ו־AuditLog.
7. להוסיף Admin UI ולכתוב הוראות פריסה.

## 12. מצב רכיבים

| רכיב | מצב בדוגמה |
|---|---|
| Frontend ציבורי | קיים בסיס, יש להתאים ל־API החדש |
| GAS Router | קיים בסיס, נדרש ניתוב CMS מלא |
| Google Sheets Content | נדרש להגדיר גיליון וסכימה |
| Google Docs integration | מתוכנן |
| Public API published-only | נדרש לממש ולבדוק |
| Admin API ואימות בעלים | נדרש לממש ולבדוק בפריסת GAS |
| Preview ופרסום | מתוכנן |
| AuditLog | אופציונלי ל־MVP, מומלץ |
| Admin UI | מתוכנן |
