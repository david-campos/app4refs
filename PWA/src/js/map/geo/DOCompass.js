/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * @constant {boolean}
 */
const DOCOMPASS_USE_CAPTURE = true;

/**
 * This class obtains the direction which the user (or, better saying, the phone)
 * is looking with respect to the geographic north making use of the DeviceOrientationEvent
 * of the mobile phones. It uses webkitHeading to work on iPhone.
 * @implements {Compass}
 */
class DOCompass {
    /**
     * Determines if the compass is able to work in the current browser
     * @static
     * @return {boolean} True if it is able, false if not.
     */
    static isAvailable() {
        return ('ondeviceorientation' in window);
    }

    constructor() {
        /**
         * The listener  callback for the sensor updates
         * @type {?CompassListener} listener
         * @private
         */
        this._listener = null;
        this._myCallback = (...x)=>this._onReading(...x);
    }

    /**
     * Starts the compass
     * @param {CompassListener} listener - function to call for updates
     */
    start(listener) {
        this._listener = listener;
        window.addEventListener('deviceorientation', this._myCallback, DOCOMPASS_USE_CAPTURE);
    }

    /**
     * @param {DeviceOrientationEvent} eventData
     * @private
     */
    _onReading(eventData) {
        let heading = null;
        let hasAbsoluteAlpha = (
            eventData.absolute
            && eventData.alpha !== null
            && !isNaN(eventData.alpha));
        let hasWebkitCompass = (
            typeof eventData.webkitCompassHeading !== 'undefined'
            && eventData.webkitCompassHeading !== null
            && !isNaN(eventData.webkitCompassHeading));
        let error = !(hasAbsoluteAlpha || hasWebkitCompass);
        if(!error) {
            if(hasAbsoluteAlpha) heading = -eventData.alpha;
            else heading = -eventData.webkitCompassHeading;
        }
        if(this._listener) {
            this._listener(heading, error);
        }
    }

    /**
     * Stops the compass
     */
    stop() {
        window.removeEventListener('deviceorientation', this._myCallback, DOCOMPASS_USE_CAPTURE);
    }
}