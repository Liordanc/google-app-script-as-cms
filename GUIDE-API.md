# התקנת CMS מדריכים ב־Google Apps Script

נוסף מימוש ראשוני של יצירת לשוניות, אחסון מדריכים, אימות בצד השרת, ממשק ניהול HtmlService, API ציבורי ו־Audit Log. הוא אינו משנה את האתר הציבורי הישן, אך מוסיף נתיבי `guide.*` ל־`Routes.gs`.

## התקנה בטוחה

1. צור עותק בדיקה של Apps Script וה־Spreadsheet; אל תחבר תחילה לנתוני ייצור.
2. העתק לפרויקט GAS את קובצי `.gs` שבתיקיית `back-end-script` וכן את `GuideAdmin.html`. שמות קובצי GAS צריכים להיות `GuideData`, `GuideValidation`, `GuideService`, `GuideAdminFunctions`, `GuideRoutes`, `Routes` ושם קובץ HTML `GuideAdmin`.
3. ב־**Project Settings → Script Properties** הגדר `CMS_SPREADSHEET_ID` למזהה Spreadsheet ייעודי ו־`CMS_OWNER_EMAIL` לכתובת חשבון הבעלים. אין לשים מפתח סודי בקוד לקוח.
4. הרץ ידנית את `initializeGuideCms()` מתוך עורך Apps Script ואשר הרשאות. הפעולה יוצרת `Guides`, `GuideContent`, `AuditLog`; אם קיימות כותרות שונות היא נכשלת במקום לדרוס נתונים.
5. פרוס Web App בסביבת בדיקה עם גישה מוגבלת לבעלים, וודא ש־`Session.getActiveUser().getEmail()` אכן מחזיר את כתובת הבעלים. אם זהות אינה זמינה, ניהול נדחה. אין לפרוס API ניהול פתוח לציבור.
6. פתח `.../exec?action=guide.admin` בחשבון המורשה. ממשק הניהול עובד באמצעות `google.script.run` וכולל רשימה, יצירת טיוטה, עריכת JSON, שמירה, תצוגת JSON, פרסום, ביטול פרסום וארכיון.
7. בדוק בסביבת בדיקה טיוטה, שמירה, slug כפול, פרסום, ביטול פרסום וחשבון שאינו מורשה. פרוס גרסה חדשה רק אחרי מעבר על Execution log ועל `AuditLog`.

## לשוניות

- `Guides`: שורה לכל מדריך, עם שדות מזהה, title, slug, שפה, סטטוס, זמנים וגרסה.
- `GuideContent`: שורה לכל מדריך עם JSON מלא של פרקים ובלוקים; המימוש חוסם גוף מעל 45,000 תווים.
- `AuditLog`: תיעוד זמן, שחקן, פעולה, מזהה ותוצאה. פרטי שגיאה טכניים נשלחים ל־Apps Script Execution log; הודעות למשתמש אינן חושפות stack traces.

## נקודות קצה ציבוריות

- `GET ?action=guide.listPublished&page=1&limit=20&language=he`
- `GET ?action=guide.getPublishedBySlug&slug=google-sheets-basics&language=he`

הן מחזירות תוכן שפורסם בלבד. פעולות ניהול דרך `google.script.run` דורשות בדיקת בעלים בכל קריאה. גם נתיב POST של API בודק הרשאה בצד השרת.

## טיפול בשגיאות ולוגים

- `guideLog_()` כותב JSON מובנה ל־`console.log`/`console.error` ול־Apps Script `Logger`.
- פעולות משמעותיות נרשמות גם ב־`AuditLog`; כשל Audit נרשם ב־Execution log ואינו מסתיר את תוצאת השמירה שכבר הושלמה.
- שגיאות צפויות מוחזרות כטקסט בטוח. stack trace ופרטים פנימיים נרשמים ביומן ולא מוצגים בממשק.
- `LockService` מגן על פעולות כתיבה ו־`expectedVersion` מונע דריסת עריכה מיושנת.
- Sheets ו־GAS אינם מסד נתונים למערכת בקנה מידה גדול. יש להגדיר גיבוי, לבדוק מכסות ולאחסן תוכן גדול במקום מתאים.

## מגבלות ידועות

הממשק הוא עורך JSON ראשוני, לא עורך ויזואלי בסגנון Microsoft/Google. תצוגת המקדימה הנוכחית מציגה JSON בטוח, לא renderer מלא של מדריך. לפני שימוש ציבורי נדרשים בדיקות GAS אמיתיות, renderer ציבורי לכל block type, מדיניות אחסון ומדיה, גיבוי/שחזור, בדיקות נגישות ואימות deployment identity. בדוק את מדיניות GAS וה־Google Workspace בפועל; אין להסתמך על הגדרות בריפו כהוכחה שהפריסה מאובטחת.
