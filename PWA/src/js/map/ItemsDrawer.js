/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class provides methods to draw the items over the Map from Google Maps.
 */
class ItemsDrawer {
    /**
     * @param {google.maps.Map} map - The map
     * @param {google.maps.InfoWindow} info - The information window
     *          to display the items descriptions and other information
     * @param {ItemSelectedCallback} itemSelected - The callback to be called
     *          when an item is selected to show the route.
     */
    constructor(map, info, itemSelected) {
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
         * The item whose information is being shown
         * in the information window, so we can recreate
         * the click listener for the route button whenever we want.
         * @type {?Item}
         * @private
         */
        this._infoItem = null;
        /**
         * The callback to be called when an item is selected to show
         * the route.
         * @type {ItemSelectedCallback}
         * @private
         */
        this._itemSelected = itemSelected;
        /**
         * The markers the map is displaying, the keys are the item ids
         * @type {Map<int, google.maps.Marker>}
         * @private
         */
        this._markers = new Map();
        /**
         * Indicates whether we should show or not the route button
         * @type {boolean}
         * @private
         */
        this._showRouteButton = true;

        // When closed the info window, we want it to reset our infoItem to null
        this._info.addListener("closeclick", ()=>this._infoItem = null);
    }

    /**
     * Creates a new marker for the item and saves it
     * @param {Item} item - the item to create the marker for
     */
    createItemMarker(item) {
        let latLng = new google.maps.LatLng(item.coordLat, item.coordLon);
        let marker = new google.maps.Marker({
            map: this._map,
            position: latLng,
            title: item.name,
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', ()=>this._itemMarkerClicked(item));
        this.deleteItemMarker(item.itemId);
        this._markers.set(item.itemId, marker);
    }

    /**
     * Hides the marker associated to the given item Id,
     * but it does not delete it from memory.
     * @param {int} itemId - The id which identifies the item used
     *             to create the marker.
     */
    hideItemMarker(itemId) {
        this._markers.get(itemId).setMap(null);
    }

    /**
     * Deletes the marker associated to the given itemId
     * @param {int} itemId - The id of the item whose associated marker
     *             we wan to delete.
     */
    deleteItemMarker(itemId) {
        if(this._markers.has(itemId)) {
            this._markers.get(itemId).setMap(null);
            this._markers.delete(itemId);
        }
    }

    /**
     * Shows all the item markers
     */
    showAllItemMarkers() {
        for(let marker of this._markers.values()) {
            marker.setMap(this._map);
        }
    }

    /**
     * Sets the map to fit all the markers in the visible space
     */
    fitAllMarkersInMap() {
        if(this._markers.size > 1) {
            let bounds = new google.maps.LatLngBounds();
            for (let marker of this._markers.values()) {
                bounds.extend(marker.getPosition());
            }
            this._map.fitBounds(bounds);
        } else if(this._markers.size === 1) {
            this._map.setCenter(this._markers.values().next().value.getPosition());
            this._map.setZoom(12); // Nice to see the city
        }
    }

    /**
     * Shows the route button on the info window of the items.
     * It works over the already displayed one, too.
     */
    showRouteButtonOnInfo() {
        this._showRouteButton = true;
        this._generateInfoContent();
    }

    /**
     * Hides the route button on the info window of the items.
     * It works over the already displayed one, too.
     */
    hideRouteButtonOnInfo() {
        this._showRouteButton = false;
        this._generateInfoContent();
    }

    /**
     * Function called whenever an item marker is clicked,
     * we shall show the info window with the name of the item
     * and, if it is possible to get the route, the route button.
     * @param {Item} item - The item which the marker was attached to
     * @private
     */
    _itemMarkerClicked(item) {
        this._infoItem = item;
        this._generateInfoContent();
        let marker = this._markers.get(item.itemId);
        this._info.open(this._map, marker);
    }

    /**
     * Generates the content for the info window based
     * for this._infoItem
     * @private
     */
    _generateInfoContent() {
        if(this._infoItem) {
            let content = '<b class="marker-title">' + this._infoItem.name.htmlEscape() + '</b>';

            if (!this._showRouteButton) {
                this._info.setContent(content);
            } else {
                content += `<button class="route-btn">${ROUTE_BUTTON_SVG}</button>`;
                let div = document.createElement('div');
                div.setAttribute("data-item-info", "true");
                div.innerHTML = content;
                let self = this;
                div.childNodes[1].addEventListener('click', () => {
                    self._itemSelected(this._infoItem);
                    self._info.close();
                });
                this._info.setContent(div);
            }
        }
    }
}
/**
 * @callback ItemSelectedCallback
 * @param {Item} item - The item which has been selected
 */