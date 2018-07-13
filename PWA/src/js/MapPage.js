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
            items = state.items;
        }

        if(items.length === 1) items = items[0]; // Remove array

        /**
         * The list of items to display on the map
         * @type {Item|Item[]}
         * @private
         */
        this._items = items;
        /**
         * Indicates if the items to display are several or just one single item
         * @type {boolean}
         * @private
         */
        this._isSingleItem = (items instanceof Item);
        /**
         * The map, once it is created
         * @type {?google.maps.Map}
         * @private
         */
        this._map = null;
    }

    load(...loadingParams) {
        super.load(loadingParams);
    }

    render(container) {
        super.render(container);

        // We require the Maps Api
        let self = this;
        this.app.requireMapsApi((...x)=>self._mapsApiAvailable(...x));
    }

    _mapsApiAvailable() {
        if(this._isSingleItem) {
            console.log("Not supported yet");
            let mapCenter = {lat: parseFloat(this._items.coordLat), lng: parseFloat(this._items.coordLon)};
            new google.maps.Map(this.app.getContainer(), {
                center: mapCenter,
                zoom: 12
            });
        } else {
            let mapCenter = {lat: parseFloat(this._items[0].coordLat), lng: parseFloat(this._items[0].coordLon)};
            this._map = new google.maps.Map(this.app.getContainer(), {
                center: mapCenter,
                zoom: 12
            });
            let infowindow = new google.maps.InfoWindow({
                content: ""
            });
            let latLons = [];
            for(let item of this._items) {
                let latLng = new google.maps.LatLng(parseFloat(item.coordLat), parseFloat(item.coordLon));
                latLons.push(latLng);

                let marker = new google.maps.Marker({
                    map: this._map,
                    position: latLng,
                    title: item.name,
                    animation: google.maps.Animation.DROP
                });
                marker.addListener('click', function() {
                    infowindow.setContent('<b>'+marker.getTitle().htmlEscape()+'</b>');
                    infowindow.open(this._map, marker);
                });
            }
            let bounds = new google.maps.LatLngBounds();
            for(let latLng of latLons) {
                bounds.extend(latLng);
            }
            this._map.fitBounds(bounds);
        }
    }

    /**
     * Gets the state of the page to save it in the history
     * @return {MapPageState}
     */
    getState() {
        let state = super.getState();
        state.pageClass = MAP_PAGE_CLASS;
        state.items = this._items;
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
 * @property {Item[]|Item} items
 * @property {string} pageClass
 */