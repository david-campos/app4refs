/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * The geolocator manages the tracking of the user position
 */
class Geolocator {
    constructor() {
        /**
         * Indicates whether the geolocation is available or not
         * @type {boolean}
         * @private
         */
        this._geolocationAvailable = ("geolocation" in navigator);

        /**
         * The id of the position tracking, if it started
         * @type {?Number}
         * @private
         */
        this._watchId = null;
        /**
         * An array with all the registered listeners
         * @type {GeolocatorListener[]}
         * @private
         */
        this._registeredListeners = [];
        /**
         * True if the geolocator has been started, false if not
         * @type {boolean}
         * @private
         */
        this._started = false;

        this._enableHighAccuracy = true; // High accuracy!
        this._maximumAge = 60000; // No more than a minute ago please
        this._timeout = undefined;
    }

    /**
     * Registers a new listener for the success answers of tracking
     * @param {GeolocatorListener} listener
     * @return {number} - The id to remove the listener in the future.
     */
    registerListener(listener) {
        return (this._registeredListeners.push(listener) - 1);
    }

    /**
     * Removes a registered listener
     * @param {number} listenerId - The id of the listener to remove
     */
    removeListener(listenerId) {
        delete this._registeredListeners[listenerId];
    }

    /**
     * Starts user tracking, it will stop the previous tracking if existent.
     * It accepts, optionally, a listener to register.
     * @param {GeolocatorListener} [listener]
     * @return {?number} - If a listener is given, it returns the id
     */
    start(listener) {
        let listenerId = null;
        if(this._geolocationAvailable) {
            if(this._watchId) {
                stop();
            }
            let options = {
                enableHighAccuracy: this._enableHighAccuracy,
                maximumAge        : this._maximumAge,
                timeout           : this._timeout
            };
            let success = (...x)=>this._successCallback(...x);
            let error = (...x)=>this._errorCallback(...x);
            if(listener) {
                listenerId = this.registerListener(listener);
            }
            this._watchId = navigator.geolocation.watchPosition(success, error, options);
            this._started = true;
            console.log("Geolocator: started");
        }
        return listenerId;
    }

    /**
     * Stops user tracking
     */
    stop() {
        if(this._watchId) {
            navigator.geolocation.clearWatch(this._watchId);
            this._watchId = null;
        }
        this._started = false;
        console.log("Geolocator: stopped");
    }

    /**
     * @param {Position} data
     * @private
     */
    _successCallback(data) {
        //console.log("GEOLOCATOR DATA: ", data);
        for(let listener of this._registeredListeners) {
            listener(data);
        }
    }

    /**
     * @param {PositionError} posError
     * @private
     */
    _errorCallback(posError) {
        //console.log("GEOLOCATOR ERROR: ", posError);
        // Try again in 1 second if it isn't by permission denial
        setTimeout(function(){
            if(this._started){
                this.start();
            }
        }.bind(this), 1000);
        for(let listener of this._registeredListeners) {
            listener(null, posError);
        }
    }

    /**
     * Indicates whether the geolocation is available or not
     * @return {boolean}
     */
    isGeolocationAvailable() {
        return this._geolocationAvailable;
    }
}
/**
 * @callback GeolocatorListener
 * @param {?Position} data - The received data
 * @param {?PositionError} error - If there is an error
 */