// Apps Script callable entry points for the HtmlService admin UI.
function guideRequireAdmin_() { if (!isCmsAdmin_()) throw new Error('UNAUTHORIZED'); }
function adminListGuides() { guideRequireAdmin_(); try { return guideListAdmin_(); } catch (error) { guideLog_('ERROR', 'adminListGuides.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminGetGuide(id) { guideRequireAdmin_(); try { var guide = guidePreview_(id); return guide; } catch (error) { guideLog_('ERROR', 'adminGetGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminCreateGuide(title, language) { guideRequireAdmin_(); try { return guideCreateDraft_({ title: title, language: language }); } catch (error) { guideLog_('ERROR', 'adminCreateGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminSaveGuide(guide, expectedVersion) { guideRequireAdmin_(); try { return guideSaveDraft_({ guide: guide, expectedVersion: expectedVersion }); } catch (error) { guideLog_('ERROR', 'adminSaveGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminPublishGuide(id) { guideRequireAdmin_(); try { return guidePublish_(id); } catch (error) { guideLog_('ERROR', 'adminPublishGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminUnpublishGuide(id) { guideRequireAdmin_(); try { return guideUnpublish_(id); } catch (error) { guideLog_('ERROR', 'adminUnpublishGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function adminArchiveGuide(id) { guideRequireAdmin_(); try { return guideArchive_(id); } catch (error) { guideLog_('ERROR', 'adminArchiveGuide.failed', error.stack || error); throw new Error(guideSafeError_(error)); } }
function guideSafeError_(error) {
  var message = String(error && error.message || error || 'REQUEST_FAILED');
  if (message.indexOf('GUIDE_VALIDATION:') === 0) return message.substring(17);
  var publicMessages = { GUIDE_NOT_FOUND: 'המדריך לא נמצא.', GUIDE_ID_REQUIRED: 'חסר מזהה מדריך.', GUIDE_ID_MISMATCH: 'מזהה המדריך בבקשה אינו תואם.', GUIDE_VERSION_CONFLICT: 'המדריך השתנה מאז הטעינה. טענו אותו מחדש לפני שמירה.', GUIDE_TOO_LARGE: 'המדריך גדול מדי לשמירה בגיליון.', CMS_NOT_CONFIGURED: 'חסרה הגדרת CMS_SPREADSHEET_ID במאפייני הסקריפט.', CMS_NOT_INITIALIZED: 'יש להריץ תחילה את initializeGuideCms().', CMS_CONTENT_MISSING: 'תוכן המדריך חסר בגיליון.', CMS_CONTENT_CORRUPT: 'תוכן המדריך בגיליון אינו JSON תקין.', UNAUTHORIZED: 'אין הרשאה לפעולה זו.' };
  if (message.indexOf('CMS_SHEET_SCHEMA_MISMATCH:') === 0) return 'כותרות הגיליון ' + message.split(':')[1] + ' אינן תואמות. בדקו את מבנה הגיליון.';
  return publicMessages[message] || 'הפעולה נכשלה. הפרטים נשמרו ביומן Apps Script.';
}

