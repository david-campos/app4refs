/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const MAP_PAGE_CLASS = "MapPage";

const MAP_MARKER_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"map-marker-alt\" class=\"fa-map-marker-alt\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><path fill=\"currentColor\" d=\"M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z\"></path></svg>";
const MAP_BAN_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"ban\" class=\"fa-ban\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z\"></path></svg>";

/**
 * The MapPage is used to render maps with Google Maps, to obtain a detailed description check
 * the documentation of the project
 * @implements {ItemsMapListener}
 */
class MapPage extends Page {
    /**
     * @param {Category} category - Used for the hash, so we are able to find this again, and to set the title
     * @param {Item|Item[]} items - The items to display, it might be only one. In this case, the
     * route to the item will be automatically calculated and displayed.
     * @param {MapPageState} [state] - Saved state of the page to restore from
     */
    constructor(category, items, state) {
        category = state ? state.category : category;

        super(category.name, true, state);

        /**
         * The reference category we can use for the hash
         * @type {Category}
         * @private
         */
        this._category = category;

        // Restore from state
        if(state) {
            items =  state.items.map((itemObj)=>new Item(itemObj));
        }

        if(items instanceof Item) items = [items]; // Surround by array

        // Filter invalid coordinates
        items = items.filter((item)=>item.canBeShownInMap());

        /**
         * The map, once it is created
         * @type {ItemsMap}
         * @private
         */
        this._map = new ItemsMap(items, this);
        /**
         * Icon displayed when geolocation is not available
         * @type {?Element}
         * @private
         */
        this._geolocationErrorIcon = null;
        /**
         * The panel to display the directions,
         * when created.
         * @type {?DirectionsPanel}
         * @private
         */
        this._directionsPanel = null;
    }

    render(container) {
        super.render(container);

        this._geolocationErrorIcon = document.createElement('div');
        this._geolocationErrorIcon.setAttribute("class", "map-geolocation-error");
        this._geolocationErrorIcon.innerHTML = MAP_MARKER_SVG + MAP_BAN_SVG;
        container.appendChild(this._geolocationErrorIcon);

        let mapInstructions = document.createElement('div');
        mapInstructions.setAttribute("class", "map-instructions");
        container.appendChild(mapInstructions);
        this._directionsPanel = new DirectionsPanel(mapInstructions);

        let mapContainer = document.createElement('div');
        mapContainer.setAttribute("class", "map-container");
        container.appendChild(mapContainer);

        container.style.padding = "0";

        this._map.load(mapContainer);
        this._map.setDirectionsPanel(this._directionsPanel);
        this._map.setGeolocationErrorIcon(this._geolocationErrorIcon);
    }

    onHide() {
        super.onHide();
        this._map.onDestroy();
    }

    /**
     * Resets the map to the initial state if existent.
     */
    resetMap() {
        if(this._map) {
            this._map.resetToInitialState();
        }
    }

    /**
     * Called by the ItemsMap when an item is picked,
     * it causes a fake navigation to the map with only
     * that item.
     * @param {Item} item - The picked item
     */
    mapItemPicked(item) {
        this.app.fakeNavigation(this._generateState([item]), this.title);
    }

    /**
     * Called by ItemMap when the map is clicked
     */
    mapClicked() {
        if(this._directionsPanel) {
            this._directionsPanel.toggle();
        }
    }

    /**
     * Gets the state of the page to save it in the history
     * @return {MapPageState}
     */
    getState() {
        return this._generateState(this._map.getItems());
    }

    /**
     * Generates the state for the passed items
     * @param {Item[]} items - The items to generate the state for
     * @private
     */
    _generateState(items) {
        let state = super.getState();
        state.pageClass = MAP_PAGE_CLASS;
        state.items = [];
        for (let item of items) {
            state.items.push(item.toObject());
        }
        state.category = this._category;

        let iT = this._category.itemType;
        let code = this._category.code;
        let itemId = (state.items.length > 1 ? 'all' : (state.items.length > 0 ? state.items[0].itemId :'all'));
        state.hash = `${iT},${code},${itemId}`;
        return state;
    }

    static navigateFromHash(hash) {
        let svc = new ApiService();
        let matchs = /^([0-9a-z_\-]+),([0-9a-z_\-]+),(all|[0-9]+)$/i.exec(hash);
        if(matchs) {
            let itemType = matchs[1];
            let categoryCode = matchs[2];
            let itemId = parseInt(matchs[3]);
            // Search for the category on the API
            svc.getCategories(itemType, (cats) => {
                let category = cats[categoryCode];
                // Search for the items for the category
                svc.getItems(categoryCode, (items)=>{
                    let list = items;
                    // Display all or just one?
                    if(itemId !== 'all') {
                        for(let it of items) {
                            if(it.itemId === itemId) {
                                list = [it];
                                break;
                            }
                        }
                    }
                    // Navigate if we got here :)
                    App.getInstance().navigateToPage(new MapPage(category, list));
                });
            });
        } else {
            console.error("Invalid hash for MapPage");
        }
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
        return new MapPage(undefined, null, state);
    }
}
/**
 * @typedef {PageState} MapPageState
 * @property {ItemObject[]} items
 * @property {Category} category
 */