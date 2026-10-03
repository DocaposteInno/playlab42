<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE_HTML}}</title>
  <link rel="stylesheet" href="../../lib/theme.css">
  <link rel="stylesheet" href="../../lib/ui.css">
  <link rel="stylesheet" href="../../lib/components.css">
  <style>
    #text { display: block; width: 100%; min-height: 12rem; margin-block: var(--space-md); }
  </style>
</head>
<body class="ui-page">
  <main class="ui-container">
    <h1>{{TITLE_HTML}}</h1>
    <p>Analysez votre texte localement : aucune donnée n'est envoyée.</p>
    <section class="ui-card" aria-labelledby="input-title">
      <h2 id="input-title">Compteur de texte</h2>
      <label class="ui-label" for="text">Texte à analyser</label>
      <textarea class="ui-field" id="text" aria-describedby="help"></textarea>
      <p class="ui-help" id="help">Les espaces comptent comme caractères ; les mots sont séparés par des espaces.</p>
      <p class="ui-status" id="result" role="status" aria-live="polite" aria-atomic="true">0 mot(s), 0 caractère(s).</p>
      <div class="ui-actions">
        <button class="ui-button ui-button-primary" id="clear" type="button">Effacer le texte</button>
        <button class="ui-button" id="theme" type="button">Changer de thème</button>
      </div>
    </section>
  </main>
  <script type="module">
    import { initTheme, toggleTheme } from '../../lib/theme.js';
    initTheme();
    const text = document.getElementById('text');
    const result = document.getElementById('result');
    function update() {
      const words = text.value.trim() ? text.value.trim().split(/\s+/u).length : 0;
      result.textContent = `${words} mot(s), ${Array.from(text.value).length} caractère(s).`;
    }
    text.addEventListener('input', update);
    document.getElementById('clear').addEventListener('click', () => {
      text.value = '';
      update();
      text.focus();
    });
    document.getElementById('theme').addEventListener('click', toggleTheme);
  </script>
</body>
</html>
