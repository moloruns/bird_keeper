// Real page and event handlers, with only the RAF clock replaced for repeatability.
const iframe = document.querySelector('iframe');
const markup = await (await fetch('../index.html')).text();
const loaded = new Promise((resolve) => iframe.addEventListener('load', resolve, { once: true }));
iframe.srcdoc = markup.replace('<head>', '<head><base href="../">').replace('<script type="module"', '<script>window.requestAnimationFrame = (callback) => { window.testFrame = callback; };</script><script type="module"');
await loaded;
const win = iframe.contentWindow;
const doc = iframe.contentDocument;
const stage = doc.querySelector('#game');
let time = 0;
let failures = 0;
const results = [];
function frame(count = 1) { for (let i = 0; i < count; i++) { time += 1000 / 60; win.testFrame(time); } }
function key(code, repeat = false) { stage.dispatchEvent(new win.KeyboardEvent('keydown', { code, repeat, bubbles: true })); }
function release(code) { win.dispatchEvent(new win.KeyboardEvent('keyup', { code, bubbles: true })); }
function click(selector) { doc.querySelector(selector).click(); frame(); }
function assert(value, message) { if (!value) throw new Error(message); }
function test(name, callback) {
  try { callback(); results.push(`PASS  ${name}`); }
  catch (error) { failures++; results.push(`FAIL  ${name}: ${error.message}`); }
}
frame();
test('Title, empty field guide, and Back', () => {
  assert(doc.querySelector('#start'), 'missing title');
  click('#guide');
  assert(doc.querySelectorAll('.guide-entry').length === 4, 'guide roster');
  assert(doc.querySelector('.panel').textContent.includes('0 of 4'), 'premature discovery');
  click('#back');
  assert(doc.querySelector('#start'), 'back to title');
});
test('Space starts without jumping; held Space stays mounted; fresh Space transfers', () => {
  stage.focus(); key('Space'); frame();
  key('Space', true); frame(5);
  assert(doc.querySelector('#mount').textContent === 'Gull', 'start/hold launched jump');
  release('Space'); key('Space'); frame();
  assert(doc.querySelector('#mount').textContent === 'Airborne', 'fresh jump');
  frame(38);
  assert(doc.querySelector('#mount').textContent === 'Gull', 'catch failed');
  key('Space', true); frame(3);
  assert(doc.querySelector('#mount').textContent === 'Gull', 'held key relaunched');
  release('Space');
});
test('Pause freezes HUD, resume works, and focus loss pauses', () => {
  key('KeyP'); frame(); release('KeyP');
  const before = doc.querySelector('#distance').textContent;
  frame(180);
  assert(doc.querySelector('#resume') && doc.querySelector('#distance').textContent === before, 'pause freeze');
  time += 60000; // Simulate RAF being suspended while the tab was hidden.
  click('#resume');
  assert(doc.querySelector('#distance').textContent === before, 'resume applied hidden-tab time');
  frame(10);
  assert(doc.querySelector('#overlay').hidden, 'resume');
  win.dispatchEvent(new win.Event('blur')); frame();
  assert(doc.querySelector('#resume'), 'blur pause');
  click('#resume');
});
test('Three failures and R restarts, plus results guide return', () => {
  for (let run = 0; run < 3; run++) {
    key('ArrowLeft'); frame(60); release('ArrowLeft');
    key('Space'); release('Space'); frame(100);
    assert(doc.querySelector('#restart'), 'missing game over');
    assert(doc.querySelector('.panel').textContent.includes('Missed the next ride'), 'failure reason');
    if (run === 0) {
      click('#guide');
      assert(doc.querySelector('.panel').textContent.includes('1 of 4'), 'lost discoveries');
      click('#back');
      assert(doc.querySelector('#restart'), 'guide back to results');
    }
    key('KeyR'); release('KeyR'); frame();
    assert(doc.querySelector('#mount').textContent === 'Gull', 'restart mount');
    assert(parseInt(doc.querySelector('#distance').textContent) === 0, 'restart score');
  }
});
document.querySelector('#results').textContent = results.join('\n') + `\n\n${results.length - failures}/${results.length} checks passed.`;
document.body.dataset.status = failures ? 'failed' : 'passed';
