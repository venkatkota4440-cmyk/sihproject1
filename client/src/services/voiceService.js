// AgriNex Voice Service - Speech Synthesis (Text-to-Speech)
// Supports English, Telugu, and Hindi with playback controls (Play, Pause, Stop, Replay, Speed, Mute)

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isMuted = false;
    this.speechRate = 1.0;
    this.selectedVoice = null;
    this.onStateChangeCallbacks = new Set();
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentText: ''
    };

    if (this.synth) {
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._onVoicesLoaded();
      }
    }
  }

  isSupported() {
    return !!this.synth;
  }

  _onVoicesLoaded() {
    // Voices loaded in browser
  }

  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices() || [];
  }

  getVoiceForLanguage(langCode = 'en-IN') {
    const voices = this.getVoices();
    if (!voices.length) return null;

    // Match exact code first (e.g. 'te-IN', 'hi-IN', 'en-IN')
    let matched = voices.find(v => v.lang === langCode || v.lang.replace('_', '-') === langCode);
    if (!matched) {
      // Match 2-letter prefix ('te', 'hi', 'en')
      const prefix = langCode.slice(0, 2).toLowerCase();
      matched = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }
    // Fallback to English or default
    if (!matched) {
      matched = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
    return matched;
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.add(callback);
    callback(this.state);
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  _updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.onStateChangeCallbacks.forEach(cb => cb(this.state));
  }

  speak(text, { lang = 'en-IN', rate = 1.0, voice = null, onStart, onEnd, onError } = {}) {
    if (!this.synth || this.isMuted || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stop(); // Stop any currently playing speech

    const cleanText = text.replace(/[*#_`>]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voiceToUse = voice || this.selectedVoice || this.getVoiceForLanguage(lang);
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang || lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = rate || this.speechRate || 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this._updateState({ isPlaying: true, isPaused: false, currentText: cleanText });
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this._updateState({ isPlaying: false, isPaused: false, currentText: '' });
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this._updateState({ isPlaying: false, isPaused: false, currentText: '' });
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.state.isPlaying && !this.state.isPaused) {
      this.synth.pause();
      this._updateState({ isPaused: true });
    }
  }

  resume() {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this._updateState({ isPaused: false });
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this._updateState({ isPlaying: false, isPaused: false, currentText: '' });
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.isMuted) {
      this.stop();
    }
  }

  setRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }
}

export default new VoiceService();
