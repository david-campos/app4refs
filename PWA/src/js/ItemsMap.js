/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * @type {MapState}
 */
const MAP_STATE_NOT_LOADED = 0;
/**
 * @type {MapState}
 */
const MAP_STATE_LOADING = 1;
/**
 * @type {MapState}
 */
const MAP_STATE_AVAILABLE = 2;

/**
 * An interface to hide away the details of the maps system in use
 */
class ItemsMap {
    /**
     * @param {Item[]} items - A list with the items to display
     * @param {Element} [directionsContainer] - An element to render the directions instructions on
     */
    constructor(items, directionsContainer) {
        /**
         * The state of the map
         * @type {MapState}
         */
        this._state = MAP_STATE_NOT_LOADED;
        /**
         * The items to display in this map
         * @type {Item[]}
         * @private
         */
        this._items = items;
        /**
         * The container for the instructions of the directions to display
         * @type {Element}
         */
        this._directionsContainer = directionsContainer;
        /**
         * The real map, once it is created
         * @type {?google.maps.Map}
         * @private
         */
        this._map = null;
        /**
         * The info window, once the map is available
         * @type {?google.maps.InfoWindow}
         * @private
         */
        this._info = null;
        /**
         * The markers the map is displaying, the keys are the item ids
         * @type {{google.maps.Marker}}
         * @private
         */
        this._markers = {};
        /**
         * The position of the user, if known
         * @type {?{latitude: Number, longitude: Number}}
         * @private
         */
        this._userPosition = null;
        /**
         * The user marker, once it is available
         * @type {?google.maps.Marker}
         * @private
         */
        this._userMarker = null;
        /**
         * The directions service, once it is available
         * @type {?google.maps.DirectionsService}
         * @private
         */
        this._directionsSvc = null;
        /**
         * The directions renderer, once it is available
         * @type {?google.maps.DirectionsRenderer}
         * @private
         */
        this._directionsRenderer = null;
        /**
         * Once we get the directions to get to a place, it will contain them
         * @type {?Object}
         * @private
         */
        this._directions = null;
        /**
         * Route markers, if a route is displayed.
         * @type {google.maps.Marker[]}
         * @private
         */
        this._routeMarkers = [];
    }

    /**
     * Requires the maps api and loads the map in the specified container
     * @param {App} app
     * @param {Element} container
     */
    load(app, container) {
        if(this._state === MAP_STATE_NOT_LOADED) {
            this._state = MAP_STATE_LOADING;
            let self = this;
            app.requireMapsApi((...x) => self._mapsApiAvailable(container));
        }
    }

    /**
     * Sets the user representation in the given position
     * @param {{latitude: Number, longitude: Number}} position - The position of the user
     */
    placeUserIn(position) {
        this._userPosition = position;
        if(this._state === MAP_STATE_AVAILABLE) {
            this._updateUserMarker();
        }
    }

    /**
     * Adds a new item to the map
     * @param {Item} item - the new item
     */
    addItem(item) {
        this._items.push(item);
        this._createItemMarker(item);
    }

    /**
     * @param {Element} container
     * @private
     */
    _mapsApiAvailable(container) {
        this._createMap(container);

        let bounds = new google.maps.LatLngBounds();
        for (let item of this._items) {
            bounds.extend(new google.maps.LatLng(item.coordLat, item.coordLon));
            this._createItemMarker(item);
        }

        if(this._userPosition) {
            this._updateUserMarker();
        }

        if(this._items.length !== 1) {
            this._map.fitBounds(bounds);
        }
    }

    /**
     * Creates the real map
     * @param {Element} container
     * @private
     */
    _createMap(container) {
        let mapCenter = {lat: parseFloat(this._items[0].coordLat), lng: parseFloat(this._items[0].coordLon)};
        this._map = new google.maps.Map(container, {
            center: mapCenter,
            zoom: 12
        });
        this._map.addListener('click', (...x)=>this._onMapClicked(...x));
        this._info = new google.maps.InfoWindow();
        this._directionsSvc = new google.maps.DirectionsService();
        console.log(this._directionsContainer);
        let rendererOps = {
            panel: this._directionsContainer,
            suppressMarkers: false, // TODO: draw end marker and set to true
            infoWindow: this._info
        };
        this._directionsRenderer = new google.maps.DirectionsRenderer(rendererOps);
        this._directionsRenderer.setMap(this._map);
        this._state = MAP_STATE_AVAILABLE;
    }

