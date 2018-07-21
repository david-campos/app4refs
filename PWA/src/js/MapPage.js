/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const MAP_PAGE_CLASS = "MapPage";

/**
 * The MapPage is used to render maps with Google Maps, to obtain a detailed description check
 * the documentation of the project
 */
class MapPage extends Page {
    /**
     * @param {App} app - The app the application is running on
     * @param {string} title - The title to display in the nav
     * @param {Item|Item[]} items - The items to display, it might be only one. In this case, the
     * route to the item will be automatically calculated and displayed.
     * @param {Page} parentPage - A parent page for this one
     * @param {MapPageState} [state] - Saved state of the page to restore from
     */
    constructor(app, title, items, parentPage, state) {
        super(app, parentPage, title, true, state);

        // Restore from state
        if(state) {
            items =  state.items.map((itemObj)=>new Item(itemObj));
        }

        if(items instanceof Item) items = [items]; // Surround by array

        /**
         * The map, once it is created
         * @type {ItemsMap}
         * @private
         */
        this._map = new ItemsMap(items);

        /**
         * The geolocator to track the user
         * @type {Geolocator}
         * @private
         */
        this._geolocator = new Geolocator();
    }

    load(...loadingParams) {
        super.load(loadingParams);
    }

    render(container) {
        super.render(container);

        let mapInstructions = document.createElement('div');
        mapInstructions.setAttribute("class", "map-instructions");
        container.appendChild(mapInstructions);

        let mapContainer = document.createElement('div');
        mapContainer.setAttribute("class", "map-container");
        container.appendChild(mapContainer);

        container.style.padding = "0";

        if(!this._geolocator.isGeolocationAvailable()) {
            mapInstructions.innerHTML = "Geolocation not available";
        }
        this._map.setDirectionsContainer(mapInstructions);
        this._map.load(this.app, mapContainer);
        this._geolocator.start((data)=>this._onUserPositionUpdate(data));
    }

    /**
     * It will be called each time the user position is updated
     * @param {{coords: {latitude: Number, longitude: Number}}} data - New data of the geolocation
     * @private
     */
    _onUserPositionUpdate(data) {
        this._map.placeUserIn(data.coords);
    }

    onHide() {
        super.onHide();
        this._map.onDestroy();
        this._geolocator.stop();
    }

    /**
     * Gets the state of the page to save it in the history
     * @return {MapPageState}
     */
    getState() {
        let state = super.getState();
        state.pageClass = MAP_PAGE_CLASS;
        state.items = [];
        let items = this._map.getItems();
        for(let item of items) {
            state.items.push(item.toObject());
        }
        return state;
    }

    /**
     * Restores the page from a given state
     * @param {App} app
     * @param {MapPageState} state
     * @return {MapPage}
     */
    static fromState(app, state) {
        if(state.pageClass !== MAP_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${MAP_PAGE_CLASS}"`);
        }
        return new MapPage(app, "", null, new HomePage(app), state);
    }
}
/**
 * @typedef {PageState} MapPageState
 * @property {ItemObject[]} items
 * @property {string} pageClass
 */