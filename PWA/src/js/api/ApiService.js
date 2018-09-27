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
    /**
     * @param {Token} [token] - Token to use already (if one)
     */
    constructor(token) {
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
        /**
         * @type {?ApiErrorCallback}
         * @private
         */
        this._errorCallback = null;
        // We use only one currentId saved cause our _api can handle only one at a time (cancels the previous)
        /**
         * @type {int}
         * @private
         */
        this._currentId = -1;

        if(token) {
            this._api.setAuthorisation(AUTH_BEARER, token.token);
        }
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
     * When any error occurs, this functions is called
     * @param {int} status
     * @param {{}} body
     * @private
     */
    _errorHandling(status, body) {
        this._callback = null;
        if(this._errorCallback) {
            let cb = this._errorCallback;
            this._errorCallback = null;
            cb(status, body['error']?body['error']:'Unknown error occurred');
        }
    }

    /**
     * Gets a list with all the category ids associated with the given item type
     * @param {string} itemType - Item type to search categories for
     * @param {GetCategoriesCallback} callback - Function to be called when we have the categories
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    getCategories(itemType, callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        let self = this;
        this._api.get(
            ApiService.buildCategoriesUrl(itemType),
            {},
            (...x)=>self._categoriesSuccess(...x),
            (...x)=>self._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we obtain the categories from the API successfully
     * @param {Category[]} categories
     * @private
     */
    _categoriesSuccess(categories) {
        this._errorCallback = null;
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
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    getItems(categoryCode, callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        let self = this;
        this._api.get(
            ApiService.buildItemsUrl(categoryCode),
            {},
            (...x)=>self._itemsSuccess(...x),
            (...x)=>self._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we obtain the items from the API successfully
     * @param {ItemObject[]} items
     * @private
     */
    _itemsSuccess(items) {
        this._errorCallback = null;
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            if(items === null) items = [];
            callback(items.map((itemObj)=>new Item(itemObj)));
        }
    }

    /**
     * Deletes the given item from the API, notice
     * you need authorisation to perform this action.
     * @param {Item} item
     * @param {DeleteItemCallback} callback
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    deleteItem(item, callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        this._api.del(
            ApiService.buildSingleItemUrl(item.itemId),
            {},
            (...x)=>this._deleteItemSuccess(...x),
            (...x)=>this._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when an item has been deleted successfully
     * @private
     */
    _deleteItemSuccess() {
        this._errorCallback = null;
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            callback();
        }
    }

    /**
     * Saves an item to permanent storage through the API
     * @param {Item} item
     * @param {SaveItemCallback} callback
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    saveItem(item, callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        let itemObj = item.toObject();
        delete itemObj.itemId;
        this._api.put(
            ApiService.buildSingleItemUrl(item.itemId),
            {},
            itemObj,
            (...x)=>this._saveItemSuccess(...x),
            (...x)=>this._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when the item has been succesfully saved
     * @param {ItemObject} itemObject - Received from the API (exactly as in the database)
     * @private
     */
    _saveItemSuccess(itemObject) {
        this._errorCallback = null;
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            callback(new Item(itemObject));
        }
    }

    /**
     * Logins into the api obtaining a token
     * @param {string} user
     * @param {string} pass
     * @param {LoginCallback} [callback]
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    login(user, pass, callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        this._api.setAuthorisation(AUTH_BASIC, user, pass, true);
        this._api.post(
            ApiService.buildLoginUrl(),
            {},
            {},
            (...x)=>this._loginSuccess(...x),
            (...x)=>this._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we complete login successfully
     * @param {Token} token
     * @private
     */
    _loginSuccess(token) {
        this._errorCallback = null;
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            callback(token);
        }
        // Authorisation from now on
        this._api.setAuthorisation(AUTH_BEARER, token.token);
    }

    /**
     * Logs out of the api making the token invalid from now on
     * @param {LogoutCallback} [callback]
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {int} The id for this request (used to cancel)
     */
    logout(callback, errorCallback) {
        this._callback = callback;
        this._errorCallback = errorCallback;
        this._api.del(
            ApiService.buildLoginUrl(),
            {},
            (...x)=>this._logoutSuccess(...x),
            (...x)=>this._errorHandling(...x));
        return this._nextRequestId();
    }

    /**
     * Called when we complete logout succesfully
     * @private
     */
    _logoutSuccess() {
        this._errorCallback = null;
        if(this._callback) {
            let callback = this._callback;
            this._callback = null;
            callback();
        }
        // Authorisation from now on is invalid, so just forget it
        this._api.cancelAuthorisation();
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
     * Builds the url to get a single item
     * @param {int} itemId - The id of the item to get
     */
    static buildSingleItemUrl(itemId) {
        return `items/${encodeURIComponent(itemId)}`;
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
/**
 * @callback LogoutCallback
 */
/**
 * @callback DeleteItemCallback
 */
/**
 * @callback SaveItemCallback
 * @param {Item} item - The item sent by the API with the result of saving it
 */
/**
 * @callback ApiErrorCallback
 * @param {int} status - The status returned
 * @param {string} error - The error description
 */