// Server-side guide validation. This is intentionally allow-list based; arbitrary HTML is not accepted.
var GUIDE_BLOCK_TYPES_ = ['paragraph', 'heading', 'steps', 'callout', 'image', 'code', 'table', 'quiz', 'video', 'quote', 'glossary', 'download', 'summary'];
function guideValidationError_(message) { throw new Error('GUIDE_VALIDATION:' + message); }
function guideIsObject_(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function guideText_(value, max, required, label) {
  if (typeof value !== 'string') guideValidationError_(label + ' חייב להיות טקסט.');
  if (required && !value.trim()) guideValidationError_(label + ' הוא שדה חובה.');
  if (value.length > max) guideValidationError_(label + ' ארוך מדי.');
}
function guideSafeUrl_(value, required, label) {
  if (value === undefined || value === '') { if (required) guideValidationError_(label + ' הוא שדה חובה.'); return; }
  if (typeof value !== 'string' || value.length > 2000 || !/^https:\/\//i.test(value) || /^(https?:\/\/)?(javascript|data|vbscript):/i.test(value)) guideValidationError_(label + ' חייב להיות קישור HTTPS תקין.');
}
function guideCheckBlock_(block, ids) {
  if (!guideIsObject_(block)) guideValidationError_('מבנה רכיב אינו תקין.');
  if (typeof block.id !== 'string' || !block.id.trim() || ids[block.id]) guideValidationError_('מזהה רכיב חסר או כפול.');
  ids[block.id] = true;
  if (GUIDE_BLOCK_TYPES_.indexOf(block.type) < 0) guideValidationError_('סוג רכיב לא נתמך: ' + String(block.type));
  if (!guideIsObject_(block.data)) guideValidationError_('נתוני רכיב אינם תקינים.');
  var data = block.data;
  switch (block.type) {
    case 'paragraph': guideText_(data.text, 20000, true, 'טקסט פסקה'); break;
    case 'heading': guideText_(data.text, 200, true, 'כותרת'); if ([2, 3, 4, '2', '3', '4'].indexOf(data.level) < 0) guideValidationError_('רמת כותרת אינה תקינה.'); break;
    case 'steps': if (!Array.isArray(data.items) || !data.items.length || data.items.length > 100) guideValidationError_('נדרשת רשימת צעדים.'); data.items.forEach(function (item) { guideText_(item, 2000, true, 'צעד'); }); break;
    case 'callout': if (['tip', 'note', 'warning', 'important', 'success'].indexOf(data.kind) < 0) guideValidationError_('סוג הודעה אינו תקין.'); guideText_(data.text, 10000, true, 'תוכן הודעה'); break;
    case 'image': guideSafeUrl_(data.url, true, 'תמונה'); if (data.decorative !== true) guideText_(data.alt, 500, true, 'תיאור חלופי'); else if (data.alt && data.alt.length) guideValidationError_('לתמונה דקורטיבית יש להשאיר alt ריק.'); break;
    case 'code': guideText_(data.text, 20000, true, 'קוד'); break;
    case 'table':
      if (!Array.isArray(data.headers) || !data.headers.length || data.headers.length > 20 || !Array.isArray(data.rows)) guideValidationError_('מבנה טבלה אינו תקין.');
      data.headers.forEach(function (header) { guideText_(header, 200, true, 'כותרת עמודה'); });
      data.rows.forEach(function (row) { if (!Array.isArray(row) || row.length !== data.headers.length) guideValidationError_('בכל שורת טבלה חייב להיות אותו מספר עמודות.'); row.forEach(function (cell) { guideText_(cell, 5000, false, 'תא טבלה'); }); }); break;
    case 'quiz':
      guideText_(data.question, 1000, true, 'שאלה');
      if (!Array.isArray(data.options) || data.options.length < 2 || data.options.length > 10 || !Array.isArray(data.answer) || !data.answer.length) guideValidationError_('שאלון חייב לכלול אפשרויות ותשובה.');
      var optionIds = {};
      data.options.forEach(function (option) { if (!guideIsObject_(option) || !option.id || optionIds[option.id]) guideValidationError_('מזהה אפשרות חסר או כפול.'); optionIds[option.id] = true; guideText_(option.text, 500, true, 'אפשרות'); });
      data.answer.forEach(function (answerId) { if (!optionIds[answerId]) guideValidationError_('תשובת השאלון אינה תואמת לאפשרות.'); }); break;
    case 'video': guideSafeUrl_(data.url, true, 'וידאו'); break;
    case 'quote': guideText_(data.text, 5000, true, 'ציטוט'); if (data.sourceUrl) guideSafeUrl_(data.sourceUrl, false, 'קישור מקור'); break;
    case 'glossary': guideText_(data.term, 160, true, 'מונח'); guideText_(data.definition, 3000, true, 'הגדרה'); break;
    case 'download': guideText_(data.title, 160, true, 'שם קובץ'); guideSafeUrl_(data.url, true, 'קובץ להורדה'); break;
    case 'summary': if (!Array.isArray(data.items) || !data.items.length) guideValidationError_('סיכום חייב לכלול נקודות.'); data.items.forEach(function (item) { guideText_(item, 1000, true, 'נקודת סיכום'); }); break;
  }
}
function validateGuide_(guide, forPublish) {
  if (!guideIsObject_(guide)) guideValidationError_('המדריך חייב להיות אובייקט JSON.');
  if (guide.schemaVersion !== 1) guideValidationError_('גרסת הסכמה אינה נתמכת.');
  guideText_(guide.id, 80, true, 'מזהה מדריך');
  guideText_(guide.title, 160, true, 'כותרת');
  guideText_(guide.summary || '', 1000, false, 'תקציר');
  if (guide.language && !/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(guide.language)) guideValidationError_('קוד שפה אינו תקין.');
  if (guide.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)) guideValidationError_('כתובת slug צריכה לכלול אותיות לטיניות קטנות, מספרים ומקפים בלבד.');
  if (!Array.isArray(guide.chapters)) guideValidationError_('רשימת פרקים אינה תקינה.');
  if (forPublish && (!guide.slug || !guide.chapters.length)) guideValidationError_('לפרסום נדרשים slug ולפחות פרק אחד.');
  if (guide.chapters.length > 200) guideValidationError_('מספר הפרקים חורג מהמותר.');
  var ids = {};
  ids[guide.id] = true;
  var totalBlocks = 0;
  guide.chapters.forEach(function (chapter) {
    if (!guideIsObject_(chapter)) guideValidationError_('מבנה פרק אינו תקין.');
    guideText_(chapter.id, 80, true, 'מזהה פרק');
    if (ids[chapter.id]) guideValidationError_('מזהה פרק כפול.');
    ids[chapter.id] = true;
    guideText_(chapter.title, 160, true, 'כותרת פרק');
    if (!Array.isArray(chapter.blocks)) guideValidationError_('רשימת רכיבים בפרק אינה תקינה.');
    if (forPublish && !chapter.blocks.length) guideValidationError_('לא ניתן לפרסם פרק ריק.');
    chapter.blocks.forEach(function (block) { guideCheckBlock_(block, ids); totalBlocks++; });
  });
  if (totalBlocks > 1000) guideValidationError_('מספר הרכיבים חורג מהמותר.');
  if (forPublish && !guide.chapters.some(function (chapter) { return chapter.blocks.length > 0; })) guideValidationError_('המדריך חייב לכלול תוכן.');
  return true;
}
function validateGuideSlugUnique_(guide) {
  var sheet = guideCmsSpreadsheet_().getSheetByName('Guides');
  if (!sheet) throw new Error('CMS_NOT_INITIALIZED');
  var duplicate = guideReadRows_(sheet).some(function (row) {
    return String(row.id) !== String(guide.id) && String(row.slug).toLowerCase() === String(guide.slug).toLowerCase() && String(row.language || '') === String(guide.language || 'he') && String(row.status) !== 'archived';
  });
  if (duplicate) guideValidationError_('כתובת זו כבר קיימת בשפה שנבחרה.');
}

