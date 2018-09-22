/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Base URL for the API we want to access, it can be "".
 * @type {string}
 */
const API_BASE_URL = "api_v1";

/**
 * This class provides access to the API. Use this instead of a direct connection.
 */
class ApiService {
    constructor() {
        /**
         * @type {ApiAjaxAdapter}
         * @private
         */
        this._api = new ApiAjaxAdapter(RESOURCE_BASE_URL+'/'+API_BASE_URL);
        /**
         * @type {?Function}
         * @private
         */
        this._callback = null;
        // We use only one currentId saved cause our _api can handle only one at a time (cancels the previous)
        /**
         * @type {int}
         * @private
         */
        this._currentId = -1;
    }

    /**
     * Cancels the given request if it haven't finished yet
     * @param {int} requestId - The request id received when started the request
     */
    cancelIfAlive(requestId) {
        if(requestId === this._currentId) {
            this._api.abort();
        }
    }

    /**
     * Generates the next request id
     * @private
     */
    _nextRequestId() {
        this._currentId += 1;
        return this._currentId;
    }

    /**
     * Gets a list with all the category ids associated with the given item type
     * @param {string} itemType - Item type to search categories for
     * @param {GetCategoriesCallback} callback - Function to be called when we have the categories
     * @return {int} The id for this request (used to cancel)
     */
    getCategories(itemType, callback) {
        this._callback = callback;
        let self = this;
        this._api.get(ApiService.buildCategoriesUrl(itemType), {}, (...x)=>self._categoriesSuccess(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we obtain the categories from the API successfully
     * @param {Category[]} categories
     * @private
     */
    _categoriesSuccess(categories) {
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            let sortedCategories = {};
            if(categories) {
                for (let category of categories) {
                    if (category.code) {
                        sortedCategories[category.code] = category;
                    }
                }
            }
            callback(sortedCategories);
        }
    }

    /**
     * Gets a list with all the items for the given category
     * @param {string} categoryCode - The category code to get the items for
     * @param {GetItemsCallback} callback - A callback to be called when we have the items
     * @return {int} The id for this request (used to cancel)
     */
    getItems(categoryCode, callback) {
        this._callback = callback;
        let self = this;
        this._api.get(ApiService.buildItemsUrl(categoryCode), {}, (...x)=>self._itemsSuccess(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we obtain the items from the API successfully
     * @param {ItemObject[]} items
     * @private
     */
    _itemsSuccess(items) {
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            if(items === null) items = [];
            callback(items.map((itemObj)=>new Item(itemObj)));
        }
    }

    /**
     * Logins into the api obtaining a token
     * @param {string} user
     * @param {string} pass
     * @param {LoginCallback} [callback]
     */
    login(user, pass, callback) {
        this._callback = callback;
        this._api.setAuthorisation(AUTH_BASIC, user, pass, true);
        this._api.post(ApiService.buildLoginUrl(), {}, {}, (...x)=>this._loginSuccess(...x));
    }

    /**
     * Called when we complete login successfully
     * @param {Token} token
     * @private
     */
    _loginSuccess(token) {
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            callback(token);
        }
        // Authorisation from now on
        this._api.setAuthorisation(AUTH_BEARER, token.token);
    }

    /**
     * Builds the url to get the categories for the given item type
     * @param {string} itemType - The item type to get the categories for
     */
    static buildCategoriesUrl(itemType) {
        itemType = encodeURIComponent(itemType);
        return `item-types/${itemType}/categories/`;
    }

    /**
     * Builds the url to get the items for the given category
     * @param categoryCode - The code of the category to get the items for
     */
    static buildItemsUrl(categoryCode) {
        categoryCode = encodeURIComponent(categoryCode);
        return `categories/${categoryCode}/items/`;
    }

    /**
     * Builds the url to sign in into the API
     */
    static buildLoginUrl() {
        return `session`;
    }
}

/**
 * @callback GetCategoriesCallback
 * @param {{Category}} categories - The categories received, using as key the codes.
 */
/**
 * @callback GetItemsCallback
 * @param {Item[]} items - The received items
 */
/**
 * @callback LoginCallback
 * @param {Token} token - The received token information
 */