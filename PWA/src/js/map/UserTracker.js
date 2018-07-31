/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class provides methods to track the user position and
 * draws it into the map, when this one is available
 */
class UserTracker {
    constructor() {
        /**
         * The geolocator to track the user
         * @type {Geolocator}
         * @private
         */
        this._geolocator = new Geolocator();
        /**
         * Used to draw the user location on the map,
         * once the google maps api is available
         * @type {?UserDrawer}
         * @private
         */
        this._userDrawer = null;
        /**
         * The position of the user, if known now.
         * If the geolocation error is set, this one should be null.
         * @type {?Coordinates}
         * @private
         */
        this._userPosition = null;
        /**
         * The geolocation error, if there has been one.
         * If the user position is set, this one should be null.
         * @type {?PositionError}
         * @private
         */
        this._geolocationError = null;
        /**
         * Listeners for changes in the user position availability
         * @type {UserLocationAvailabilityChangeListener[]}
         * @private
         */
        this._changeListeners = [];
        /**
         * If the error icon tries to be set before the drawer is created,
         * we store it here for later.
         * @type {?Element}
         * @private
         */
        this._savedErrorIcon = null;
    }

    /**
     * Sets the map to draw the user position in
     * @param {google.maps.Map} map - The map
     */
    setMap(map) {
        this._userDrawer = new UserDrawer(map, this._userPosition);
        this._userDrawer.setGeolocationErrorIcon(this._savedErrorIcon);
        this._userDrawer.showGeolocationError(!this.isUserPositionAvailable());
    }

    /**
     * Sets the geolocation error icon to display
     * when an error with the geolocation occurs.
     * It simply delegates into the UserDrawer.
     * @see {UserDrawer#setGeolocationErrorIcon}
     * @param {Element} icon - The element which works as icon
     */
    setGeolocationErrorIcon(icon) {
        if(this._userDrawer) {
            this._userDrawer.setGeolocationErrorIcon(icon);
        } else {
            this._savedErrorIcon = icon;
        }
    }

    /**
     * Starts tracking the user
     */
    startTracking() {
        this._geolocator.start((...x)=>this._onUserPositionUpdate(...x));
    }

    /**
     * Obtains the user position, if available.
     * @return {?Coordinates}
     */
    getUserPosition() {
        return this._userPosition;
    }

    /**
     * Checks if the user position is available or not
     * @returns {boolean}
     */
    isUserPositionAvailable() {
        return !this._geolocationError && !!this._userPosition;
    }

    /**
     * Stops tracking the user
     */
    stopTracking() {
        this._geolocator.stop();
    }

    /**
     * It will be called each time the user position is updated
     * @param {?Position} data - New data of the geolocation
     * @param {?PositionError} error - The error if there has been one
     * @private
     */
    _onUserPositionUpdate(data, error) {
        let previousAvailability = this.isUserPositionAvailable();

        this._geolocationError = error || null;
        this._userPosition = (error ? null : data.coords);

        if(this._userDrawer) {
            this._userDrawer.showGeolocationError(!!this._geolocationError);
            this._userDrawer.updateUserMarker(this._userPosition);
        }

        if(this.isUserPositionAvailable() !== previousAvailability) {
            for (let listener of this._changeListeners) {
                listener(this.isUserPositionAvailable());
            }
        }
    }

    /**
     * Registers a new listener to listen for changes in the user location
     * availability.
     * @param {UserLocationAvailabilityChangeListener} listener - The callback listener
     */
    registerChangeListener(listener) {
        this._changeListeners.push(listener);
    }
}
/**
 * @callback UserLocationAvailabilityChangeListener
 * @param {boolean} available - Whether the user is now available or not.
 */