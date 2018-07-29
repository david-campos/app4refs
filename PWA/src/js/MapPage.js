/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const MAP_PAGE_CLASS = "MapPage";

/**
 * The MapPage is used to render maps with Google Maps, to obtain a detailed description check
 * the documentation of the project
 * @implements {ItemsMapListener}
 */
class MapPage extends Page {
    /**
     * @param {string} title - The title to display in the nav
     * @param {Item|Item[]} items - The items to display, it might be only one. In this case, the
     * route to the item will be automatically calculated and displayed.
     * @param {MapPageState} [state] - Saved state of the page to restore from
     */
    constructor(title, items, state) {
        super(title, true, state);

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
        this._map = new ItemsMap(items, this);

        /**
         * The geolocator to track the user
         * @type {Geolocator}
         * @private
         */
        this._geolocator = new Geolocator();

        /**
         * The element to contain the map instructions
         * @type {?Element}
         * @private
         */
        this._mapInstructions = null;
    }

    render(container) {
        super.render(container);

        this._mapInstructions = document.createElement('div');
        this._mapInstructions.setAttribute("class", "map-instructions");
        container.appendChild(this._mapInstructions);

        let mapContainer = document.createElement('div');
        mapContainer.setAttribute("class", "map-container");
        container.appendChild(mapContainer);

        container.style.padding = "0";

        this._map.setDirectionsContainer(this._mapInstructions);
        this._map.load(mapContainer);
        this._geolocator.start((data)=>this._onUserPositionUpdate(data));
    }

    onHide() {
        super.onHide();
        this._map.onDestroy();
        this._geolocator.stop();
    }

    /**
     * Resets the map to the initial state if existent.
     */
    resetMap() {
        if(this._map) {
            this._map.resetToInitialState();
            if(this._mapInstructions) {
                this._mapInstructions.style.bottom = "-50vh";
            }
        }
    }

    /**
     * It will be called each time the user position is updated
     * @param {Position} data - New data of the geolocation
     * @private
     */
    _onUserPositionUpdate(data) {
        this._map.placeUserIn(data.coords);
    }

    /**
     * Called by the ItemsMap when an item is picked
     * @param {Item} item - The picked item
     */
    mapItemPicked(item) {
        let state = this.getState();
        state.items = [item.toObject()];
        this.app.fakeNavigation(state, this.title);
    }

    mapClicked() {
        console.log(this._map.areThereDirections());
        if(this._mapInstructions && this._map && this._map.areThereDirections()) {
            if (parseInt(this._mapInstructions.style.bottom) !== 0) {
                this._mapInstructions.scrollTop = 0;
                this._mapInstructions.style.bottom = "0";
            } else {
                this._mapInstructions.style.bottom = "-50vh";
            }
        }
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
     * @param {MapPageState} state
     * @return {?MapPage} - The map page to navigate to or maybe null if it was
     * already the current page and it could be solved with a navigation.
     */
    static fromState(state) {
        if(state.pageClass !== MAP_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${MAP_PAGE_CLASS}"`);
        }
        let currentPage = App.getInstance().getCurrentPage();
        if(currentPage instanceof MapPage) {
            let currentItemsIds = currentPage.getState().items.map((item)=>item.itemId);
            let stateItemIds = state.items.map((item)=>item.itemId);

            if(currentItemsIds.hasSameNumbers(stateItemIds)) {
                currentPage.resetMap();
                return null;
            }
        }
        return new MapPage("", null, state);
    }
}
/**
 * @typedef {PageState} MapPageState
 * @property {ItemObject[]} items
 */