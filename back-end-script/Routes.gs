function doGet(e) {
  try {
    var action = e && e.parameter ? String(e.parameter.action || '') : '';
    if (action === 'guide.admin') return guideAdminPage_();
    if (action.indexOf('guide.') === 0) return guideApiGet_(e);
    if (isAuthorized()) return buildSuccessGetResponse('Legacy public read enabled.');
    return buildErrorResponse('Legacy public API is disabled.');
  } catch (error) {
    try { guideLog_('ERROR', 'doGet.failed', error.stack || error); } catch (ignored) {}
    return buildErrorResponse('Request failed. Check Apps Script execution logs.');
  }
}

function doPost(e) {
  try {
    var action = e && e.parameter ? String(e.parameter.action || '') : '';
    if (action.indexOf('guide.') === 0) return guideApiPost_(e);
    if (String(getCmsProperty_('ENABLE_PUBLIC_CONTACT_FORM') || '').toLowerCase() !== 'true') return buildErrorResponse('Contact form is disabled.');
    var params = e && e.parameter || {};
    var formErrors = returnErrors(params);
    if (formErrors.length) return ContentService.createTextOutput(JSON.stringify(buildResponse(false, formErrors))).setMimeType(ContentService.MimeType.JSON);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sendEmail(params);
      postDataToSheet(e);
    } finally { lock.releaseLock(); }
    return ContentService.createTextOutput(JSON.stringify(buildResponse(true, ['Successfully submitted!']))).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    try { guideLog_('ERROR', 'doPost.failed', error.stack || error); } catch (ignored) {}
    return ContentService.createTextOutput(JSON.stringify({ formIsValid: false, message: ['Submission failed. Please try again later.'] })).setMimeType(ContentService.MimeType.JSON);
  }
}
