/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * @constant {boolean}
 */
const DOACOMPASS_USE_CAPTURE = true;

/**
 * This class obtains the direction which the user (or, better saying, the phone)
 * is looking with respect to the geographic north making use of the DeviceOrientationAbsoluteEvent
 * of the browsers. This may work in some navigators.
 * @implements {Compass}
 */
class DOACompass {
    /**
     * Determines if the compass is able to work in the current browser
     * @static
     * @return {boolean} True if it is able, false if not.
     */
    static isAvailable() {
        return ('ondeviceorientationabsolute' in window);
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
        window.addEventListener('deviceorientationabsolute', this._myCallback, DOACOMPASS_USE_CAPTURE);
    }

    /**
     * @param {DeviceOrientationAbsoluteEvent} eventData
     * @private
     */
    _onReading(eventData) {
        let heading = null;
        let error = (eventData.alpha === null || isNaN(eventData.alpha));
        if(!error) {
            heading = -eventData.alpha;
        }
        if(this._listener) {
            this._listener(heading, error);
        }
    }

    /**
     * Stops the compass
     */
    stop() {
        window.removeEventListener('deviceorientationabsolute', this._myCallback, DOACOMPASS_USE_CAPTURE);
    }
}