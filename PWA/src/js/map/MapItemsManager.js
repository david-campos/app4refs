/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class manages the items displayed on the map and tracks
 * the selected one.
 */
class MapItemsManager {
    /**
     * @param {Item[]} items - A list with the items to display
     * @param {ItemSelectedCallback} [onItemSelected] - A callback to call when an item is selected
     */
    constructor(items, onItemSelected) {
        /**
         * The items to display in the map
         * @type {Item[]}
         * @private
         */
        this._items = items;
        /**
         * Selected item to find the route to, or null
         * if no item is selected.
         * @type {?Item}
         * @private
         */
        this._selectedItem = (items.length === 1 ? items[0] : null);
        /**
         * A callback for when an item is picked
         * @type {ItemSelectedCallback}
         * @private
         */
        this._itemSelectedCallback = onItemSelected;
        /**
         * The object to paint over the map,
         * once it is available
         * @type {?ItemsDrawer}
         * @private
         */
        this._itemsDrawer = null;
    }

    /**
     * Sets the map for the manager to be
     * able to paint the items.
     * @param {google.maps.Map} map - The map
     * @param {google.maps.InfoWindow} info - The information window to put the pop-ups
     */
    setMap(map, info) {
        this._itemsDrawer = new ItemsDrawer(map, info, (item)=>this.select(item));

        // Pain the items on it
        for (let item of this._items) {
            this._itemsDrawer.createItemMarker(item);
        }

        // Fit them in the map
        this._itemsDrawer.fitAllMarkersInMap();

        if(this.isThereAnySelectedItem()) {
            this._itemsDrawer.hideRouteButtonOnInfo();
        }
    }

    /**
     * Resets the items manager to its initial state,
     * notice all the items will be displayed again.
     */
    reset() {
        this._selectedItem = (this._items.length === 1 ? this._items[0] : null);
        this._itemsDrawer.showRouteButtonOnInfo();
        this._itemsDrawer.showAllItemMarkers();
        this._itemsDrawer.fitAllMarkersInMap();
    }

    /**
     * Shows the route button on the info window of the items.
     * It works over the already displayed one, too.
     * It simply delegates into ItemsDrawer, it has no effect
     * if the item drawer has not been created (it is created
     * when calling to setMap).
     * @see {ItemsDrawer#showRouteButtonOnInfo}
     */
    showRouteButtonOnInfo() {
        if(this._itemsDrawer && !this._selectedItem) {
            this._itemsDrawer.showRouteButtonOnInfo();
        }
    }

    /**
     * Hides the route button on the info window of the items.
     * It works over the already displayed one, too.
     * It simply delegates into ItemsDrawer, it has no effect
     * if the item drawer has not been created (it is created
     * when calling to setMap).
     * @see {ItemsDrawer#hideRouteButtonOnInfo}
     */
    hideRouteButtonOnInfo() {
        if(this._itemsDrawer) {
            this._itemsDrawer.hideRouteButtonOnInfo();
        }
    }

    /**
     * Hides all the other items and calculates the route to the given one
     * @param {Item} item - The item to preserve and calculate the route towards
     * @private
     */
    select(item) {
        if(this.isThereAnySelectedItem()) {
            console.error("There is a selected item.", this._selectedItem);
            return;
        }

        for(let other of this._items) {
            if(other !== item) {
                this._itemsDrawer.hideItemMarker(other.itemId);
            }
        }

        this._selectedItem = item;
        this._itemsDrawer.hideRouteButtonOnInfo();

        this._itemSelectedCallback(item);
    }

    /**
     * Returns all the added items. It simply
     * delegates into the items manager.
     * @see {MapItemsManager#getItems}
     * @return {Item[]}
     */
    getItems() {
        return this._items;
    }

    /**
     * Returns the currently-selected item
     * @return {?Item}
     */
    getSelectedItem() {
        return this._selectedItem;
    }

    /**
     * Checks if it already exists a selected item
     * or no items have been selected yet.
     */
    isThereAnySelectedItem() {
        return !!this._selectedItem;
    }
}
