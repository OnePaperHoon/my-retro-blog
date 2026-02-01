// Windows 98 Sound Effects System
// Uses Web Audio API for generating sounds

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.volume = 0.5;
    this.initialized = false;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Set mute state
  setMute(muted) {
    this.isMuted = muted;
  }

  // Create oscillator with envelope
  playTone(frequency, duration, type = 'square', volumeMultiplier = 1) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    const effectiveVolume = this.volume * volumeMultiplier;
    gainNode.gain.setValueAtTime(effectiveVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play multiple tones in sequence
  playSequence(notes, gap = 0) {
    if (!this.audioContext || this.isMuted) return;

    let currentTime = this.audioContext.currentTime;

    notes.forEach(({ frequency, duration, type = 'square', volumeMultiplier = 1 }) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, currentTime);

      const effectiveVolume = this.volume * volumeMultiplier;
      gainNode.gain.setValueAtTime(effectiveVolume, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);

      currentTime += duration + gap;
    });
  }

  // ========== Predefined Sound Effects ==========

  // Button click sound
  click() {
    this.playTone(800, 0.05, 'square', 0.3);
  }

  // Window open sound
  windowOpen() {
    this.playSequence([
      { frequency: 400, duration: 0.08, type: 'square', volumeMultiplier: 0.4 },
      { frequency: 600, duration: 0.08, type: 'square', volumeMultiplier: 0.4 }
    ], 0.02);
  }

  // Window close sound
  windowClose() {
    this.playSequence([
      { frequency: 600, duration: 0.08, type: 'square', volumeMultiplier: 0.4 },
      { frequency: 400, duration: 0.08, type: 'square', volumeMultiplier: 0.4 }
    ], 0.02);
  }

  // Menu open sound
  menuOpen() {
    this.playTone(500, 0.04, 'square', 0.3);
  }

  // Error sound (ding)
  error() {
    this.playSequence([
      { frequency: 400, duration: 0.15, type: 'square', volumeMultiplier: 0.5 },
      { frequency: 300, duration: 0.15, type: 'square', volumeMultiplier: 0.5 }
    ], 0.05);
  }

  // Warning sound
  warning() {
    this.playSequence([
      { frequency: 500, duration: 0.1, type: 'triangle', volumeMultiplier: 0.5 },
      { frequency: 500, duration: 0.1, type: 'triangle', volumeMultiplier: 0.5 }
    ], 0.1);
  }

  // Info/notification sound
  notification() {
    this.playSequence([
      { frequency: 523, duration: 0.1, type: 'sine', volumeMultiplier: 0.4 },
      { frequency: 659, duration: 0.15, type: 'sine', volumeMultiplier: 0.4 }
    ], 0.02);
  }

  // Question sound
  question() {
    this.playSequence([
      { frequency: 440, duration: 0.15, type: 'triangle', volumeMultiplier: 0.4 },
      { frequency: 550, duration: 0.2, type: 'triangle', volumeMultiplier: 0.4 }
    ], 0.05);
  }

  // Windows 98 startup sound (simplified approximation)
  startup() {
    this.playSequence([
      { frequency: 523, duration: 0.2, type: 'sine', volumeMultiplier: 0.5 },  // C5
      { frequency: 659, duration: 0.2, type: 'sine', volumeMultiplier: 0.5 },  // E5
      { frequency: 784, duration: 0.2, type: 'sine', volumeMultiplier: 0.5 },  // G5
      { frequency: 1047, duration: 0.4, type: 'sine', volumeMultiplier: 0.5 }, // C6
    ], 0.05);
  }

  // Shutdown sound
  shutdown() {
    this.playSequence([
      { frequency: 784, duration: 0.2, type: 'sine', volumeMultiplier: 0.4 },  // G5
      { frequency: 659, duration: 0.2, type: 'sine', volumeMultiplier: 0.4 },  // E5
      { frequency: 523, duration: 0.2, type: 'sine', volumeMultiplier: 0.4 },  // C5
      { frequency: 392, duration: 0.4, type: 'sine', volumeMultiplier: 0.4 },  // G4
    ], 0.05);
  }

  // Minimize window sound
  minimize() {
    this.playTone(300, 0.1, 'square', 0.3);
  }

  // Maximize/restore window sound
  maximize() {
    this.playTone(600, 0.1, 'square', 0.3);
  }

  // Icon select sound
  select() {
    this.playTone(1000, 0.03, 'square', 0.2);
  }

  // Empty recycle bin sound
  emptyTrash() {
    this.playSequence([
      { frequency: 200, duration: 0.1, type: 'sawtooth', volumeMultiplier: 0.3 },
      { frequency: 150, duration: 0.1, type: 'sawtooth', volumeMultiplier: 0.3 },
      { frequency: 100, duration: 0.15, type: 'sawtooth', volumeMultiplier: 0.3 }
    ], 0);
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Named exports for convenience
export const playClick = () => soundManager.click();
export const playWindowOpen = () => soundManager.windowOpen();
export const playWindowClose = () => soundManager.windowClose();
export const playMenuOpen = () => soundManager.menuOpen();
export const playError = () => soundManager.error();
export const playWarning = () => soundManager.warning();
export const playNotification = () => soundManager.notification();
export const playQuestion = () => soundManager.question();
export const playStartup = () => soundManager.startup();
export const playShutdown = () => soundManager.shutdown();
export const playMinimize = () => soundManager.minimize();
export const playMaximize = () => soundManager.maximize();
export const playSelect = () => soundManager.select();
export const playEmptyTrash = () => soundManager.emptyTrash();
export const initSound = () => soundManager.init();
export const setVolume = (v) => soundManager.setVolume(v);
export const toggleMute = () => soundManager.toggleMute();
export const setMute = (m) => soundManager.setMute(m);
