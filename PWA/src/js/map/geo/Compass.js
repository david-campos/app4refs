/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Interface for compasses, which are classes prepared to
 * detect the direction the user is looking at.
 * They conform an Strategy Pattern.
 *
 * @interface Compass
 */

/**
 * Determines if the compass is able to work in the current browser
 * @function
 * @name Compass#isAvailable
 * @static
 * @return {boolean} True if it is able, false if not.
 */

/**
 * Starts the compass
 *
 * @function
 * @name Compass#start
 * @param {CompassListener} listener - The function to be called when a new value is received
 */

/**
 * Stops the compass
 *
 * @function
 * @name Compass#stop
 */

/**
 * @callback CompassListener
 * @param {?number} heading - The new heading value
 * @param {boolean} error - If an error ocurred it will be true
 */