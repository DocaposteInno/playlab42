/**
 * main.js - Point d'entrée du Relativity Lab 3D
 *
 * Initialise et assemble tous les composants :
 * - SceneManager (Three.js)
 * - Simulation (logique relativiste)
 * - HUD (affichage données)
 * - ControlPanel (lil-gui)
 */

import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Simulation } from './Simulation.js';
import { HUD } from '../ui/HUD.js';
import { ObserverView } from '../ui/ObserverView.js';
import { MotorPanel } from '../ui/MotorPanel.js';
import { DopplerGraph } from '../ui/DopplerGraph.js';
import { ClockPanel } from '../ui/ClockPanel.js';
import { createControlPanel } from '../ui/ControlPanel.js';
import { makeDraggable } from '../ui/DraggablePanel.js';

/**
 * Application principale
 */
class App {
  /** @type {SceneManager} */
  sceneManager;

  /** @type {Simulation} */
  simulation;

  /** @type {HUD} */
  hud;

  /** @type {ObserverView} */
  observerView;

  /** @type {MotorPanel} */
  motorPanel;

  /** @type {DopplerGraph} */
  dopplerGraph;

  /** @type {ClockPanel} */
  clockPanel;

  /** @type {GUI} */
  controlPanel;

  /** @type {number} */
  #lastTime = 0;

  /** @type {boolean} */
  #isRunning = false;

