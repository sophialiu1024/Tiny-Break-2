const pointsEl = document.querySelector('#points');
const statusEl = document.querySelector('#shopStatus');
const pinkButton = document.querySelector('#pinkButton');
const yellowButton = document.querySelector('#yellowButton');
const multiplierButton = document.querySelector('#multiplierButton');
const toggleMultiplier = document.querySelector('#toggleMultiplier');
const COST = 500;

function ownedTheme(theme) { return localStorage.getItem(`tinyBreakOwned_${theme}`) === 'true'; }
function buyTheme(theme, button) {
  if (ownedTheme(theme)) { window.tinyBreak.setTheme(theme); statusEl.textContent = `${theme} theme selected.`; render(); return; }
  if (window.tinyBreak.points() < COST) { statusEl.textContent = 'You need more points for that theme.'; return; }
  localStorage.setItem('tinyBreakPoints', String(window.tinyBreak.points() - COST));
  localStorage.setItem(`tinyBreakOwned_${theme}`, 'true');
  window.tinyBreak.setTheme(theme);
  statusEl.textContent = `${theme} theme unlocked and selected.`;
  render();
}
function render() {
  const points = window.tinyBreak.points();
  pointsEl.textContent = points;
  const activeTheme = window.tinyBreak.theme();
  [['pink', pinkButton], ['yellow', yellowButton]].forEach(([theme, button]) => {
    button.textContent = ownedTheme(theme) ? (activeTheme === theme ? 'This theme is selected' : 'Use this theme') : 'Buy for 500 points';
    button.disabled = !ownedTheme(theme) && points < COST;
  });
  const owned = window.tinyBreak.multiplierOwned();
  multiplierButton.hidden = owned;
  multiplierButton.disabled = !owned && points < 1000;
  toggleMultiplier.hidden = !owned;
  toggleMultiplier.textContent = window.tinyBreak.multiplierOn() ? 'Turn multiplier off' : 'Turn multiplier on';
  toggleMultiplier.classList.toggle('active', window.tinyBreak.multiplierOn());
}
pinkButton.onclick = () => buyTheme('pink', pinkButton);
yellowButton.onclick = () => buyTheme('yellow', yellowButton);
multiplierButton.onclick = () => {
  if (window.tinyBreak.points() < 1000) { statusEl.textContent = 'You need more points for the multiplier.'; return; }
  localStorage.setItem('tinyBreakPoints', String(window.tinyBreak.points() - 1000));
  window.tinyBreak.buyMultiplier();
  statusEl.textContent = 'Point multiplier unlocked and switched on.';
  render();
};
toggleMultiplier.onclick = () => { window.tinyBreak.setMultiplier(!window.tinyBreak.multiplierOn()); statusEl.textContent = window.tinyBreak.multiplierOn() ? 'Multiplier switched on.' : 'Multiplier switched off.'; render(); };
document.addEventListener('pointschange', render);
render();
