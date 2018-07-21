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
 * @type {MapState}
 */
const MAP_STATE_DESTROYED = 3;

const ROUTE_BUTTON_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"map-marked-alt\" class=\"svg-inline--fa fa-map-marked-alt fa-w-18\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><path fill=\"currentColor\" d=\"M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z\"></path></svg>";

/**
 * An interface to hide away the details of the maps system in use
 */
class ItemsMap {
    /**
     * @param {Item[]} items - A list with the items to display
     * @param {ItemsMapListener} [listener] - A listener to the items changes
     * @param {Element} [directionsContainer] - An element to render the directions instructions on
     */
    constructor(items, listener, directionsContainer) {
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
         * Selected item to find the route to
         * @type {?Item}
         * @private
         */
        this._selectedItem = (items.length === 1 ? items[0] : null);
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
         * Route markers, if a route is displayed.
         * @type {google.maps.Marker[]}
         * @private
         */
        this._routeMarkers = [];
        /**
         * A listener for the item updates
         * @type {?ItemsMapListener}
         * @private
         */
        this._listener = (listener?listener:null);
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
     * When the maps api is available, this function is called
     * so we can create the map in the container
     * @param {Element} container
     * @private
     */
    _mapsApiAvailable(container) {
        this._createMap(container);

        for (let item of this._items) {
            this._createItemMarker(item);
        }

        this._directionsState("Nothing selected");
        this._fitAllMarkersInMap();

        if(this._userPosition) {
            this._updateUserMarker();
        }
    }

    /**
     * Sets the map to fit all the markers in the visible space
     * @private
     */
    _fitAllMarkersInMap() {
        if(this._items.length > 1) {
            let bounds = new google.maps.LatLngBounds();
            for (let item of this._items) {
                // this._markers[itemId] returns the marker for the item
                bounds.extend(this._markers[item.itemId].getPosition());
            }
            this._map.fitBounds(bounds);
        }
    }

    /**
     * Creates the real map
     * @param {Element} container
     * @private
     */
    _createMap(container) {
        if(this._noMap()) {
            let mapCenter = {lat: parseFloat(this._items[0].coordLat), lng: parseFloat(this._items[0].coordLon)};
            this._map = new google.maps.Map(container, {
                center: mapCenter,
                zoom: 12 // Adequate to see a city more or less
            });
            this._map.addListener('click', (...x) => this._onMapClicked(...x));

            this._info = new google.maps.InfoWindow();
            this._directionsSvc = new google.maps.DirectionsService();
            this._directionsRenderer = new google.maps.DirectionsRenderer({
                panel: this._directionsContainer,
                suppressMarkers: true,
                infoWindow: this._info
            });

            // The map is now available
            this._state = MAP_STATE_AVAILABLE;
        }
    }

    /**
     * Gets the directions to get to the given item,
     * it requires the position to have been obtained.
     * @private
     */
    _getDirections() {
        if(this._noMap() || !this._userMarker || !this._selectedItem) return;

        let item = this._selectedItem;
        let start = this._userMarker.getPosition();
        let end = new google.maps.LatLng(item.coordLat, item.coordLon);
        let request = {
            origin: start,
            destination: end,
            travelMode: 'WALKING'
        };
        this._directionsState("Loading route...");
        this._directionsSvc.route(request, (...x)=>this._directionsReceived(...x));
    }

    /**
     * When we receive the directions from maps, this function is called
     * @param {google.maps.DirectionsResult} result
     * @param {google.maps.DirectionsStatus} status
     * @private
     */
    _directionsReceived(result, status) {
        if(this._noMap()) return;
        if (status === google.maps.DirectionsStatus.OK) {
            // The renderer adds text, but it does not overwrite
            this._directionsState(null);
            this._directionsRenderer.setMap(this._map);
            this._directionsRenderer.setDirections(result);

            if(result.routes.length > 0) {
                // We pick the first route
                this._directionsRenderer.setRouteIndex(0);
                this._drawRouteMarkers(result.routes[0]);
            }
        } else {
            // TODO: on over query limit throw external maps
            console.log(result, status);
            this._directionsState("Error loading route.");
        }
    }

    /**
     * Draws the markers for the first leg of the given route
     * @param {google.maps.DirectionsRoute} route - The route we want to draw
     * @private
     */
    _drawRouteMarkers(route) {
        let leg = route.legs[0];
        for (let i = 0; i < leg.steps.length; i++) {
            let step = leg.steps[i];
            this._createStepMarker(i, step);
        }
    }

    /**
     * Creates a new marker for the item and saves it
     * @param {Item} item - the item to create the marker for
     * @private
     */
    _createItemMarker(item) {
        if(this._noMap()) return;

        let latLng = new google.maps.LatLng(item.coordLat, item.coordLon);
        let marker = new google.maps.Marker({
            map: this._map,
            position: latLng,
            title: item.name,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', ()=>this._itemMarkerClicked(item));
        this._deleteItemMarker(item.itemId);
        this._markers[item.itemId] = marker;
    }

    /**
     * Function called whenever an item marker is clicked
     * @param {Item} item - The item which the marker was attached to
     * @private
     */
    _itemMarkerClicked(item) {
        let marker = this._markers[item.itemId];
        let content = '<b class="marker-title">'+marker.getTitle().htmlEscape()+'</b>';
        // When there is no selected item, we can select it
        if(this._selectedItem) {
            this._info.setContent(content);
        } else {
            content += `<button class="route-btn">${ROUTE_BUTTON_SVG}</button>`;
            let div = document.createElement('div');
            div.innerHTML = content;
            div.childNodes[1].addEventListener('click', ()=>{
                this._select(item);
                this._info.close();
            });
            this._info.setContent(div);
        }
        this._info.open(this._map, marker);
    }

    /**
     * Hides all the other items and calculates the route to the given one
     * @param {Item} item - The item to preserve and calculate the route towards
     * @private
     */
    _select(item) {
        if(this._selectedItem) {
            console.log("Error: _select, there is a selected item", this._selectedItem);
            return;
        }

        for(let other of this._items) {
            if(other !== item) {
                // Setting map to null hides the marker
                this._markers[other.itemId].setMap(null);
            }
        }

        this._selectedItem = item;
        this._getDirections();

        if(this._listener) {
            this._listener.mapItemPicked(item);
        }
    }

    /**
     * Shows all the item markers
     * @private
     */
    _showAllItemMarkers() {
        if(this._noMap()) {
            throw new Error('Cannot show all item markers because the map is not available');
        }

        for(let item of this._items) {
            this._markers[item.itemId].setMap(this._map);
        }
    }

    /**
     * Deletes the marker associated to the given itemId
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
     * @param {google.maps.DirectionsStep} step - the step itself
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
            this._createUserMarker(latLng);
        }
    }

    /**
     * Creates the user marker if it does not exist
     * @param {google.maps.LatLng} latLng - The position to create the user marker
     * @private
     */
    _createUserMarker(latLng) {
        if(this._userMarker) return;

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

        // Get directions if possible
        this._getDirections();
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

        if(!this._selectedItem) {
            this._directionsState("Nothing selected");
        }

        if(this._directionsRenderer) {
            this._directionsRenderer.setPanel(this._directionsContainer);
        }
    }

    /**
     * Deselects the selected item, deletes the route and shows all the item markers again
     */
    resetToInitialState() {
        this._selectedItem = null;
        if(this._directionsRenderer) {
            this._directionsRenderer.setMap(null);
        }
        this._clearRouteMarkers();
        this._showAllItemMarkers();
        this._directionsState("Nothing selected");
        this._fitAllMarkersInMap();
    }

    /**
     * Writes the given message to the directions container (erasing the content it may have)
     * @param {?string} message - The HTML code of the message or null to set empty
     * @private
     */
    _directionsState(message) {
        if(this._directionsContainer) {
            this._directionsContainer.innerHTML = ( message ? message : "" );
        }
    }
    /**
     * Returns all the added items
     * @return {Item[]}
     */
    getItems() {
        return this._items;
    }

    onDestroy() {
        if(this._directionsRenderer) {
            this._directionsRenderer.setMap(null);
        }
        this._state = MAP_STATE_DESTROYED;
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