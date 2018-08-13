/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * It generates spoken speach, it is a proxy for the navigator
 * voice synthetising API.
 */
class VoiceSynthesizer {
    constructor() {
        /**
         * Indicates if the voice synthetisation is available in this
         * browser
         * @type {boolean}
         * @private
         */
        this._available = ('speechSynthesis' in window);
        /**
         * The current voice in use, null if none available
         * @type {?SpeechSynthesisVoice}
         * @private
         */
        this._voice = null;

        if(this._available) {
            // We choose the default one by now
            this._voice = window.speechSynthesis.getVoices().filter((voice) => voice.default)[0];
        }
    }

    /**
     * If it is possible, it will say the passed text to the user
     * @param {string} text - The text to say
     */
    say(text) {
        if(!this._available)
            return;

        let utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this._voice;
        window.speechSynthesis.speak(utterance);
    }

    /**
     * Stops the voice and deletes the remaining
     * messages to say.
     */
    shutUp() {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
    }
}