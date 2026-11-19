// Legacy demo content reader. Spreadsheet access happens only when called.
function readLegacyPublicContent_() {
  var spreadsheet = Config().getSpreadsheet;
  if (!spreadsheet) throw new Error('CONTENT_SPREADSHEET_ID is not configured.');
  var worksheet = spreadsheet.getSheets()[0];
  var rows = worksheet.getDataRange().getValues();
  if (!rows.length) return [];
  var headings = rows[0].map(function (value) { return String(value).trim().toLowerCase(); });
  return rows.slice(1).filter(function (row) { return row.some(function (cell) { return cell !== '' && cell !== null; }); }).map(function (row) {
    var content = {};
    headings.forEach(function (heading, index) { content[heading] = row[index]; });
    if (typeof content.list === 'string') content.list = content.list.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
    return content;
  });
}

function buildSuccessGetResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: readLegacyPublicContent_(), message: message || 'OK' })).setMimeType(ContentService.MimeType.JSON);
}
function buildErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: { code: 'REQUEST_FAILED', message: String(message || 'Request failed') } })).setMimeType(ContentService.MimeType.JSON);
}
