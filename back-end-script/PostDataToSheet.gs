// Persist contact-form submissions lazily; no spreadsheet access at script load.
function postDataToSheet(e) {
  var config = Config();
  if (!config.postSpreadsheet) throw new Error('SUBMISSIONS_SPREADSHEET_ID is not configured.');
  var sheet = config.postSpreadsheet.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  if (!rows.length) throw new Error('Submission sheet must have a header row.');
  var headings = rows[0].map(function (value) { return String(value).trim().toLowerCase(); });
  var params = e && e.parameter ? e.parameter : {};
  var row = headings.map(function (heading) {
    return heading === 'timestamp' ? new Date() : (params[heading] || '');
  });
  sheet.appendRow(row);
}
