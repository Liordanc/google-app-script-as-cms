// Guide CMS storage setup, spreadsheet access, and operational logging.
// Required Script Properties: CMS_SPREADSHEET_ID, CMS_OWNER_EMAIL.
var GUIDE_META_HEADERS_ = ['id', 'title', 'slug', 'summary', 'language', 'status', 'categoryId', 'categoryName', 'createdAt', 'updatedAt', 'publishedAt', 'version'];
var GUIDE_BODY_HEADERS_ = ['guideId', 'contentJson', 'updatedAt'];
var GUIDE_AUDIT_HEADERS_ = ['timestamp', 'actor', 'action', 'guideId', 'result', 'details'];
var GUIDE_MAX_JSON_CHARS_ = 45000;

function getCmsProperty_(name) {
  return PropertiesService.getScriptProperties().getProperty(String(name));
}

function guideLog_(level, event, details) {
  var record = { time: new Date().toISOString(), level: level, event: String(event), details: String(details || '').slice(0, 1500) };
  try { console.log(JSON.stringify(record)); } catch (ignored) {}
  try { Logger.log(JSON.stringify(record)); } catch (ignored2) {}
}

function guideCmsSpreadsheet_() {
  var id = String(getCmsProperty_('CMS_SPREADSHEET_ID') || '').trim();
  if (!id) throw new Error('CMS_NOT_CONFIGURED');
  return SpreadsheetApp.openById(id);
}

function guideEnsureSheet_(spreadsheet, name, headers) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    return sheet;
  }
  var width = Math.max(sheet.getLastColumn(), headers.length);
  var current = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (value) { return String(value).trim(); });
  var actual = current.slice(0, headers.length);
  if (actual.join('|') !== headers.join('|')) throw new Error('CMS_SHEET_SCHEMA_MISMATCH:' + name);
  return sheet;
}

// Run once manually in the Apps Script editor after configuring CMS_SPREADSHEET_ID.
function initializeGuideCms() {
  try {
    var spreadsheet = guideCmsSpreadsheet_();
    guideEnsureSheet_(spreadsheet, 'Guides', GUIDE_META_HEADERS_);
    guideEnsureSheet_(spreadsheet, 'GuideContent', GUIDE_BODY_HEADERS_);
    guideEnsureSheet_(spreadsheet, 'AuditLog', GUIDE_AUDIT_HEADERS_);
    guideLog_('INFO', 'initializeGuideCms.success', 'spreadsheet=' + spreadsheet.getId());
    return 'נוצרו/נבדקו הלשוניות Guides, GuideContent ו־AuditLog.';
  } catch (error) {
    guideLog_('ERROR', 'initializeGuideCms.failed', error && error.stack ? error.stack : error);
    throw error;
  }
}

function guideReadRows_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (value) { return String(value).trim(); });
  return values.slice(1).filter(function (row) { return row.some(function (cell) { return cell !== '' && cell !== null; }); }).map(function (row) {
    var item = {};
    headers.forEach(function (header, index) { item[header] = row[index]; });
    return item;
  });
}

function guideFindRow_(sheet, keyHeader, keyValue) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return -1;
  var headers = values[0].map(function (value) { return String(value).trim(); });
  var keyIndex = headers.indexOf(keyHeader);
  if (keyIndex < 0) throw new Error('CMS_SHEET_SCHEMA_MISMATCH:' + sheet.getName());
  for (var index = 1; index < values.length; index++) if (String(values[index][keyIndex]) === String(keyValue)) return index + 1;
  return -1;
}

function guideWriteRecord_(sheet, headers, record, keyHeader) {
  var rowIndex = guideFindRow_(sheet, keyHeader, record[keyHeader]);
  var row = headers.map(function (header) { return record[header] === undefined || record[header] === null ? '' : record[header]; });
  if (rowIndex < 0) sheet.appendRow(row);
  else sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
}

function guideDateString_(value) {
  if (value instanceof Date) return value.toISOString();
  return String(value || '');
}

function guideGetStored_(id) {
  var spreadsheet = guideCmsSpreadsheet_();
  var metaSheet = spreadsheet.getSheetByName('Guides');
  var bodySheet = spreadsheet.getSheetByName('GuideContent');
  if (!metaSheet || !bodySheet) throw new Error('CMS_NOT_INITIALIZED');
  var metadata = guideReadRows_(metaSheet).filter(function (item) { return String(item.id) === String(id); })[0];
  if (!metadata) return null;
  var body = guideReadRows_(bodySheet).filter(function (item) { return String(item.guideId) === String(id); })[0];
  if (!body) throw new Error('CMS_CONTENT_MISSING');
  var guide;
  try { guide = JSON.parse(String(body.contentJson)); } catch (error) { throw new Error('CMS_CONTENT_CORRUPT'); }
  guide.id = String(metadata.id);
  guide.title = String(metadata.title || '');
  guide.slug = String(metadata.slug || '');
  guide.summary = String(metadata.summary || '');
  guide.language = String(metadata.language || 'he');
  guide.status = String(metadata.status || 'draft');
  guide.createdAt = guideDateString_(metadata.createdAt);
  guide.updatedAt = guideDateString_(metadata.updatedAt);
  guide.publishedAt = metadata.publishedAt ? guideDateString_(metadata.publishedAt) : null;
  guide.version = Number(metadata.version) || 1;
  if (metadata.categoryId) guide.category = { id: String(metadata.categoryId), name: String(metadata.categoryName || '') };
  else delete guide.category;
  return guide;
}

function guideSaveStored_(guide) {
  var spreadsheet = guideCmsSpreadsheet_();
  var metaSheet = spreadsheet.getSheetByName('Guides');
  var bodySheet = spreadsheet.getSheetByName('GuideContent');
  if (!metaSheet || !bodySheet) throw new Error('CMS_NOT_INITIALIZED');
  var category = guide.category || {};
  var metadata = {
    id: guide.id, title: guide.title, slug: guide.slug || '', summary: guide.summary || '',
    language: guide.language, status: guide.status, categoryId: category.id || '', categoryName: category.name || '',
    createdAt: guide.createdAt, updatedAt: guide.updatedAt, publishedAt: guide.publishedAt || '', version: guide.version
  };
  guideWriteRecord_(metaSheet, GUIDE_META_HEADERS_, metadata, 'id');
  guideWriteRecord_(bodySheet, GUIDE_BODY_HEADERS_, { guideId: guide.id, contentJson: JSON.stringify(guide), updatedAt: guide.updatedAt }, 'guideId');
}

function guideAudit_(action, guideId, result, details) {
  try {
    var sheet = guideCmsSpreadsheet_().getSheetByName('AuditLog');
    if (!sheet) throw new Error('CMS_NOT_INITIALIZED');
    var actor = '';
    try { actor = Session.getActiveUser().getEmail() || ''; } catch (ignored) {}
    sheet.appendRow([new Date(), actor || 'owner', action, guideId || '', result, String(details || '').slice(0, 500)]);
  } catch (error) {
    guideLog_('ERROR', 'guideAudit.failed', (error && error.stack ? error.stack : error) + ' action=' + action + ' guideId=' + guideId);
  }
}

