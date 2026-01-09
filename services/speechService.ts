
export class SpeechService {
  private static synth = window.speechSynthesis;

  static speak(text: string, onEnd?: () => void) {
    // Cancel any current speaking
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (onEnd) utterance.onend = onEnd;
    this.synth.speak(utterance);
  }

  static stop() {
    this.synth.cancel();
  }

  static async listenOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        reject('Speech recognition not supported');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        resolve(text);
      };

      recognition.onerror = (event: any) => {
        reject(event.error);
      };

      recognition.start();
    });
  }
}