  /**
   * Initialise l'application
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line require-await
  async init() {
    // Récupérer les conteneurs DOM
    const canvasContainer = document.getElementById('canvas-container');
    const hudContainer = document.getElementById('hud');

    if (!canvasContainer || !hudContainer) {
      throw new Error('Conteneurs DOM non trouvés');
    }

    // Supprimer le message de chargement
    const loadingEl = canvasContainer.querySelector('.loading');
    if (loadingEl) {
      loadingEl.remove();
    }

    // Créer le gestionnaire de scène
    this.sceneManager = new SceneManager(canvasContainer);

    // Créer la simulation
    this.simulation = new Simulation(this.sceneManager.scene);

    // Créer les observateurs initiaux
    this.#createInitialObservers();

    // Créer le HUD avec callback pour changement de référentiel
    this.hud = new HUD(hudContainer, (observerId) => {
      this.simulation.setReferenceFrame(observerId);
      // Centrer la caméra sur le nouvel observateur
      const observer = this.simulation.getObserver(observerId);
      if (observer) {
        this.sceneManager.setTarget(observer.position);
      }
      console.log(`🔄 Référentiel changé vers: ${observerId}`);
    });

    // Créer la vue cockpit (ObserverView)
    const observerViewContainer = document.getElementById('observer-view');
    if (observerViewContainer) {
      this.observerView = new ObserverView(observerViewContainer);
    }

    // Créer le panneau moteur
    const motorPanelContainer = document.getElementById('motor-panel');
    if (motorPanelContainer) {
      this.motorPanel = new MotorPanel(motorPanelContainer, (direction, deltaMass) => {
        // Appliquer la poussée à l'observateur de référence
        if (this.simulation.referenceObserver) {
          const result = this.simulation.referenceObserver.applyThrust(direction, deltaMass);
          if (result.success) {
            console.log(`🚀 Impulsion: Δv=${(result.deltaV * 100).toFixed(3)}%c, masse=${result.newMass.toFixed(0)}kg`);
          }
        }
      });
    }

    // Créer le graphique Doppler
    const dopplerGraphContainer = document.getElementById('doppler-graph');
    if (dopplerGraphContainer) {
      this.dopplerGraph = new DopplerGraph(dopplerGraphContainer);
    }

    // Créer le panneau des horloges lumineuses
    const clockPanelContainer = document.getElementById('clock-panel');
    if (clockPanelContainer) {
      this.clockPanel = new ClockPanel(clockPanelContainer);
    }

    // Rendre les panneaux déplaçables
    makeDraggable(hudContainer, 'relativity-lab-hud-pos');
    if (clockPanelContainer) {
      makeDraggable(clockPanelContainer, 'relativity-lab-clock-pos');
    }
    if (observerViewContainer) {
      makeDraggable(observerViewContainer, 'relativity-lab-observer-pos');
    }
    if (dopplerGraphContainer) {
      makeDraggable(dopplerGraphContainer, 'relativity-lab-doppler-pos');
    }
    if (motorPanelContainer) {
      makeDraggable(motorPanelContainer, 'relativity-lab-motor-pos');
    }

    // Mettre à jour le HUD, la vue cockpit, le panneau moteur, le graphique Doppler et les horloges à chaque frame
    this.simulation.onUpdate((sim) => {
      const displayData = sim.getDisplayData();
      this.hud.update(displayData);
      if (this.observerView) {
        this.observerView.update(displayData, displayData.observers);
      }
      if (this.motorPanel) {
        const refObserver = displayData.observers.find(o => o.id === displayData.referenceId);
        if (refObserver) {
          this.motorPanel.update(refObserver);
        }
      }
      if (this.dopplerGraph) {
        this.dopplerGraph.update(displayData, displayData.observers);
      }
      if (this.clockPanel) {
        this.clockPanel.update(displayData);
      }

      // Faire suivre la caméra à l'observateur de référence
      if (sim.referenceObserver) {
        this.sceneManager.setTarget(sim.referenceObserver.position);
      }
    });

    // Configurer les boutons Play/Reset
    this.#setupPlayButton();

    // Créer le panneau de contrôle
    this.controlPanel = createControlPanel(this.simulation, this.sceneManager, (playing) => {
      this.#updatePlayButton(playing);
    });

    // Configurer les événements clavier
    this.#setupKeyboard();

    // Écouter les changements de thème
    this.#setupThemeListener();

    // Mettre à jour le HUD, la vue cockpit, le panneau moteur et le graphique Doppler une première fois
    const initialData = this.simulation.getDisplayData();
    this.hud.update(initialData);
    if (this.observerView) {
      this.observerView.update(initialData, initialData.observers);
    }
    if (this.motorPanel) {
      const refObserver = initialData.observers.find(o => o.id === initialData.referenceId);
      if (refObserver) {
        this.motorPanel.update(refObserver);
      }
    }
    if (this.dopplerGraph) {
      this.dopplerGraph.update(initialData, initialData.observers);
    }
    if (this.clockPanel) {
      this.clockPanel.update(initialData);
    }

    console.log('🚀 Relativity Lab initialisé');
  }

  /**
   * Crée les observateurs par défaut
   *
   * Configuration :
   * - Lab : référentiel fixe au centre
   * - Alice : mouvement transversal (axe Y) à 0.3c
   * - Bob : mouvement longitudinal (axe X) à 0.5c
   * - Charlie : mouvement orthogonal (axe Z) à 0.4c
   */
  #createInitialObservers() {
    // Lab : point fixe au centre (référentiel de base)
    this.simulation.addObserver(
      'Lab',
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      { id: 'lab', color: 0xffffff },
    );

    // Alice : mouvement transversal sur l'axe Y
    this.simulation.addObserver(
      'Alice',
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(0, 0.3, 0),  // 30% c transversal
      { color: 0xff6b6b },  // Rouge
    );

    // Bob : mouvement longitudinal sur l'axe X
    this.simulation.addObserver(
      'Bob',
      new THREE.Vector3(3, 0, 0),
      new THREE.Vector3(0.5, 0, 0),  // 50% c longitudinal
      { color: 0x4fc3f7 },  // Bleu
    );

    // Charlie : mouvement orthogonal sur l'axe Z
    this.simulation.addObserver(
      'Charlie',
      new THREE.Vector3(0, 0, 3),
      new THREE.Vector3(0, 0, 0.4),  // 40% c orthogonal
      { color: 0x4ade80 },  // Vert
    );

