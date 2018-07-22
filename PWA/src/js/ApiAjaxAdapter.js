/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Used by the ApiService to perform the connections to the API using AJAX
 */
class ApiAjaxAdapter {
    /**
     * @param {string} baseUrl - Base URL for the api
     */
    constructor(baseUrl) {
        this._baseUrl = ApiAjaxAdapter._cleanBaseUrl(baseUrl);
        this._xhttp = this._createXHttp();
        this._onSuccess = null;
    }

    /**
     * Aborts the ongoing XHTTP request
     */
    abort() {
        this._xhttp.abort();
    }

    /**
     * Performs a GET query to the API into the specified relative URL
     * @param {string} relativeUrl - URL in the api we want to make a GET query to
     * @param {{string}} params - GET params to add
     * @param {function} onSuccess - Callback on success of the query
     */
    get(relativeUrl, params, onSuccess) {
        // we don't want onSuccess null
        if(!onSuccess) return;

        relativeUrl = ApiAjaxAdapter._cleanRelativeUrl(relativeUrl);
        let url = this._baseUrl + relativeUrl + "?" + ApiAjaxAdapter._urlParams(params);
        if(this._onSuccess !== null) {
            // Ongoing callback not finished, discard
            // (maybe in the future add handle for several requests at the same time)
            this.abort();
        }

        this._onSuccess = onSuccess;
        this._xhttp.open('GET', url, true);
        this._xhttp.send();
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
        switch(status) {
            case 200:
                this._onSuccess(body);
                break;
            case 204:
                this._onSuccess(null);
                break;
            case 0:
                console.log("The API is not reachable");
                break;
            default:
                // TODO: API error management
                console.error("API error:", status, body);
        }
        // Reset the callbacks
        this._onSuccess = null;
    }

    _createXHttp() {
        let self = this;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = ()=>self._xhttpStateChange();
        return xhttp;
    }

    /**
     * Returns a string with the get params for the url of the query
     * @param {{string}} urlParams - Some extra params you want to add (if you do)
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