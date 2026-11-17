// Guide lifecycle services: create, list, save, preview, publish, unpublish and archive.
function guideWithLock_(callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return callback(); } finally { lock.releaseLock(); }
}
function guideGenerateId_() { return Utilities.getUuid().replace(/-/g, ''); }
function guideNow_() { return new Date().toISOString(); }
function guideCreateDraft_(payload) {
  return guideWithLock_(function () {
    var now = guideNow_();
    var guide = { schemaVersion: 1, id: guideGenerateId_(), title: String(payload.title || 'מדריך חדש').trim(), slug: '', summary: '', language: String(payload.language || 'he'), status: 'draft', chapters: [{ id: guideGenerateId_(), title: 'פרק ראשון', sortOrder: 1, blocks: [] }], createdAt: now, updatedAt: now, publishedAt: null, version: 1 };
    validateGuide_(guide, false);
    guideSaveStored_(guide);
    guideAudit_('createDraft', guide.id, 'success', '');
    guideLog_('INFO', 'guide.createDraft.success', 'guideId=' + guide.id);
    return guide;
  });
}
function guideListAdmin_() {
  var sheet = guideCmsSpreadsheet_().getSheetByName('Guides');
  if (!sheet) throw new Error('CMS_NOT_INITIALIZED');
  return guideReadRows_(sheet).map(function (row) { return { id: String(row.id), title: String(row.title || ''), slug: String(row.slug || ''), language: String(row.language || ''), status: String(row.status || 'draft'), updatedAt: guideDateString_(row.updatedAt), version: Number(row.version) || 1 }; }).sort(function (a, b) { return b.updatedAt.localeCompare(a.updatedAt); });
}
function guideSaveDraft_(payload) {
  return guideWithLock_(function () {
    if (!payload || !payload.guide || !payload.guide.id) throw new Error('GUIDE_ID_REQUIRED');
    var existing = guideGetStored_(payload.guide.id);
    if (!existing) throw new Error('GUIDE_NOT_FOUND');
    if (Number(payload.expectedVersion) !== Number(existing.version)) throw new Error('GUIDE_VERSION_CONFLICT');
    var guide = payload.guide;
    if (String(guide.id) !== String(existing.id)) throw new Error('GUIDE_ID_MISMATCH');
    validateGuide_(guide, false);
    guide.status = existing.status;
    guide.publishedAt = existing.publishedAt;
    guide.createdAt = existing.createdAt;
    guide.updatedAt = guideNow_();
    guide.version = Number(existing.version) + 1;
    if (JSON.stringify(guide).length > GUIDE_MAX_JSON_CHARS_) throw new Error('GUIDE_TOO_LARGE');
    guideSaveStored_(guide);
    guideAudit_('saveGuide', guide.id, 'success', 'version=' + guide.version);
    guideLog_('INFO', 'guide.save.success', 'guideId=' + guide.id + ' version=' + guide.version);
    return guide;
  });
}
function guidePreview_(id) {
  var guide = guideGetStored_(id);
  if (!guide) throw new Error('GUIDE_NOT_FOUND');
  return guide;
}
function guidePublish_(id) {
  return guideWithLock_(function () {
    var guide = guideGetStored_(id);
    if (!guide) throw new Error('GUIDE_NOT_FOUND');
    validateGuide_(guide, true);
    validateGuideSlugUnique_(guide);
    guide.status = 'published'; guide.publishedAt = guide.publishedAt || guideNow_(); guide.updatedAt = guideNow_(); guide.version = Number(guide.version) + 1;
    guideSaveStored_(guide); guideAudit_('publishGuide', guide.id, 'success', 'version=' + guide.version);
    guideLog_('INFO', 'guide.publish.success', 'guideId=' + guide.id);
    return guide;
  });
}
function guideUnpublish_(id) {
  return guideWithLock_(function () {
    var guide = guideGetStored_(id); if (!guide) throw new Error('GUIDE_NOT_FOUND');
    guide.status = 'draft'; guide.publishedAt = null; guide.updatedAt = guideNow_(); guide.version = Number(guide.version) + 1;
    guideSaveStored_(guide); guideAudit_('unpublishGuide', guide.id, 'success', ''); guideLog_('INFO', 'guide.unpublish.success', 'guideId=' + guide.id); return guide;
  });
}
function guideArchive_(id) {
  return guideWithLock_(function () {
    var guide = guideGetStored_(id); if (!guide) throw new Error('GUIDE_NOT_FOUND');
    guide.status = 'archived'; guide.updatedAt = guideNow_(); guide.version = Number(guide.version) + 1;
    guideSaveStored_(guide); guideAudit_('archiveGuide', guide.id, 'success', ''); guideLog_('INFO', 'guide.archive.success', 'guideId=' + guide.id); return guide;
  });
}
function guideListPublished_(query) {
  var sheet = guideCmsSpreadsheet_().getSheetByName('Guides');
  if (!sheet) throw new Error('CMS_NOT_INITIALIZED');
  var page = Math.max(1, parseInt(query.page, 10) || 1), limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  var language = String(query.language || ''), category = String(query.category || '');
  var records = guideReadRows_(sheet).filter(function (item) { return String(item.status) === 'published' && (!language || String(item.language) === language) && (!category || String(item.categoryId) === category); }).sort(function (a, b) { return String(b.publishedAt).localeCompare(String(a.publishedAt)); });
  var total = records.length;
  return { items: records.slice((page - 1) * limit, page * limit).map(function (item) { return { id: String(item.id), title: String(item.title), slug: String(item.slug), summary: String(item.summary || ''), language: String(item.language || ''), status: 'published', category: item.categoryId ? { id: String(item.categoryId), name: String(item.categoryName || '') } : null, publishedAt: guideDateString_(item.publishedAt), version: Number(item.version) || 1 }; }), page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) };
}
function guideGetPublishedBySlug_(slug, language) {
  var sheet = guideCmsSpreadsheet_().getSheetByName('Guides'); if (!sheet) throw new Error('CMS_NOT_INITIALIZED');
  var item = guideReadRows_(sheet).filter(function (row) { return String(row.status) === 'published' && String(row.slug).toLowerCase() === String(slug || '').toLowerCase() && (!language || String(row.language) === String(language)); })[0];
  if (!item) throw new Error('GUIDE_NOT_FOUND');
  var guide = guideGetStored_(item.id); if (!guide || guide.status !== 'published') throw new Error('GUIDE_NOT_FOUND'); return guide;
}

