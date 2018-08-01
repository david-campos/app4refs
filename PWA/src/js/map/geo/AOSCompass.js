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

    /**
     * Gets the direction the user is looking at.
     *
     * @function
     * @return {number} The angle (in degrees) clockwise from the North
     */
    getHeading() {

    }
}