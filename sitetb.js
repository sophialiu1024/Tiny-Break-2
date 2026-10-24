(function () {
  const pointsKey = 'tinyBreakPoints';
  const themeKey = 'tinyBreakTheme';
  const multiplierOwnedKey = 'tinyBreakMultiplierOwned';
  const multiplierOnKey = 'tinyBreakMultiplierOn';

  function points() { return Number(localStorage.getItem(pointsKey) || 0); }
  function multiplierOn() { return localStorage.getItem(multiplierOnKey) === 'true'; }
  function addPoints(amount, game = 'general') {
    const earned = Math.max(0, Number(amount) || 0) * (multiplierOn() ? 2 : 1);
    localStorage.setItem(pointsKey, String(points() + earned));
    const earnedKey = `tinyBreakEarned_${game}`;
    localStorage.setItem(earnedKey, String(Number(localStorage.getItem(earnedKey) || 0) + earned));
    document.dispatchEvent(new CustomEvent('pointschange'));
    return earned;
  }
  function gameEarned(game) { return Number(localStorage.getItem(`tinyBreakEarned_${game}`) || 0); }
  function applyTheme() {
    const theme = localStorage.getItem(themeKey) || 'blue';
    document.body.dataset.theme = theme;
  }
  window.tinyBreak = {
    points,
    addPoints,
    gameEarned,
    multiplierOn,
    multiplierOwned: () => localStorage.getItem(multiplierOwnedKey) === 'true',
    theme: () => localStorage.getItem(themeKey) || 'blue',
    setTheme: theme => { localStorage.setItem(themeKey, theme); applyTheme(); },
    setMultiplier: on => { localStorage.setItem(multiplierOnKey, String(Boolean(on))); document.dispatchEvent(new CustomEvent('pointschange')); },
    buyMultiplier: () => { localStorage.setItem(multiplierOwnedKey, 'true'); localStorage.setItem(multiplierOnKey, 'true'); }
  };
  document.addEventListener('DOMContentLoaded', applyTheme);
  if (document.body) {
    applyTheme();
    const updateCounters = () => {
      const total = document.querySelector('#totalPoints');
      if (total) total.textContent = points();
      const gameTotal = document.querySelector('#gamePoints');
      if (gameTotal && document.body.dataset.game) gameTotal.textContent = gameEarned(document.body.dataset.game);
    };
    document.addEventListener('pointschange', updateCounters);
    updateCounters();
  }
})();
