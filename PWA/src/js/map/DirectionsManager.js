/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/** @type {TravelMode} */
const TRAVEL_MODE_DRIVING = 'DRIVING';
/** @type {TravelMode} */
const TRAVEL_MODE_TRANSIT = 'TRANSIT';
/** @type {TravelMode} */
const TRAVEL_MODE_WALKING = 'WALKING';

/**
 * This class provides access to the Directions API. Use this instead of a direct connection.
 */
class DirectionsManager {
    /**
     * @param {ItemsMap} itemsMap - The ItemsMap which manages this directions manager
     */
    constructor(itemsMap) {
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
         * If the panel is tried to set before the drawer
         * is created, we store it here to assign it later.
         * @type {DirectionsPanel}
         * @private
         */
        this._savedPanel = null;
        /**
         * @type {TravelMode}
         * @private
         */
        this._travelMode = TRAVEL_MODE_WALKING;
        /**
         * The ItemsMap managing this directions manager
         * @type {ItemsMap}
         * @private
         */
        this._itemsMap = itemsMap;
        /**
         * Determines if we already obtained a route
         * @type {boolean} - True if it has a route
         * @private
         */
        this._hasRoute = false;
    }

    /**
     * Sets the map for the directions manager to be able
     * to print the routes.
     * @param {google.maps.Map} map - The map
     * @param {google.maps.InfoWindow} info - The information window to put the pop-ups
     */
    setMap(map, info) {
        this._routeDrawer = new RouteDrawer(map, info);
        if(this._savedPanel) {
            this._routeDrawer.setDirectionsPanel(this._savedPanel);
            this._routeDrawer.selectedTravelMode(this._travelMode);
        }
        this._directionsSvc = new google.maps.DirectionsService();
    }

    /**
     * Sets the directions panel.
     * It simply delegates in the route drawer, or saves
     * it for later if it has not been created. To achieve this we
     * need to set the map for this manager first.
     * @see {RouteDrawer#setDirectionsPanel}
     * @see {DirectionsManager#setMap}
     * @param {DirectionsPanel} panel
     */
    setDirectionsPanel(panel) {
        this._savedPanel = panel;
        panel.setModeChangeCallback((tM)=>this._travelModeChanged(tM));
        if(this._routeDrawer) {
            this._routeDrawer.setDirectionsPanel(panel);
            this._routeDrawer.selectedTravelMode(this._travelMode);
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
        this._hasRoute = false;
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
            travelMode: this._travelMode
        };
        this._directionsSvc.route(request,
            (...x)=> this._directionsReceived(...x));
    }

    /**
     * Checks if the manager has, currently, a route
     * or it is not displaying any.
     * @return {boolean} - True if it does have a route displayed
     */
    hasRoute() {
        return this._hasRoute;
    }

    /**
     * The currently displayed route, or null if no route is displayed
     * @see {RouteDrawer#getRoute}
     * @return {?google.maps.DirectionsRoute}
     */
    getRoute() {
        return this._routeDrawer.getRoute();
    }

    /**
     * Returns the route drawer created and used by this manager,
     * if created.
     * @return {?RouteDrawer}
     */
    getDrawer() {
        return this._routeDrawer;
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
            this._hasRoute = true;
        } else if(status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            alert("No results");
        } else {
            // Some error
            console.log(result, status);
        }
    }



    /**
     * Called whenever the user picks a new travel mode.
     * @param {TravelMode} newTravelMode - The picked travel mode
     * @private
     */
    _travelModeChanged(newTravelMode) {
        this._travelMode = newTravelMode;
        this._itemsMap.tryToShowRoute();
    }
}
/**
 * @callback GetDirectionsCallback
 * @param {google.maps.DirectionsResult} result - The result received from google maps.
 */

/**
 * @typedef {String} TravelMode
 */
