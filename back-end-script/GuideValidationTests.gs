// Basic guide validation tests; run manually in the Apps Script editor.
function runGuideValidationTests() {
  var valid = {
    schemaVersion: 1, id: 'guide-test-001', title: 'מדריך בדיקה', slug: 'guide-test', summary: 'דוגמת בדיקה', language: 'he', status: 'draft',
    chapters: [{ id: 'chapter-test-001', title: 'פרק בדיקה', blocks: [{ id: 'block-test-001', type: 'paragraph', data: { text: 'תוכן לדוגמה' } }] }]
  };
  var passed = 0;
  function assertThrows(name, callback) {
    var threw = false;
    try { callback(); } catch (error) { threw = true; }
    if (!threw) throw new Error('TEST_FAILED: ' + name);
    passed++;
  }
  validateGuide_(valid, true); passed++;
  var duplicate = JSON.parse(JSON.stringify(valid)); duplicate.chapters[0].blocks[0].id = duplicate.chapters[0].id;
  assertThrows('duplicate IDs rejected', function () { validateGuide_(duplicate, true); });
  var badUrl = JSON.parse(JSON.stringify(valid)); badUrl.chapters[0].blocks[0] = { id: 'block-image', type: 'image', data: { url: 'javascript:alert(1)', alt: 'x' } };
  assertThrows('unsafe image URL rejected', function () { validateGuide_(badUrl, true); });
  var badQuiz = JSON.parse(JSON.stringify(valid)); badQuiz.chapters[0].blocks[0] = { id: 'block-quiz', type: 'quiz', data: { question: 'שאלה?', options: [{ id: 'a', text: 'א' }, { id: 'b', text: 'ב' }], answer: ['missing'] } };
  assertThrows('quiz answer must match option', function () { validateGuide_(badQuiz, true); });
  var unknown = JSON.parse(JSON.stringify(valid)); unknown.chapters[0].blocks[0].type = 'rawHtml';
  assertThrows('unknown block rejected', function () { validateGuide_(unknown, true); });
  guideLog_('INFO', 'runGuideValidationTests.passed', 'assertions=' + passed);
  return 'עברו ' + passed + ' בדיקות ולידציה.';
}
