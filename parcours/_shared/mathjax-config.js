/**
 * Chemins MathJax 4 locaux, évalués avant le script asynchrone.
 * Les réglages TeX propres à chaque parcours sont conservés.
 */
(() => {
  const vendor = new URL('../../assets/vendor/', document.currentScript.src);
  const existing = window.MathJax || {};
  window.MathJax = {
    ...existing,
    loader: {
      ...existing.loader,
      paths: {
        ...existing.loader?.paths,
        mathjax: new URL('mathjax/', vendor).href.replace(/\/$/, ''),
        fonts: vendor.href.replace(/\/$/, ''),
        sre: new URL('mathjax/sre/', vendor).href.replace(/\/$/, ''),
        mathmaps: new URL('mathjax/sre/mathmaps/', vendor).href.replace(/\/$/, ''),
      },
    },
    output: {
      ...existing.output,
      font: 'mathjax-newcm',
      fontPath: '[fonts]/%%FONT%%-font',
    },
    chtml: {
      ...existing.chtml,
      fontURL: new URL('mathjax-newcm-font/chtml/woff2/', vendor).href.replace(/\/$/, ''),
      dynamicPrefix: new URL('mathjax-newcm-font/chtml/dynamic/', vendor).href.replace(/\/$/, ''),
    },
  };
})();
