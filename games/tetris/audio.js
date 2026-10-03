/** Synthèse sonore minimale : aucun asset distant ni lecture automatique. */
export class TetrisAudio {
  /**
   * @param {Window} browser - Fenêtre du jeu.
   * @param {(message: string) => void} onError - Notification d'échec d'activation.
   */
  constructor(browser, onError = message => console.warn(message)) {
    this.browser = browser;
    this.onError = onError;
    this.context = null;
    this.enabled = false;
  }

  /**
   * Active le son exclusivement après un geste utilisateur.
   * @param {boolean} enabled - Préférence locale et du portail.
   * @returns {boolean} Capacité à produire du son.
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled && !this.context) {
      const AudioContext = this.browser.AudioContext || this.browser.webkitAudioContext;
      if (!AudioContext) {
        this.enabled = false;
        return false;
      }
      this.context = new AudioContext();
    }
    if (enabled && this.context.state === 'suspended') {
      this.context.resume().catch(error => {
        this.enabled = false;
        console.warn('Activation du son impossible :', error);
        this.onError('Le navigateur a refusé l’activation du son. Le jeu reste disponible sans audio.');
      });
    }
    return this.enabled;
  }

  /**
   * Joue un motif court, sans boucle.
   * @param {'move'|'rotate'|'hold'|'drop'|'clear'|'end'} event - Événement.
   */
  play(event) {
    if (!this.enabled || !this.context || this.context.state !== 'running') { return; }
    const notes = {
      move: [140], rotate: [280], hold: [220, 330], drop: [90, 60],
      clear: [440, 554, 659, 880], end: [330, 220, 110],
    }[event];
    if (!notes) { return; }
    notes.forEach((frequency, index) => {
      const start = this.context.currentTime + index * .055;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = event === 'drop' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.06, start + .005);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .09);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + .1);
    });
  }

  /** Libère l'AudioContext lors du démontage. */
  dispose() {
    this.enabled = false;
    if (this.context) {
      this.context.close().catch(error => console.warn('Fermeture du son impossible :', error));
      this.context = null;
    }
  }
}
