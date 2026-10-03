<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE_HTML}} — Pratique</title>
  <link rel="stylesheet" href="../../../../../lib/theme.css">
  <link rel="stylesheet" href="../../../../../lib/ui.css">
  <link rel="stylesheet" href="../../../../_shared/slide-base.css">
  <link rel="stylesheet" href="../../../../_shared/slide-layout.css">
  <link rel="stylesheet" href="../../../../../lib/components.css">
</head>
<body>
  <article class="slide">
    <h1>Vérifier sa compréhension</h1>
    <p>Il reste quatre pierres. Quel choix permet de laisser une position perdante à l'adversaire ?</p>
    <form class="ui-card ui-form" id="quiz">
      <label class="ui-label" for="answer">Nombre de pierres à retirer</label>
      <select class="ui-field" id="answer" required>
        <option value="">Choisir une réponse</option>
        <option value="1">Une pierre</option>
        <option value="2">Deux pierres</option>
      </select>
      <button class="ui-button ui-button-primary" type="submit">Vérifier ma réponse</button>
    </form>
    <p class="ui-status" id="feedback" role="status" aria-live="polite" aria-atomic="true"></p>
    <nav id="standalone-navigation" aria-label="Navigation du parcours" hidden><a href="../01-introduction/index.html">Revoir la règle</a></nav>
    <footer><p data-slide-footer>{{TITLE_HTML}} — Vérifier sa compréhension (2/2)</p></footer>
  </article>
  <script type="module">
    import { initSlide } from '../../../../_shared/slide-utils.js';
    await initSlide();
    if (window.parent === window) {
      document.getElementById('standalone-navigation').hidden = false;
    }
    document.getElementById('quiz').addEventListener('submit', event => {
      event.preventDefault();
      document.getElementById('feedback').textContent = document.getElementById('answer').value === '1'
        ? 'Exact : il reste trois pierres ; chaque choix adverse vous permet de terminer.'
        : 'Réessayez : avec deux pierres restantes, votre adversaire peut prendre les deux et gagner.';
    });
  </script>
</body>
</html>
