/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class encapsulates a request to a JSON API through AJAX
 */
class ApiAjaxRequest {
    /**
     *
     * @param {string} method - HTTP method
     * @param {string} url - URL in the api we want to make a query to
     * @param {?string} authorisation - authorisation header (if any)
     * @param {?{}} bodyObj - object to send in the body of the request
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} onError - Callback on error of the query
     */
    constructor(method, url, authorisation, bodyObj, onSuccess, onError) {
        /**
         * @type {XMLHttpRequest}
         * @private
         */
        this._xhttp = this._createXHttp();
        /**
         * Callback to be called on success
         * @type {function}
         * @private
         */
        this._onSuccess = onSuccess;
        /**
         * Callback to be called on error
         * @type {function}
         * @private
         */
        this._onError = onError;
        /**
         * The authorisation header (if one) for the
         * subsequent calls
         * @type {?string}
         * @private
         */
        this._authorisationHeader = authorisation;
        /**
         * @type {string}
         * @private
         */
        this._method = method;
        /**
         * @type {string}
         * @private
         */
        this._url = url;
        /**
         * @type {{}}
         * @private
         */
        this._body = bodyObj;
    }

    abort() {
        this._xhttp.abort();
    }

    /**
     * Performs the request
     */
    perform() {
        // Check it haven't been performed already
        if(this._xhttp.readyState !== 0) {
            return;
        }

        this._xhttp.open(this._method, this._url/*, true, 'a', 'a'*/);

        if(this._authorisationHeader) {
            this._xhttp.setRequestHeader("Authorization", this._authorisationHeader);
        }

        if(this._body) {
            this._xhttp.setRequestHeader("Content-Type", "application/json");
            this._xhttp.send(JSON.stringify(this._body));
        } else {
            this._xhttp.send();
        }
    }

    /**
     * Gets the status of the request
     * @return {number}
     */
    getStatus() {
        return this._xhttp.status;
    }

    /**
     * Called when the xhttp state changes
     * @private
     */
    _xhttpStateChange() {
        if (this._xhttp.readyState === 4) {
            this._finished();
        }
    }

    /**
     * Called when a request is finished, it manages the errors or calls the right callback
     * @private
     */
    _finished() {
        let success = this._onSuccess;
        let error = this._onError;
        this._onSuccess = null;
        this._onError = null;

        // we know the body will be json (id there is some)
        let body = {};
        if(this._xhttp.responseText) {
            body = JSON.parse(this._xhttp.responseText);
        }

        switch(this._xhttp.status) {
            case 200:
            case 201:
                success(this, body);
                break;
            case 204:
                success(this, null);
                break;
            default:
                error(this, body);
                break;
        }
    }

    /**
     * Creates the XMLHttpRequest for this adapter
     * @return {XMLHttpRequest}
     * @private
     */
    _createXHttp() {
        let self = this;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = ()=>self._xhttpStateChange();
        return xhttp;
    }
}