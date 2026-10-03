<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE_HTML}}</title>
  <link rel="stylesheet" href="../../lib/theme.css">
  <link rel="stylesheet" href="../../lib/ui.css">
  <link rel="stylesheet" href="../../lib/components.css">
  <link rel="stylesheet" href="style.css">
</head>
<body class="ui-page">
  <main class="ui-container">
    <header class="ui-header"><h1>{{TITLE_HTML}}</h1><button class="ui-button" id="theme" type="button">Changer de thème</button></header>
    <section class="ui-card" aria-labelledby="rules">
      <h2 id="rules">La dernière pierre</h2>
      <p>Retirez une ou deux pierres à chaque tour. Prendre la dernière fait gagner. Vous commencez contre le bot Prudent.</p>
      <form class="ui-actions" id="new-game">
        <label class="ui-label" for="seed">Seed de la partie</label>
        <input class="ui-field" id="seed" type="number" min="0" max="4294967295" step="1" value="42" required>
        <button class="ui-button ui-button-primary" type="submit">Nouvelle partie</button>
      </form>
      <p id="stones"></p>
      <div class="ui-actions" role="group" aria-label="Pierres à retirer">
        <button class="ui-button" id="take-one" type="button">Retirer une pierre</button>
        <button class="ui-button" id="take-two" type="button">Retirer deux pierres</button>
      </div>
      <p class="ui-status" id="status" role="status" aria-live="polite" aria-atomic="true"></p>
    </section>
  </main>
  <script type="module" src="main.js"></script>
</body>
</html>
