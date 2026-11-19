// Configuration is loaded lazily from Apps Script Script Properties.
// Never commit spreadsheet IDs, email addresses, or API keys here.
function Config() {
  var properties = PropertiesService.getScriptProperties();
  var contentId = String(properties.getProperty('CONTENT_SPREADSHEET_ID') || '').trim();
  var submissionsId = String(properties.getProperty('SUBMISSIONS_SPREADSHEET_ID') || '').trim();
  var contentSpreadsheet = contentId ? SpreadsheetApp.openById(contentId) : null;
  var submissionsSpreadsheet = submissionsId ? SpreadsheetApp.openById(submissionsId) : null;
  return {
    getSpreadsheetId: contentId,
    postSpreadsheetId: submissionsId,
    getSpreadsheet: contentSpreadsheet,
    postSpreadsheet: submissionsSpreadsheet,
    sendToEmail: String(properties.getProperty('CONTACT_EMAIL') || '').trim()
  };
}
