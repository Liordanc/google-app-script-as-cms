// Legacy contact-form helpers. Configuration and side effects are lazy, not at script load.
function processForm(params) {
  params = params || {};
  var valid = validateForm(params);
  return valid ? ['Successfully submitted!'] : returnErrors(params);
}

function sendEmail(params) {
  params = params || {};
  var config = Config();
  if (!config.sendToEmail) throw new Error('CONTACT_EMAIL is not configured.');
  var name = String(params.name || '').trim();
  var email = String(params.email || '').trim();
  var message = String(params.message || '').trim();
  function escapeHtml(value) { return value.replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; }); }
  MailApp.sendEmail({
    to: config.sendToEmail,
    subject: 'New form entry: ' + name.slice(0, 100),
    htmlBody: 'Name: ' + escapeHtml(name) + '<br>Email: ' + escapeHtml(email) + '<br>Message: ' + escapeHtml(message).replace(/\n/g, '<br>')
  });
}

function buildResponse(formValid, message) {
  return { formIsValid: Boolean(formValid), message: Array.isArray(message) ? message : [String(message || '')] };
}
