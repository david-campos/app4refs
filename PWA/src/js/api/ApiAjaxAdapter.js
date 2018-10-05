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
         * Requests currently running
         * @type {ApiAjaxRequest[]}
         * @private
         */
        this._ongoingRequests = [];
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
     * Aborts all the ongoing requests
     */
    abort() {
        while(this._ongoingRequests.length > 0) {
            let request = this._ongoingRequests.pop();
            request.abort();
        }
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
     * Cancels the previously stated authorisation header
     */
    cancelAuthorisation() {
        this._authorisationHeader = null;
        this._deleteAuthorisation = false;
    }

    /**
     * Performs a GET query to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} [onError] - Callback on error of the query
     */
    get(relativeUrl, params, onSuccess, onError) {
        this._request('GET', relativeUrl, params, null, onSuccess, onError?onError:null);
    }

    /**
     * Performs a DELETE request to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} [onError] - Callback on error of the query
     */
    del(relativeUrl, params, onSuccess, onError) {
        this._request('DELETE', relativeUrl, params, null, onSuccess, onError?onError:null);
    }

    /**
     * Performs a POST request to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {{}} body - Body of the post request
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} [onError] - Callback on error of the query
     */
    post(relativeUrl, params, body, onSuccess, onError) {
        this._request('POST', relativeUrl, params, body, onSuccess, onError?onError:null);
    }

    /**
     * Performs an UPDATE request to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {{}} body - Body of the post request
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} [onError] - Callback on error of the query
     */
    put(relativeUrl, params, body, onSuccess, onError) {
        this._request('PUT', relativeUrl, params, body, onSuccess, onError?onError:null);
    }

    /**
     * Performs any request to the API
     *
     * @param {string} method - HTTP method
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} urlParams - GET params to add
     * @param {?{}} bodyObj - object to send in the body of the request
     * @param {function} onSuccess - Callback on success of the query
     * @param {function} onError - Callback on error of the query
     */
    _request(method, relativeUrl, urlParams, bodyObj, onSuccess, onError) {
        relativeUrl = ApiAjaxAdapter._cleanRelativeUrl(relativeUrl);
        let url = this._baseUrl + relativeUrl + "?" + ApiAjaxAdapter._urlParams(urlParams);

        let self = this;
        let request = new ApiAjaxRequest(
            method, url,
            this._authorisationHeader,
            bodyObj,
            (...x)=>{self._requestFinished(request); onSuccess(...x)},
            (...x)=>{self._requestFinished(request); onError(...x)});

        if(this._deleteAuthorisation) {
            this._authorisationHeader = null;
        }

        this._ongoingRequests.push(request);

        request.perform();
    }

    /**
     * Called when a request has finished. Deletes the request from the list of ongoing requests
     * @param {ApiAjaxRequest} request - The request which has finished
     * @private
     */
    _requestFinished(request) {
        let idx = this._ongoingRequests.indexOf(request);
        if(idx !== -1) {
            this._ongoingRequests.splice(idx, 1);
        }
    }

    /**
     * Returns a string with the get params for the url of the query
     * @param {{string}} urlParams - Some extra params you want to add (if you do)
     * @returns {string}
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