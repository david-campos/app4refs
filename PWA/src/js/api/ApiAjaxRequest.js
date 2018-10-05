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
        this._xhttp.open(this._method, this._url, true, 'a', 'a');

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
     * Called when the xhttp state changes
     * @private
     */
    _xhttpStateChange() {
        if (this._xhttp.readyState === 4) {
            let status = this._xhttp.status;
            // we know the body will be json (id there is some)
            let body = {};
            if(this._xhttp.responseText) {
                body = JSON.parse(this._xhttp.responseText);
            }
            this._finished(status, body);
        }
    }

    /**
     * Called when a request is finished, it manages the errors or calls the right callback
     * @param {int} status - The status code of the response
     * @param {{}} body - The parsed body of the response
     * @private
     */
    _finished(status, body) {
        let success = this._onSuccess;
        let error = this._onError;
        this._onSuccess = null;
        this._onError = null;

        switch(status) {
            case 200:
            case 201:
                success(body);
                break;
            case 204:
                success(null);
                break;
            default:
                error(status, body);
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