    // Définir Lab comme référentiel par défaut
    this.simulation.setReferenceFrame('lab');
  }

  /**
   * Configure le gros bouton Play/Pause
   */
  #setupPlayButton() {
    const playBtn = document.getElementById('play-button');
    const resetBtn = document.getElementById('reset-button');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.simulation.toggle();
        this.#updatePlayButton(this.simulation.state === 'running');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.simulation.reset();
        this.#updatePlayButton(false);
      });
    }
  }

  /**
   * Met à jour l'apparence du bouton Play/Pause
   * @param {boolean} playing
   */
  #updatePlayButton(playing) {
    const playBtn = document.getElementById('play-button');
    if (!playBtn) {return;}

    const icon = playBtn.querySelector('.play-button-icon');
    const text = playBtn.querySelector('.play-button-text');
    playBtn.setAttribute('aria-pressed', String(playing));
    playBtn.setAttribute('aria-label', playing ? 'Mettre en pause la simulation' : 'Lire la simulation');

    if (playing) {
      playBtn.classList.add('play-button--running');
      if (icon) {icon.textContent = '⏸';}
      if (text) {text.textContent = 'Pause';}
    } else {
      playBtn.classList.remove('play-button--running');
      if (icon) {icon.textContent = '▶';}
      if (text) {text.textContent = 'Play';}
    }
  }

  /**
   * Configure les raccourcis clavier
   */
  #setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ignorer si on est dans un champ de saisie
      if ((e.target instanceof Element && e.target.closest('input, textarea, select, button, [contenteditable="true"]')) || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.simulation.toggle();
          this.#updatePlayButton(this.simulation.state === 'running');
          break;

        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            this.simulation.reset();
            this.#updatePlayButton(false);
          }
          break;

        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5': {
          // Changer de référentiel avec les touches 1-5
          const index = parseInt(e.code.replace('Digit', '')) - 1;
          const frames = this.simulation.getAvailableFrames();
          if (index < frames.length) {
            this.simulation.setReferenceFrame(frames[index].id);
          }
          break;
        }

        case 'KeyG':
          // Basculer la grille
          this.sceneManager.grid.visible = !this.sceneManager.grid.visible;
          break;

        case 'KeyA':
          // Basculer les axes
          this.sceneManager.axes.visible = !this.sceneManager.axes.visible;
          break;
      }
    });
  }

  /**
   * Configure l'écoute des changements de thème
   */
  #setupThemeListener() {
    // Observer les changements de l'attribut data-theme
    const observer = new MutationObserver(() => {
      this.sceneManager.updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Écouter aussi les changements de media query
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', () => {
      this.sceneManager.updateTheme();
    });
  }

  /**
   * Démarre la boucle de rendu
   */
  start() {
    if (this.#isRunning) {return;}
    this.#isRunning = true;
    this.#lastTime = performance.now();
    this.#animate();
  }

  /**
   * Boucle d'animation
   */
  #animate = () => {
    if (!this.#isRunning) {return;}

    requestAnimationFrame(this.#animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.#lastTime) / 1000;
    this.#lastTime = currentTime;

    // Limiter le delta time pour éviter les sauts
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Gérer la poussée continue du moteur
    if (this.motorPanel && this.simulation.referenceObserver) {
      const thrust = this.motorPanel.getContinuousThrust();
      if (thrust) {
        this.simulation.referenceObserver.applyThrust(thrust.direction, thrust.deltaMass);
      }
    }

    // Mettre à jour la simulation
    this.simulation.update(clampedDelta);

    // Rendre la scène
    this.sceneManager.render();
  };

  /**
   * Arrête la boucle de rendu
   */
  stop() {
    this.#isRunning = false;
  }

  /**
   * Libère les ressources
   */
  dispose() {
    this.stop();
    this.simulation.dispose();
    this.sceneManager.dispose();
    this.controlPanel.destroy();
  }
}

// === Point d'entrée ===

/**
 * Initialise l'application quand le DOM est prêt
 */
function initApp() {
  const app = new App();

  app.init()
    .then(() => {
      app.start();
    })
    .catch((error) => {
      console.error('Erreur d\'initialisation:', error);

      // Afficher un message d'erreur à l'utilisateur
      const container = document.getElementById('canvas-container');
      if (container) {
        container.innerHTML = `
          <div role="alert" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--color-error);
            text-align: center;
            padding: 2rem;
          ">
            <h2>Erreur de chargement</h2>
            <p>${error.message}</p>
            <p style="font-size: 0.8em; opacity: 0.7;">
              Vérifiez la console pour plus de détails.
            </p>
          </div>
        `;
      }
    });

  // Exposer l'app globalement pour le debug
  window.relativityApp = app;
}

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
