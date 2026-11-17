// Public guide API and HtmlService admin entry point.
function guideApiResponse_(ok, data, error) {
  var output = ContentService.createTextOutput(JSON.stringify({ ok: ok, data: data || null, error: error || null }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
function guideApiGet_(e) {
  try {
    var params = e && e.parameter || {};
    if (params.action === 'guide.listPublished') return guideApiResponse_(true, guideListPublished_(params), null);
    if (params.action === 'guide.getPublishedBySlug') return guideApiResponse_(true, guideGetPublishedBySlug_(params.slug, params.language), null);
    return guideApiResponse_(false, null, { code: 'UNKNOWN_ACTION', message: 'פעולת קריאה לא מוכרת.' });
  } catch (error) {
    guideLog_('ERROR', 'guideApiGet.failed', error.stack || error);
    var message = String(error && error.message || error);
    return guideApiResponse_(false, null, message === 'GUIDE_NOT_FOUND' ? { code: 'GUIDE_NOT_FOUND', message: 'המדריך לא נמצא.' } : { code: 'REQUEST_FAILED', message: 'לא ניתן לטעון את התוכן כעת.' });
  }
}
function guideApiPost_(e) {
  var payload = {};
  try {
    if (e && e.postData && e.postData.contents) payload = JSON.parse(e.postData.contents);
    else if (e && e.parameter && e.parameter.payload) payload = JSON.parse(e.parameter.payload);
  } catch (parseError) { guideLog_('WARN', 'guideApiPost.invalidJson', parseError.message); return guideApiResponse_(false, null, { code: 'INVALID_JSON', message: 'גוף הבקשה אינו JSON תקין.' }); }
  var params = e && e.parameter || {}, action = String(params.action || payload.action || '');
  if (!isCmsAdmin_()) { guideLog_('WARN', 'guideApiPost.unauthorized', 'action=' + action); return guideApiResponse_(false, null, { code: 'UNAUTHORIZED', message: 'נדרשת התחברות מורשית לחשבון הבעלים.' }); }
  try {
    var data;
    if (action === 'guide.createDraft') data = guideCreateDraft_(payload);
    else if (action === 'guide.saveGuide') data = guideSaveDraft_(payload);
    else if (action === 'guide.previewGuide') data = guidePreview_(payload.id || params.id);
    else if (action === 'guide.publishGuide') data = guidePublish_(payload.id || params.id);
    else if (action === 'guide.unpublishGuide') data = guideUnpublish_(payload.id || params.id);
    else if (action === 'guide.archiveGuide') data = guideArchive_(payload.id || params.id);
    else return guideApiResponse_(false, null, { code: 'UNKNOWN_ACTION', message: 'פעולת ניהול לא מוכרת.' });
    return guideApiResponse_(true, data, null);
  } catch (error) {
    guideLog_('ERROR', 'guideApiPost.failed', (error.stack || error) + ' action=' + action);
    var text = guideSafeError_(error);
    var code = String(error && error.message || '').indexOf('GUIDE_VALIDATION:') === 0 ? 'VALIDATION_ERROR' : String(error && error.message || 'REQUEST_FAILED');
    return guideApiResponse_(false, null, { code: code, message: text });
  }
}
function guideAdminPage_() {
  if (!isCmsAdmin_()) {
    guideLog_('WARN', 'guideAdminPage.unauthorized', '');
    return HtmlService.createHtmlOutput('<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><h1>אין הרשאה</h1><p>היכנסו עם חשבון הבעלים המורשה.</p></html>').setTitle('אין הרשאה');
  }
  return HtmlService.createHtmlOutputFromFile('GuideAdmin').setTitle('ניהול מדריכים').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

