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
 * Gets the direction the user is looking at.
 *
 * @function
 * @name Compass#getHeading
 * @return {number} The angle (in degrees) clockwise from the North
 */