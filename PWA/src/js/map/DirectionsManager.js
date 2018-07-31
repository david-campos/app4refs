/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class provides access to the Directions API. Use this instead of a direct connection.
 */
class DirectionsManager {
    constructor() {
        /**
         * The directions service, once it is available
         * @type {?google.maps.DirectionsService}
         * @private
         */
        this._directionsSvc = null;
        /**
         * Used to draw the routes on the map,
         * once the google maps api is available
         * @type {?RouteDrawer}
         * @private
         */
        this._routeDrawer = null;
        /**
         * If the container is tried to set before the drawer
         * is created, we store it here to assign it later.
         * @type {?Element}
         * @private
         */
        this._savedContainer = null;
    }

    /**
     * Sets the map for the directions manager to be able
     * to print the routes.
     * @param {google.maps.Map} map - The map
     * @param {google.maps.InfoWindow} info - The information window to put the pop-ups
     */
    setMap(map, info) {
        this._routeDrawer = new RouteDrawer(map, info);
        this._routeDrawer.setDirectionsContainer(this._savedContainer);
        this._directionsSvc = new google.maps.DirectionsService();
    }

    /**
     * Sets the directions container.
     * It simply delegates in the route drawer, so it
     * requires it to be created. To achieve this we
     * need to set the map for this manager first.
     * @see {RouteDrawer#setDirectionsContainer}
     * @see {DirectionsManager#setMap}
     * @param {Element} container
     */
    setDirectionsContainer(container) {
        if(this._routeDrawer) {
            this._routeDrawer.setDirectionsContainer(container);
        } else {
            this._savedContainer = container;
        }
    }

    /**
     * Resets the directions manager, deleting the displayed
     * route and the directions panel if present.
     * It simply delegates in the route drawer.
     * @see {RouteDrawer#clear}
     */
    reset() {
        this._routeDrawer.clear();
    }

    /**
     * Gets the directions to get to the given item,
     * it requires the position to have been obtained.
     * Calls to this method won't work if the maps API
     * is not available
     * @param {Number} fromLat - Latitude of the starting point
     * @param {Number} fromLng - Longitude of the starting point
     * @param {Number} toLat - Latitude of the ending point
     * @param {Number} toLng - Longitude of the ending point
     *
     */
    getDirections(fromLat, fromLng, toLat, toLng) {
        if(!this._directionsSvc) return;

        let start = new google.maps.LatLng(fromLat, fromLng);
        let end = new google.maps.LatLng(toLat, toLng);
        let request = {
            origin: start,
            destination: end,
            travelMode: 'WALKING'
        };
        this._directionsSvc.route(request,
            (...x)=> this._directionsReceived(...x));
    }

    /**
     * When we receive the directions from maps, this function is called
     * @param {google.maps.DirectionsResult} result
     * @param {google.maps.DirectionsStatus} status
     * @private
     */
    _directionsReceived(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            this._routeDrawer.draw(result);
        } else {
            // Some error
            console.log(result, status);
        }
    }
}
/**
 * @callback GetDirectionsCallback
 * @param {google.maps.DirectionsResult} result - The result received from google maps.
 */