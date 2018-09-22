/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Basic authorisation method
 * @type {AuthorisationMethod}
 */
const AUTH_BASIC = 'Basic';
/**
 * Bearer authorisation method
 * @type {AuthorisationMethod}
 */
const AUTH_BEARER = 'Bearer';

/**
 * Used by the ApiService to perform the connections to the API using AJAX
 */
class ApiAjaxAdapter {
    /**
     * @param {string} baseUrl - Base URL for the api
     */
    constructor(baseUrl) {
        /**
         * @type {string}
         * @private
         */
        this._baseUrl = ApiAjaxAdapter._cleanBaseUrl(baseUrl);
        /**
         * @type {XMLHttpRequest}
         * @private
         */
        this._xhttp = this._createXHttp();
        /**
         * Callback to be called on success
         * @type {?Function}
         * @private
         */
        this._onSuccess = null;
        /**
         * The authorisation header (if one) for the
         * subsequent calls
         * @type {?string}
         * @private
         */
        this._authorisationHeader = null;
        /**
         * Determines if the authorisation should be deleted
         * after using it
         * @type {boolean}
         * @private
         */
        this._deleteAuthorisation = false;
    }

    /**
     * Aborts the ongoing XHTTP request
     */
    abort() {
        this._xhttp.abort();
    }

    /**
     * Changes the authorisation for the subsequent requests to the API
     * @param {AuthorisationMethod} method - Method of Authorisation employed
     * @param {string} val1 - The user of the basic method and the token of the bearer method
     * @param {string} [val2] - Password for the basic method
     * @param {boolean} [justOnce] - If true, the authorisation will be used only in the next request
     */
    setAuthorisation(method, val1, val2, justOnce) {
        let authStr = null;
        switch(method) {
            case AUTH_BASIC:
                // Will fail with Unicode chars, but just allow only basic ASCII characters
                authStr = btoa(`${val1}:${val2}`);
                break;
            case AUTH_BEARER:
                authStr = val1;
                break;
            default:
                // EXIT
                return;
        }
        this._authorisationHeader = `${method} ${authStr}`;
        this._deleteAuthorisation = !!justOnce;
    }

    /**
     * Performs a GET query to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {function} onSuccess - Callback on success of the query
     */
    get(relativeUrl, params, onSuccess) {
        this._request('GET', relativeUrl, params, null, onSuccess);
    }

    /**
     * Performs a POST query to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {{}} body - Body of the post request
     * @param {function} onSuccess - Callback on success of the query
     */
    post(relativeUrl, params, body, onSuccess) {
        this._request('POST', relativeUrl, params, body, onSuccess);
    }

    /**
     * Performs any request to the API
     *
     * @param {string} method - HTTP method
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} urlParams - GET params to add
     * @param {?{}} bodyObj - object to send in the body of the request
     * @param {function} onSuccess - Callback on success of the query
     */
    _request(method, relativeUrl, urlParams, bodyObj, onSuccess) {
        // we don't want onSuccess null
        if(!onSuccess) return;

        relativeUrl = ApiAjaxAdapter._cleanRelativeUrl(relativeUrl);
        let url = this._baseUrl + relativeUrl + "?" + ApiAjaxAdapter._urlParams(urlParams);
        if(this._onSuccess !== null) {
            // Ongoing callback not finished, discard
            // (maybe in the future add handle for several requests at the same time)
            this.abort();
        }

        this._onSuccess = onSuccess;
        this._xhttp.open(method, url, true);

        if(this._authorisationHeader) {
            this._xhttp.setRequestHeader("Authorization", this._authorisationHeader);
            if(this._deleteAuthorisation) {
                this._authorisationHeader = null;
            }
        }

        if(bodyObj) {
            this._xhttp.setRequestHeader("Content-Type", "application/json");
            this._xhttp.send(JSON.stringify(bodyObj));
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
            this._requestFinished(status, body);
        }
    }

    /**
     * Called when a request is finished, it manages the errors or calls the right callback
     * @param {int} status - The status code of the response
     * @param {{}} body - The parsed body of the response
     * @private
     */
    _requestFinished(status, body) {
        // Reset the callbacks
        // If we do it later they could be erased in the own callback!
        let success = this._onSuccess;
        this._onSuccess = null;

        switch(status) {
            case 200:
                success(body);
                break;
            case 204:
                success(null);
                break;
            case 0:
                console.error("The API is not reachable");
                break;
            default:
                // TODO: API error management
                console.error("API error:", status, body);
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

    /**
     * Returns a string with the get params for the url of the query
     * @param {{string}} urlParams - Some extra params you want to add (if you do)
     * @returns {{string}}
     * @private
     */
    static _urlParams(urlParams) {
        // Json output always included
        let params = "out=json";
        for(let [key, val] of Object.entries(urlParams)) {
            if(key !== 'out') {
                params += encodeURIComponent(key) + "=" + encodeURIComponent(val);
            }
        }
        return params;
    }

    /**
     * Cleans the baseUrl to leave it prepared.
     * @param {string} baseUrl - URL to prepare
     * @return {string}
     * @private
     */
    static _cleanBaseUrl(baseUrl) {
        baseUrl = baseUrl.trim();
        if(baseUrl === "" || baseUrl.endsWith("/")) {
            return baseUrl;
        } else {
            return baseUrl + "/";
        }
    }

    /**
     * Cleans the relative url to leave it prepared
     * @param {string} relativeUrl - URL to prepare
     * @return {string}
     * @private
     */
    static _cleanRelativeUrl(relativeUrl) {
        relativeUrl = relativeUrl.trim();
        while(relativeUrl.startsWith("/")) {
            relativeUrl = relativeUrl.substring(1);
        }
        return relativeUrl;
    }
}

/**
 * @typedef {string} AuthorisationMethod
 */