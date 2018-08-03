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
         * Compasses discarded after giving some failure or
         * being not available.
         * @type {int}
         * @private
         */
        this._discardedCompasses = 0;
        /**
         * The compass to get the heading for the user
         * @type {?Compass}
         * @private
         */
        this._compass = this._createCompass();
        console.log("Using compass", this._discardedCompasses);
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
         * If known, the angle anti-clockwise in degrees from the North, in which
         * the user si looking at.
         * @type {null}
         * @private
         */
        this._userHeading = null;
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
        if(this._compass) {
            this._compass.start((...x) => this._onUserHeadingUpdate(...x));
        }
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
        if(this._compass) {
            this._compass.stop();
        }
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
            this._userDrawer.updateUserMarker(this._userPosition, this._userHeading);
        }

        if(this.isUserPositionAvailable() !== previousAvailability) {
            for (let listener of this._changeListeners) {
                listener(this.isUserPositionAvailable());
            }
        }
    }

    /**
     * Called when the compass has a new direction to offer
     * @param {?number} heading - The direction in which the user is looking (in degrees from the North anti-clockwise)
     * @param {boolean} error - True if there has been an error, false if not.
     * @private
     */
    _onUserHeadingUpdate(heading, error) {
        this._userHeading = error ? null : heading;

        if(error) this._changeCompass();
        else if(this._userDrawer) {
            this._userDrawer.updateUserMarker(this._userPosition, this._userHeading);
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

    /**
     * Changes the compass to the next available one
     * @private
     */
    _changeCompass() {
        console.log("Error in compass " + this._discardedCompasses + ", changing to next one.");
        this._compass.stop();
        this._discardedCompasses++;
        this._compass = this._createCompass();
        if(this._compass) {
            this._compass.start((...x) => this._onUserHeadingUpdate(...x));
            console.log("Using compass ", this._discardedCompasses);
        } else {
            console.log("No more compasses available");
        }
    }

    /**
     * Creates a new compass (strategy) for this
     * class.
     * @return {?Compass} A compass which is able to work in this environment
     * @private
     */
    _createCompass() {
        // Each time we enter all the previously discarded ones are directly
        // skipped.
        // noinspection FallThroughInSwitchStatementJS
        while(true) {
            switch (this._discardedCompasses) {
                default:
                    return null; // Nothing more to try
                case 0: if (AOSCompass.isAvailable()) return new AOSCompass();
                    break;
                case 1: if (DOACompass.isAvailable()) return new DOACompass();
                    break;
                case 2: if (DOCompass.isAvailable())  return new DOCompass();
                    break;
            }
            this._discardedCompasses++;
        }
    }
}
/**
 * @callback UserLocationAvailabilityChangeListener
 * @param {boolean} available - Whether the user is now available or not.
 */