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
         * The user position if available
         * @type {?google.maps.LatLng}
         * @private
         */
        this._userPos = null;
        /**
         * The id of the position tracking, if it started
         * @type {?Number}
         * @private
         */
        this._watchId = null;
        /**
         * An array with all the registered listeners
         * @type {[GeolocatorListener]}
         */
        this._registeredListeners = [];

        this._enableHighAccuracy = undefined;
        this._maximumAge = undefined;
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
            let error = Geolocator._errorCallback;
            if(listener) {
                listenerId = this.registerListener(listener);
            }
            this._watchId = navigator.geolocation.watchPosition(success, error, options);
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
            console.log("Geolocator: stopped");
        }
    }

    _successCallback(data) {
        for(let listener of this._registeredListeners) {
            listener(data);
        }
    }

    static _errorCallback(error) {
        console.log('ERROR(' + error.code + '): ' + error.message);
    }

    /**
     * Indicates whether the geolocation is available or not
     * @return {boolean}
     */
    isGeolocationAvailable() {
        return this._geolocationAvailable;
    }

    /**
     * Returns the position of the user in this moment
     * @return {google.maps.LatLng}
     */
    getUserPosition() {
        return this._userPos;
    }
}
/**
 * @callback GeolocatorListener
 * @param {{coords: {latitude: Number, longitude: Number}}} data - The received data
 */