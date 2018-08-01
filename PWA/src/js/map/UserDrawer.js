/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class provides methods to draw the user position over the Map from Google Maps.
 */
class UserDrawer {
    /**
     * @param {google.maps.Map} map - The map
     * @param {?Coordinates} initialPosition - The initial position for the user
     */
    constructor(map, initialPosition) {
        /**
         * The real map, once it is created
         * @type {google.maps.Map}
         * @private
         */
        this._map = map;
        /**
         * Indicates whether the created icon for the user is the
         * directed one or not.
         * @type {boolean}
         * @private
         */
        this._directedIcon = false;
        /**
         * The user marker, once the map is available
         * @type {google.maps.Marker}
         * @private
         */
        this._userMarker = this._newUserMarker(initialPosition);
        /**
         * Determines if the geolocation error is shown or not right now
         * @type {boolean}
         * @private
         */
        this._geolocationErrorShown = false;
        /**
         * Icon displayed when geolocation is not available
         * @type {?Element}
         * @private
         */
        this._geolocationErrorIcon = null;
    }

    /**
     * Sets the geolocation error icon to display
     * when an error with the geolocation occurs.
     * @param {Element} icon - The element which works as icon
     */
    setGeolocationErrorIcon(icon) {
        this._geolocationErrorIcon = icon;
        // Update in case it was set to be shown already!
        this.showGeolocationError(this._geolocationErrorShown);
    }

    /**
     * Shows or hides the geolocation error depending on the passed value
     * @param {boolean} show - If true the geolocation error icon is shown, if false it is not
     */
    showGeolocationError(show) {
        let wasShown = this._geolocationErrorShown;
        this._geolocationErrorShown = show;

        if(this._geolocationErrorIcon) {
            if(!show && wasShown){
                this._geolocationErrorIcon.classList.remove('show');
            }else if(show && !wasShown) {
                this._geolocationErrorIcon.classList.add('show');
            }
        }
    }

    /**
     * Sets the user position to the position in userPosition
     * @param {?Coordinates} userPosition - The new user position, or null if unknown.
     * @param {?number} userHeading - The angle (in degrees, anti-clockwise) from the North the user is looking at.
     */
    updateUserMarker(userPosition, userHeading) {
        if(!userPosition) {
            if(this._userMarker) {
                this._userMarker.setMap(null);
            }
        } else {
            let latLng = new google.maps.LatLng(
                userPosition.latitude,userPosition.longitude);

            this._userMarker.setPosition(latLng);
            // Depending if it has a valid heading or not, we display
            // the icon with direction or the non directed one
            if (userPosition.heading !== null && !isNaN(userPosition.heading)) {
                this._userMarkerTowards(userPosition.heading);
            } else if(userHeading !== null && !isNaN(userHeading)) {
                this._userMarkerTowards(userHeading);
            } else {
                this._userMarkerNoDir();
            }

            if(!this._userMarker.getMap()) {
                this._userMarker.setMap(this._map);
            }
        }
    }

    /**
     * Creates the user marker
     * @param {?Coordinates} initialPosition - If given,
     *          the starting position for the marker
     * @return {google.maps.Marker}
     * @private
     */
    _newUserMarker(initialPosition) {
        let lon, lat;

        if(initialPosition) {
            lon = initialPosition.longitude;
            lat = initialPosition.latitude;
        } else {
            lon = lat = 0;
        }

        return new google.maps.Marker({
            map: this._map,
            position: new google.maps.LatLng(lat, lon),
            clickable: false,
            icon: UserDrawer._userIconNoDir(),
            shadow: null,
            zIndex: 99
        });
    }

    /**
     * Makes the user marker look like it is going
     * in the given direction.
     * @param {number} direction - Rotation, from the north, in degrees
     * @private
     */
    _userMarkerTowards(direction) {
        if(!this._directedIcon) {
            this._userMarker.setIcon(UserDrawer._userIconWithDir());
        }
        this._userMarker.getIcon().rotation = direction;
    }

    /**
     * Makes the user marker look like it has no
     * direction at all.
     * @private
     */
    _userMarkerNoDir() {
        if(this._directedIcon) {
            this._userMarker.setIcon(UserDrawer._userIconNoDir());
        }
    }

    /**
     * Gets the user icon for no direction
     * @private
     */
    static _userIconNoDir() {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: 'blue',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
        }
    }

    /**
     * Gets an icon with direction for the user
     * @private
     */
    static _userIconWithDir() {
        return {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: 'blue',
            fillOpacity: 1,
            anchor: {x: 0, y: 2.5},
            strokeColor: 'white',
            strokeWeight: 3
        };
    }
}