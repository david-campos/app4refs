/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * AOSCompass class, it obtains the direction which the user (or, better saying, the phone)
 * is looking with respect to the geographic north making use of the AbsoluteOrientationSensor
 * of Google Chrome.
 * @implements {Compass}
 */
class AOSCompass {
    /**
     * Determines if the compass is able to work in the current browser
     * @static
     * @return {boolean} True if it is able, false if not.
     */
    static isAvailable() {
        return ('AbsoluteOrientationSensor' in window);
    }

    constructor() {
        this._sensor = new AbsoluteOrientationSensor({frequency: 60});
        this._sensor.onerror = event => this._onError(event);
        this._sensor.onreading = () => this._onReading();
        /**
         * The listener  callback for the sensor updates
         * @type {?CompassListener} listener
         * @private
         */
        this._listener = null;
    }

    /**
     * Starts the compass
     * @param {CompassListener} listener - function to call for updates
     */
    start(listener) {
        this._sensor.start();
        this._listener = listener;
    }

    _onReading() {
        let w = this._sensor.quaternion[0];
        let x = this._sensor.quaternion[1];
        let y = this._sensor.quaternion[2];
        let z = this._sensor.quaternion[3];

        let t0 = 2 * (w*x+y*z);
        let t1 = 1 - 2 * (x*x+y*y);
        let heading = - Math.atan2(t0, t1) * 180 / Math.PI;

        if(this._listener) {
            this._listener(heading, false);
        }
    }

    _onError(event) {
        console.error("AbsoluteOrientationSensor is not available.", event.error);
        if (event.error.name == 'NotReadableError') {
            if(this._listener) {
                this._listener(null, true);
            }
        }
    }

    /**
     * Stops the compass
     */
    stop() {
        this._sensor.stop();
    }
}