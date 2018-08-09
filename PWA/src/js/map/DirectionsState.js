/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * The sate of a request for directions, used by the directions manager
 *
 * @interface DirectionsState
 */

/**
 * The origin of the directions
 *
 * @property
 * @name DirectionsState#from
 * @type google.maps.LatLng
 */

/**
 * The destination of the directions
 *
 * @property
 * @name DirectionsState#to
 * @type google.maps.LatLng
 */

/**
 * The status of the directions answer, if received already
 *
 * @property
 * @name DirectionsState#status
 * @type ?google.maps.DirectionsStatus
 */

/**
 * The result answered by the API, if received already
 *
 * @property
 * @name DirectionsState#result
 * @type ?google.maps.DirectionsResult
 */

