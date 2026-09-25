// AgriNex Speech Recognition Service - Speech-to-Text
// Graceful permission handling & fallback for browsers

class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    this.SpeechRecognitionClass = SpeechRecognition;
    this.recognition = null;
    this.isListening = false;
  }

  isSupported() {
    return !!this.SpeechRecognitionClass;
  }

  startListening({ lang = 'en-IN', onResult, onError, onEnd }) {
    if (!this.isSupported()) {
      if (onError) onError(new Error('Voice input is not supported on this browser. Please type your question.'));
      return;
    }

    this.stopListening();

    try {
      this.recognition = new this.SpeechRecognitionClass();
      this.recognition.lang = lang;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (onResult) {
          onResult({
            transcript: finalTranscript || interimTranscript,
            isFinal: !!finalTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errMsg = 'Speech recognition error';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errMsg = 'Microphone permission was denied. You can type your question instead.';
        } else if (event.error === 'no-speech') {
          errMsg = 'No speech was detected. Please try speaking again.';
        }
        if (onError) onError(new Error(errMsg));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore abort error
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export default new SpeechRecognitionService();
