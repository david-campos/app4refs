/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const OPEN_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"door-open\" class=\"svg-inline--fa fa-door-open fa-w-20\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 512\"><path fill=\"currentColor\" d=\"M624 448h-80V113.45C544 86.19 522.47 64 496 64H384v64h96v384h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM312.24 1.01l-192 49.74C105.99 54.44 96 67.7 96 82.92V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h336V33.18c0-21.58-19.56-37.41-39.76-32.17zM264 288c-13.25 0-24-14.33-24-32s10.75-32 24-32 24 14.33 24 32-10.75 32-24 32z\"></path></svg>";
const CLOSED_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"door-closed\" class=\"svg-inline--fa fa-door-closed fa-w-20\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 512\"><path fill=\"currentColor\" d=\"M624 448H512V50.8C512 22.78 490.47 0 464 0H175.99c-26.47 0-48 22.78-48 50.8V448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h608c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM415.99 288c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32c.01 17.67-14.32 32-32 32z\"></path></svg>";

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
            label: {
                color: item.isOpenNow()?'white':'black',
                fontWeight: "bold",
                text: item.name[0]
            },
            animation: google.maps.Animation.DROP
        });

        marker.addListener('click', ()=>this._itemMarkerClicked(item));
        this.deleteItemMarker(item.itemId);
        this._markers.set(item.itemId, marker);
    }

    /**
     * Hides the marker associated to the given item Id,
     * but it does not del it from memory.
     * @param {int} itemId - The id which identifies the item used
     *             to create the marker.
     */
    hideItemMarker(itemId) {
        this._markers.get(itemId).setMap(null);
    }

    /**
     * Deletes the marker associated to the given itemId
     * @param {int} itemId - The id of the item whose associated marker
     *             we wan to del.
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
            this._map.setZoom(14); // Nice to see the city
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

            let open = this._infoItem.isOpenNow();
            let theClass = (this._infoItem.callForAppointment ? "cfa" : (open ? "open" : "closed"));
            let theText = (this._infoItem.callForAppointment ? PHONE_SVG : (open ? OPEN_SVG : CLOSED_SVG));

            content += `<div class="marker-icon"><img src="${ResourcesProvider.getItemIconUrl(this._infoItem)}"></div>`;

            content += `<div class="marker-cost-and-lang">`
                + ListPage.costAndLangHtmlFor(this._infoItem)
                + `<div class="marker-open ${theClass}">${theText}</div>`
                + `</div>`;


            if (this._showRouteButton) {
                content += `<div class="marker-btns">`;
                content += `<button class="route-btn">${ROUTE_BUTTON_SVG}</button>`;
                //content += `<button class="route-btn google">${GOOGLE_BUTTON_SVG}</button>`;
                content += `</div>`;
            }

            let div = document.createElement('div');
            div.setAttribute("data-item-info", "true");
            div.classList.add("info-div");
            div.innerHTML = content;

            if(this._showRouteButton) {
                /*let self = this;
                div.childNodes[3].childNodes[0].addEventListener('click', () => {
                    self._itemSelected(this._infoItem);
                    self._info.close();
                });*/
                div.childNodes[3].childNodes[0].addEventListener('click', () => {
                    let link = ResourcesProvider.getExternalDirectionsUrl(this._infoItem);
                    window.open(link, "_blank");
                });
            }

            this._info.setContent(div);
        }
    }
}
/**
 * @callback ItemSelectedCallback
 * @param {Item} item - The item which has been selected
 */