    /**
     * Gets the directions to get to the given item,
     * it requires the position to have been obtained.
     * @param {Item} item
     * @private
     */
    _getDirections(item) {
        if(this._noMap() || !this._userMarker) return;

        let start = this._userMarker.getPosition();
        let end = new google.maps.LatLng(item.coordLat, item.coordLon);
        let request = {
            origin: start,
            destination: end,
            travelMode: 'WALKING'
        };
        let self = this;
        this._directionsSvc.route(request, function(result, status) {
            if (status == 'OK') {
                self._directions = result;
                self._directionsRenderer.setDirections(result);

                self._clearRouteMarkers();
                let myRoute = result.routes[0].legs[0];
                for (let i=0; i < myRoute.steps.length; i++) {
                    let step = myRoute.steps[i];
                    self._createStepMarker(i, step);
                }
            }
        });
    }

    /**
     * Creates a new marker for the item and saves it
     * @param {Item} item - the item to create the marker for
     * @private
     */
    _createItemMarker(item) {
        if(this._noMap()) return;
        let self = this;
        let latLng = new google.maps.LatLng(item.coordLat, item.coordLon);
        let marker = new google.maps.Marker({
            map: this._map,
            position: latLng,
            title: item.name,
            animation: google.maps.Animation.DROP
        });
        marker.addListener('click', function() {
            self._info.setContent('<b>'+marker.getTitle().htmlEscape()+'</b>');
            self._info.open(self._map, marker);
        });
        this._deleteItemMarker(item.itemId);
        this._markers[item.itemId] = marker;
    }

    /**
     * Deletes the market associated to this itemId
     * @param {string|int} itemId
     * @private
     */
    _deleteItemMarker(itemId) {
        if(this._markers[itemId]) {
            this._markers[itemId].setMap(null);
            delete this._markers[itemId];
        }
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
     * Creates a new step marker
     * @param {int} idx - The index of the step (starting in 0)
     * @param {google.maps.DirectionsStep} step
     * @private
     */
    _createStepMarker(idx, step) {
        if(this._noMap()) return;

        let marker = new google.maps.Marker({
            map: this._map,
            position: step.start_point,
            icon: {
                url: ResourcesProvider.getMapsSpritesheetUrl(),
                origin: new google.maps.Point(14, 0),
                size: new google.maps.Size(14, 14),
                anchor: new google.maps.Point(7, 7),
                scaledSize: new google.maps.Size(28, 28),
            },
            label: idx
        });
        let self = this;
        google.maps.event.addListener(marker, 'click', function() {
            self._info.setContent(step.instructions);
            self._info.open(self._map, marker);
        });
        this._routeMarkers.push(marker);
    }

    /**
     * Sets the user position to the given LatLng
     * @private
     */
    _updateUserMarker() {
        if(this._noMap()) return;

        let latLng = new google.maps.LatLng(this._userPosition.latitude, this._userPosition.longitude);

        if(this._userMarker) {
            this._userMarker.setPosition(latLng);
        } else {
            this._userMarker = new google.maps.Marker({
                map: this._map,
                position: latLng,
                clickable: false,
                icon: {
                    url: ResourcesProvider.getMapsSpritesheetUrl(),
                    origin: new google.maps.Point(0, 0),
                    size: new google.maps.Size(20, 20),
                    anchor: new google.maps.Point(10, 10),
                    scaledSize: new google.maps.Size(40, 40),
                },
                shadow: null,
                zIndex: 999
            });

            // Get directions if there is only one item
            if(this._items.length === 1 && !this._directions) {
                this._getDirections(this._items[0]);
            }
        }
    }

    /**
     * Callback to throw when the map is clicked
     * @private
     */
    _onMapClicked() {
        if(this._directionsContainer.style.top !== "50vh") {
            this._directionsContainer.scrollTop = 0;
            this._directionsContainer.style.top = "50vh";
        } else {
            this._directionsContainer.style.top = "100vh";
        }
    }

    /**
     * Sets the directions container
     * @param {Element} container
     */
    setDirectionsContainer(container) {
        this._directionsContainer = container;
        if(this._directionsRenderer) {
            this._directionsRenderer.setPanel(this._directionsContainer);
        }
    }

    /**
     * Checks the current state of the map
     * @return {MapState}
     */
    getMapState() {
        return this._state;
    }

    /**
     * Returns all the added items
     * @return {Item[]}
     */
    getItems() {
        return this._items;
    }

    /**
     * Returns true if the map is not available yet
     * @return {boolean} - True if the map is not available yet
     * @private
     */
    _noMap() {
        return this._state !== MAP_STATE_AVAILABLE;
    }
}
/**
 * @typedef {int} MapState
 */