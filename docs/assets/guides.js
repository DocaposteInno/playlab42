import { initTheme, toggleTheme, getEffectiveTheme } from '../../lib/theme.js';

initTheme();
const themeButton = document.getElementById('guide-theme');
if (themeButton) {
  themeButton.hidden = false;
  const updateThemeLabel = () => {
    themeButton.textContent = getEffectiveTheme() === 'dark' ? 'Mode clair' : 'Mode sombre';
    themeButton.setAttribute('aria-label', `Passer en ${themeButton.textContent.toLowerCase()}`);
  };
  themeButton.addEventListener('click', () => {
    toggleTheme();
    updateThemeLabel();
  });
  window.addEventListener('themechange', updateThemeLabel);
  updateThemeLabel();
}

const plan = document.querySelector('.reader-plan');
if (plan) {
  const desktop = window.matchMedia('(min-width: 960px)');
  const updatePlan = () => { plan.open = desktop.matches; };
  desktop.addEventListener('change', updatePlan);
  updatePlan();
}
