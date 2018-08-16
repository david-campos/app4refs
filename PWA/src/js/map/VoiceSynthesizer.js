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
            this._selectVoice();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = (()=>this._selectVoice());
            }
        }
    }

    /**
     * Selects the voice to use by the speech synthesizer
     * @private
     */
    _selectVoice() {
        let voices = window.speechSynthesis.getVoices();
        if(voices.length > 0) {
            // Take voices of the directions language
            let languageVoices = voices.filter((voice) => voice.lang === DIRECTIONS_LANG);
            if (languageVoices.length > 0) {
                // Sort voices to pick the first
                languageVoices.sort((a, b)=>{
                    // Default voices first
                    if(a.default && !b.default)
                        return -1;
                    else if(!a.default && b.default)
                        return 1;
                    // If not sorted by that, try to take a google voice
                    let aIsGoogle = a.name.includes("Google");
                    let bIsGoogle = b.name.includes("Google");
                    if(aIsGoogle && !bIsGoogle)
                        return -1;
                    else if(!aIsGoogle && bIsGoogle)
                        return 1;
                    // If not, try to take a local one
                    if(a.localService && !b.localService)
                        return -1;
                    else if(!a.localService && b.localService)
                        return 1;
                    // They are equal
                    return 0;
                });
                // Pick first one
                this._voice = languageVoices[0];
            }
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
        utterance.lang = DIRECTIONS_LANG;
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