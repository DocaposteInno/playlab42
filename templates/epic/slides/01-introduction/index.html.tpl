<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE_HTML}} — Comprendre la règle</title>
  <link rel="stylesheet" href="../../../../../lib/theme.css">
  <link rel="stylesheet" href="../../../../../lib/ui.css">
  <link rel="stylesheet" href="../../../../_shared/slide-base.css">
  <link rel="stylesheet" href="../../../../_shared/slide-layout.css">
  <link rel="stylesheet" href="../../../../../lib/components.css">
</head>
<body>
  <article class="slide">
    <header><h1>{{TITLE_HTML}}</h1><p>Objectif : expliquer une règle à partir d'un cas observable.</p></header>
    <section class="ui-card">
      <h2>Prendre la dernière pierre</h2>
      <p>Deux joueurs retirent à tour de rôle une ou deux pierres. Celui qui prend la dernière gagne.</p>
      <p>Avec trois pierres, chaque choix laisse à l'adversaire assez de pierres pour gagner immédiatement.</p>
      <h2>À retenir</h2>
      <p>Tester les petits cas aide à formuler une stratégie et à écrire des tests de règles.</p>
    </section>
    <nav id="standalone-navigation" aria-label="Navigation du parcours" hidden><a href="../02-pratique/index.html">Passer à la pratique</a></nav>
    <footer><p data-slide-footer>{{TITLE_HTML}} — Comprendre la règle (1/2)</p></footer>
  </article>
  <script type="module">
    import { initSlide } from '../../../../_shared/slide-utils.js';
    await initSlide();
    if (window.parent === window) {
      document.getElementById('standalone-navigation').hidden = false;
    }
  </script>
</body>
</html>
