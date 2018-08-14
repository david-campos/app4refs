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
         * The panel which displays the directions and travel types
         * @type {?DirectionsPanel}
         * @private
         */
        this._directionsPanel = null;
        /**
         * The polyline which highlights the currently highlited step
         * @type {?google.maps.Polyline}
         * @private
         */
        this._highlightedStep = null;
    }

    /**
     * Draws a result obtained from the API in the map.
     * @param {google.maps.DirectionsResult} result - The result obtained from the API
     */
    draw(result) {
        this.clear();

        this._directionsRenderer.setMap(this._map);
        this._directionsRenderer.setDirections(result);

        if(result.routes.length > 0) {
            // We pick the first route
            this._directionsRenderer.setRouteIndex(0);
            this._drawRouteMarkers(result.routes[0]);
        }

        this._directionsPanel.showGuideButton();
    }

    /**
     * Clears the displayed route from the map
     */
    clear() {
        this._directionsRenderer.setMap(null);
        if(this._directionsPanel) {
            this._directionsPanel.clear();
            this._directionsPanel.hide();
        }
        this._clearRouteMarkers();
    }

    /**
     * Sets the directions panel and associates the directions render to its
     * instructions container.
     * @param {DirectionsPanel} panel
     */
    setDirectionsPanel(panel) {
        this._directionsPanel = panel;
        this._directionsRenderer.setPanel(
            this._directionsPanel.getInstructionsContainer());
    }

    /**
     * Displays the given travel mode as the selected one.
     * It delegates into the homonim method of DirectionsPanel,
     * so it has no effect if there is no panel associated.
     * @see {DirectionsPanel#selectedTravelMode}
     * @param {TravelMode} travelMode
     */
    selectedTravelMode(travelMode) {
        if(this._directionsPanel) {
            this._directionsPanel.selectedTravelMode(travelMode);
        }
    }

    /**
     * The currently displayed route, or null if no route is displayed
     * @return {?google.maps.DirectionsRoute}
     */
    getRoute() {
        if(!this._directionsRenderer.getMap())
            return null; // When no map assigned, no route is displayed :)

        let dirs = this._directionsRenderer.getDirections();
        if(dirs) {
            return dirs.routes[this._directionsRenderer.getRouteIndex()];
        } else {
            return null;
        }
    }

    /**
     * Highlights the given step, hiding away
     * the previous one.
     * @param {Number} idx - The index of the step, used to highlight the indications
     * @param {google.maps.DirectionsStep} step - The step
     */
    highlightStep(idx, step) {
        this.clearHighlightedStep();
        this._highlightedStep = new google.maps.Polyline({
            path: step.path,
            geodesic: true,
            strokeColor: '#7C0D82',
            strokeOpacity: 0.7,
            strokeWeight: 6,
            zIndex: 2
        });
        this._highlightedStep.setMap(this._map);

        if(this._directionsPanel) {
            this._directionsPanel.highlightStep(idx);
        }
    }

    clearHighlightedStep() {
        if(this._highlightedStep) {
            this._highlightedStep.setMap(null);
            this._directionsPanel.clearHighlightedSteps();
            this._highlightedStep = null;
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
            suppressMarkers: true,
            infoWindow: this._info
        });
    }
}