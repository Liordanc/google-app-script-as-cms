// Authorization helpers. Browser-visible API keys are never accepted as admin credentials.
function getCmsProperty_(name) {
  return PropertiesService.getScriptProperties().getProperty(String(name));
}

// Compatibility gate for the legacy demo read endpoint. This is intentionally public
// content only and must be explicitly enabled; a query-string key is not authentication.
function isAuthorized() {
  return String(getCmsProperty_('ENABLE_LEGACY_PUBLIC_API') || '').toLowerCase() === 'true';
}

/**
 * Owner allowlist check for private admin operations.
 * Deploy admin as "execute as user accessing" and restrict access to the owner/domain.
 * If Apps Script cannot determine the active account, deny access.
 */
function isCmsAdmin_() {
  var allowedEmail = String(getCmsProperty_('CMS_OWNER_EMAIL') || '').trim().toLowerCase();
  if (!allowedEmail) return false;
  try {
    var activeEmail = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
    return Boolean(activeEmail && activeEmail === allowedEmail);
  } catch (error) {
    try { guideLog_('WARN', 'authorization.identityUnavailable', error.message); } catch (ignored) {}
    return false;
  }
}
