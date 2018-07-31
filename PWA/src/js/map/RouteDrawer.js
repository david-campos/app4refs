/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class provides methods to draw the routes over the Map from Google Maps.
 */
class RouteDrawer {
    /**
     * @param {google.maps.Map} map - The map
     * @param {google.maps.InfoWindow} info - The information window
     *          to display the steps descriptions and other information
     */
    constructor(map, info) {
        /**
         * The real map, once it is created
         * @type {google.maps.Map}
         * @private
         */
        this._map = map;
        /**
         * The info window, once the map is available
         * @type {google.maps.InfoWindow}
         * @private
         */
        this._info = info;
        /**
         * The directions renderer, once it is available
         * @type {google.maps.DirectionsRenderer}
         * @private
         */
        this._directionsRenderer = this._newDirectionsRenderer();
        /**
         * Route markers, if a route is displayed.
         * @type {google.maps.Marker[]}
         * @private
         */
        this._routeMarkers = [];
        /**
         * The container for the instructions of the directions to display
         * @type {?Element}
         * @private
         */
        this._directionsContainer = null;
    }

    /**
     * Draws a result obtained from the API in the map.
     * @param {google.maps.DirectionsResult} result - The result obtained from the API
     */
    draw(result) {
        this._directionsRenderer.setMap(this._map);
        this._directionsRenderer.setDirections(result);

        if(result.routes.length > 0) {
            // We pick the first route
            this._directionsRenderer.setRouteIndex(0);
            this._drawRouteMarkers(result.routes[0]);
        }
    }

    /**
     * Clears the displayed route from the map
     */
    clear() {
        if(this._directionsRenderer) {
            this._directionsRenderer.setMap(null);
        }
        if(this._directionsContainer) {
            this._directionsContainer.style.bottom = "-50vh";
            this._directionsContainer.innerHTML = "";
        }
        this._clearRouteMarkers();
    }

    /**
     * Sets the direction container to render the directions over
     * it.
     * @param {Element} container - A div, to render the directions
     */
    setDirectionsContainer(container) {
        this._directionsContainer = container;

        if(this._directionsRenderer) {
            this._directionsRenderer.setPanel(this._directionsContainer);
        }
    }

    /**
     * Draws the markers for the first leg of the given route
     * @param {google.maps.DirectionsRoute} route - The route we want to draw
     * @private
     */
    _drawRouteMarkers(route) {
        let leg = route.legs[0];
        if(leg.steps.length < 50) {
            for (let i = 0; i < leg.steps.length; i++) {
                let step = leg.steps[i];
                this._createStepMarker(i, step);
            }
        }
    }

    /**
     * Creates a new step marker
     * @param {int} idx - The index of the step (starting in 0)
     * @param {google.maps.DirectionsStep} step - the step itself
     * @private
     */
    _createStepMarker(idx, step) {
        let marker = new google.maps.Marker({
            map: this._map,
            position: step.start_point,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: 'white',
                fillOpacity: 1,
                strokeColor: '#212121',
                strokeWeight: 1
            },
            zIndex: 10
        });
        let self = this;
        google.maps.event.addListener(marker, 'click', function() {
            self._info.setContent(step.instructions);
            self._info.open(self._map, marker);
        });
        // Don't forget to add it to the route markers!
        this._routeMarkers.push(marker);
    }

    /**
     * Clears all the markers for the displayed route
     * @private
     */
    _clearRouteMarkers() {
        for(let marker of this._routeMarkers) {
            marker.setMap(null);
        }
        this._routeMarkers = [];
    }

    /**
     * Creates the directions renderer
     * @returns {google.maps.DirectionsRenderer}
     * @private
     */
    _newDirectionsRenderer() {
        return new google.maps.DirectionsRenderer({
            panel: this._directionsContainer,
            suppressMarkers: true,
            infoWindow: this._info
        });
    }
}