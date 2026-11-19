// Stateless validation for the legacy public contact form.
function validateForm(params) {
  params = params || {};
  var errors = [];
  var name = String(params.name || '').trim();
  var email = String(params.email || '').trim();
  var message = String(params.message || '').trim();
  if (name.length < 2 || name.length > 100) errors.push('Name must contain 2–100 characters.');
  var validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!validEmailPattern.test(email) || email.length > 254) errors.push('Email is not valid.');
  if (message.length < 5 || message.length > 5000) errors.push('Message must contain 5–5000 characters.');
  return errors.length === 0;
}

function returnErrors(params) {
  params = params || {};
  var errors = [];
  if (String(params.name || '').trim().length < 2) errors.push('Name must contain at least 2 characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(params.email || '').trim())) errors.push('Email is not valid.');
  if (String(params.message || '').trim().length < 5) errors.push('Message must contain at least 5 characters.');
  return errors;
}
