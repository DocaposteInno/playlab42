/**
 * Suit l'ouverture d'une modale CSS et assure focus, Échap et boucle Tab.
 * @param {HTMLElement} overlay Conteneur de la modale.
 * @param {{openClass: string, onClose: Function}} options Classe visible et fermeture.
 * @returns {Function} Nettoyage des écouteurs.
 */
export function observeDialog(overlay, { openClass, onClose }) {
  let opened = false;
  let previousFocus = null;
  const focusable = () => [...overlay.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
    .filter(element => {
      if (element.closest('[hidden], [aria-hidden="true"]')) {return false;}
      for (let ancestor = element; ancestor && overlay.contains(ancestor); ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.display === 'none' || style.visibility === 'hidden') {return false;}
      }
      return true;
    });
  const sync = () => {
    const visible = overlay.classList.contains(openClass);
    overlay.setAttribute('aria-hidden', String(!visible));
    if (visible && !opened) {
      previousFocus = document.activeElement;
      focusable()[0]?.focus();
    } else if (!visible && opened && overlay.contains(document.activeElement)) {
      previousFocus?.focus();
    }
    opened = visible;
  };
  const keydown = (event) => {
    if (!overlay.classList.contains(openClass)) {return;}
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === 'Tab') {
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!items.length) { event.preventDefault(); return; }
      if (!overlay.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', keydown, true);
  sync();
  return () => {
    observer.disconnect();
    document.removeEventListener('keydown', keydown, true);
  };
}
