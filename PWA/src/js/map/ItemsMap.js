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
     * @param {ItemsMapListener} [listener] - A listener to the map changes
     */
    constructor(items, listener) {
        /**
         * The state of the map
         * @type {MapState}
         * @private
         */
        this._state = MAP_STATE_NOT_LOADED;
        /**
         * Items manager which will manage the items for us
         * @type {MapItemsManager}
         * @private
         */
        this._itemsManager = new MapItemsManager(items, (item)=>this._selectedItem(item));
        /**
         * User tracker to track the user position and draw it
         * on the map
         * @type {UserTracker}
         * @private
         */
        this._userTracker = new UserTracker();
        /**
         * The directions service object
         * @type {DirectionsManager}
         * @private
         */
        this._directionsManager = new DirectionsManager(this);
        /**
         * The current navigation guide, if one is active.
         * @type {?RouteGuide}
         * @private
         */
        this._currentGuide = null;
        /**
         * A listener for the map changes
         * @type {ItemsMapListener}
         * @private
         */
        this._listener = listener;

        this._userTracker.registerChangeListener(
            (available)=>this._locationAvailabilityChange(available));
    }

    /**
     * Requires the maps api so when it is loaded
     * the map will be created in the specified container.
     * @param {Element} container - The container to draw the map on
     */
    load(container) {
        this._userTracker.startTracking();
        if(this._state === MAP_STATE_NOT_LOADED) {
            this._state = MAP_STATE_LOADING;
            let self = this;
            App.getInstance().requireMapsApi((...x) => self._createMap(container));
        }
    }

    /**
     * Called when an item is selected, it simply
     * tries to get the route for the item.
     * @param {Item} item - the item to get the route for
     * @private
     */
    _selectedItem(item) {
        this.tryToShowRoute();

        if(this._listener) {
            this._listener.mapItemPicked(item);
        }
    }

    /**
     * When the maps api is available, this function is called
     * so we can create the map in the container.
     * It sets the map to all the managers too.
     * This function shouldn't be called until the maps API is available.
     * @param {Element} container - The container to draw the map into
     * @private
     */
    _createMap(container) {
        if(this._noMap()) {
            let mapCenter = {lat: 0, lng: 0};
            let map = new google.maps.Map(container, {
                center: mapCenter,
                gestureHandling: 'greedy', // so it is moved with one finger
                zoom: 12 // items manager will change it, anyways
            });
            let info = new google.maps.InfoWindow();

            this._userTracker.setMap(map);
            this._directionsManager.setMap(map, info);
            this._itemsManager.setMap(map, info);

            this.tryToShowRoute();

            // Listen to map clicks
            map.addListener('click', (...x) => this._onMapClicked(...x));
            // The map is now available
            this._state = MAP_STATE_AVAILABLE;
        }
    }

    /**
     * Callback to throw when the map is clicked
     * @private
     */
    _onMapClicked() {
        if(this._listener) {
            this._listener.mapClicked();
        }
    }

    /**
     * Called when the availability of the user location changes.
     * It causes the items manager to show or hide the route button
     * on the items information windows.
     * @param {boolean} available - The new availability of the user location
     * @private
     */
    _locationAvailabilityChange(available) {
        if(available) {
            this._itemsManager.showRouteButtonOnInfo();
            this.tryToShowRoute();
        } else this._itemsManager.hideRouteButtonOnInfo();
    }

    /**
     * Tries to show a route to the selected item,
     * it will happen only if there is a selected item
     * and a user position.
     */
    tryToShowRoute() {
        if(this._userTracker.isUserPositionAvailable()
            && this._itemsManager.isThereAnySelectedItem()) {

            if(this._currentGuide) {
                this._currentGuide.finish();
                this._currentGuide = null;
            }

            let userPos = this._userTracker.getUserPosition();
            let item = this._itemsManager.getSelectedItem();
            this._directionsManager.getDirections(
                userPos.latitude, userPos.longitude,
                item.coordLat, item.coordLon);
        }
    }

    /**
     * Starts the navigation guide (if it is possible)
     */
    startNavigationGuide() {
        if(!this._currentGuide && this._directionsManager.hasRoute()) {
            this._currentGuide = new RouteGuide(
                this._userTracker,
                this._directionsManager.getRoute());
            this._currentGuide.start();
        }
    }

    /**
     * Sets the directions panel.
     * It simply delegates in the directions manager
     * @see {DirectionsManager#setDirectionsPanel}
     * @param {DirectionsPanel} panel
     */
    setDirectionsPanel(panel) {
        this._directionsManager.setDirectionsPanel(panel);
        panel.setNavigationStartCallback(()=>this.startNavigationGuide());
    }

    /**
     * Sets the geolocation error icon to display
     * when an error with the geolocation occurs.
     * It simply delegates into the UserTracker.
     * @see {UserTracker#setGeolocationErrorIcon}
     * @param {Element} icon - The element which works as icon
     */
    setGeolocationErrorIcon(icon) {
        this._userTracker.setGeolocationErrorIcon(icon);
    }

    /**
     * Deselects the selected item, deletes the route and shows all the item markers again
     */
    resetToInitialState() {
        this._itemsManager.reset();
        this._directionsManager.reset();
        if(this._currentGuide) {
            this._currentGuide.finish();
            this._currentGuide = null;
        }
    }

    /**
     * Returns all the added items. It simply
     * delegates into the items manager.
     * @see {MapItemsManager#getItems}
     * @return {Item[]}
     */
    getItems() {
        return this._itemsManager.getItems();
    }

    /**
     * Called when destroying the ItemsMap by the MapPage
     */
    onDestroy() {
        this._userTracker.stopTracking();
        if(this._currentGuide) {
            this._currentGuide.finish();
            this._currentGuide = null;
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