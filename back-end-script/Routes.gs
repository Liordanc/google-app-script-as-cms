function doGet(e) {
  var action = e && e.parameter ? String(e.parameter.action || '') : '';
  if (action === 'guide.admin') return guideAdminPage_();
  if (action.indexOf('guide.') === 0) return guideApiGet_(e);
  if (!isAuthorized(e)) return buildErrorResponse('Unauthorized');
  return buildSuccessGetResponse('Authorized');
}

function doPost(e) {
  var action = e && e.parameter ? String(e.parameter.action || '') : '';
  if (action.indexOf('guide.') === 0) return guideApiPost_(e);
  var response;
  if (typeof e !== 'undefined') {
    var formIsValid = processForm(e.parameter || {});
    if (formIsValid) sendEmail(e.parameter);
    if (formIsValid) postDataToSheet(e);
    response = buildResponse(formIsValid, getMessages());
  } else {
    response = buildResponse(false, 'Please fill in all fields');
  }
  return ContentService.createTextOutput(JSON.stringify(response));
}

