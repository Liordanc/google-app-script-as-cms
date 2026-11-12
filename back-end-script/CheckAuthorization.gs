// Legacy API-key check. Public browser code must never rely on this as security.
function isAuthorized(e) {
  var expected = getCmsProperty_('LEGACY_API_KEY');
  var params = e && e.parameter ? e.parameter : {};
  return Boolean(expected && params.key && String(params.key) === expected);
}

/** CMS admin authorization; requires a restricted deployment and owner allowlist. */
function isCmsAdmin_() {
  var allowedEmail = String(getCmsProperty_('CMS_OWNER_EMAIL')).trim().toLowerCase();
  var activeEmail = '';
  try {
    activeEmail = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  } catch (error) {
    return false;
  }
  return Boolean(allowedEmail && activeEmail && activeEmail === allowedEmail);
}
