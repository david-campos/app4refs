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
     * @param {boolean} [noCache] - true if you don't want request to the API be cached
     */
    constructor(token, noCache) {
        /**
         * @type {ApiAjaxAdapter}
         * @private
         */
        this._api = new ApiAjaxAdapter(RESOURCE_BASE_URL+'/'+API_BASE_URL, noCache);

        if(token) {
            this._api.setAuthorisation(AUTH_BEARER, token.token);
            this._api.sharedParams['token'] = token.token; // URL param
        }
    }

    /**
     * Gets a list with all the category ids associated with the given item type
     * @param {string} itemType - Item type to search categories for
     * @param {GetCategoriesCallback} callback - Function to be called when we have the categories
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    getCategories(itemType, callback, errorCallback) {
        return this._api.get(
            ApiService.buildCategoriesUrl(itemType),
            {},
            (...x)=>ApiService._categoriesSuccess(callback, ...x),
            (...x)=>ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when we obtain the categories from the API successfully
     * @param {GetCategoriesCallback} callback
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {Category[]} categories
     * @private
     */
    static _categoriesSuccess(callback, request, categories) {
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

    /**
     * Gets a list with all the items for the given category
     * @param {string} categoryCode - The category code to get the items for
     * @param {GetItemsCallback} callback - A callback to be called when we have the items
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    getItems(categoryCode, callback, errorCallback) {
        return this._api.get(
            ApiService.buildItemsInCategoryUrl(categoryCode),
            {},
            (...x)=>ApiService._itemsSuccess(callback, ...x),
            (...x)=>ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when we obtain the items from the API successfully
     * @param {GetItemsCallback} callback
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {ItemObject[]} items
     * @private
     */
    static _itemsSuccess(callback, request, items) {
        if(items === null) items = [];
        callback(items.map((itemObj)=>new Item(itemObj)));
    }

    /**
     * Deletes the given item from the API, notice
     * you need authorisation to perform this action.
     * @param {Item} item
     * @param {DeleteItemCallback} callback
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    deleteItem(item, callback, errorCallback) {
        return this._api.del(
            ApiService.buildSingleItemUrl(item.itemId),
            {},
            (...x)=> callback, // It does not return anything so nothing needs to be done
            (...x)=> ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Saves an item to permanent storage through the API, updating it
     * @param {Item} item - The item to save
     * @param {SaveItemCallback} callback - Function to be called when everything goes right
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    saveItem(item, callback, errorCallback) {
        let itemObj = item.toObject();
        delete itemObj.itemId;
        return this._api.put(
            ApiService.buildSingleItemUrl(item.itemId),
            {},
            itemObj,
            (...x)=>ApiService._saveItemSuccess(callback, ...x),
            (...x)=>ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when the item has been succesfully saved
     * @param {SaveItemCallback} callback - Function to be called when everything goes right
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {ItemObject} itemObject - Received from the API (exactly as in the database)
     * @private
     */
    static _saveItemSuccess(callback, request, itemObject) {
        callback(new Item(itemObject));
    }

    /**
     * Changes the icon of an item for another image
     * @param {Item} item - The item to change the image to
     * @param {string} image - The new image, codified in a string in base64
     * @param {ChangeIconCallback} callback - Function to call on success
     * @param {ApiErrorCallback} errorCallback - Function to call on error
     * @return {ApiAjaxRequest} - The request
     */
    changeIcon(item, image, callback, errorCallback) {
        return this._api.post(
            ApiService.buildSingleItemIconUrl(item.itemId),
            {},
            {'image': image},
            (...x)=> ApiService._changeIconSuccess(callback, ...x),
            (...x)=> ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when the item icon has been succesfully changed and saved
     * @param {ChangeIconCallback} callback
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {ItemObject} itemObject - Received from the API (exactly as in the database)
     * @private
     */
    static _changeIconSuccess(callback, request, itemObject) {
        callback(new Item(itemObject));
    }

    /**
     * Saves an item to permanent storage through the API, creating it
     * @param {Item} item
     * @param {SaveItemCallback} callback
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    createItem(item, callback, errorCallback) {
        let itemObj = item.toObject();
        delete itemObj.itemId;
        return this._api.post(
            ApiService.buildAllItemsUri(),
            {},
            itemObj,
            (...x)=> ApiService._createItemSuccess(callback, ...x),
            (...x)=> ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when the item has been succesfully saved
     * @param {SaveItemCallback} callback
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {ItemObject} itemObject - Received from the API (exactly as in the database)
     * @private
     */
    static _createItemSuccess(callback, request, itemObject) {
        callback(new Item(itemObject));
    }

    /**
     * Logins into the api obtaining a token
     * @param {string} user
     * @param {string} pass
     * @param {LoginCallback} callback
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    login(user, pass, callback, errorCallback) {
        this._api.setAuthorisation(AUTH_BASIC, user, pass, true);
        return this._api.post(
            ApiService.buildLoginUrl(),
            {},
            {user: user, password: pass},
            (...x)=>this._loginSuccess(callback, ...x),
            (...x)=> ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when we complete login successfully
     * @param {LoginCallback} callback
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {Token} token
     * @private
     */
    _loginSuccess(callback, request, token) {
        // Authorisation from now on
        this._api.setAuthorisation(AUTH_BEARER, token.token);
        this._api.sharedParams['token'] = token.token;
        callback(token);
    }

    /**
     * Logs out of the api making the token invalid from now on
     * @param {LogoutCallback} [callback]
     * @param {ApiErrorCallback} [errorCallback] - Function to be called when an error occurs
     * @return {ApiAjaxRequest} - The request
     */
    logout(callback, errorCallback) {
        return this._api.del(
            ApiService.buildLoginUrl(),
            {},
            ()=>this._logoutSuccess(callback),
            (...x)=>ApiService._errorHandling(errorCallback, ...x));
    }

    /**
     * Called when we complete logout succesfully
     * @param {ApiAjaxRequest} request - The request which ended
     * @param {LogoutCallback} callback
     * @private
     */
    _logoutSuccess(callback, request) {
        // Authorisation from now on is invalid, so just forget it
        this._api.cancelAuthorisation();
        this._api.sharedParams['token'] = undefined;
        callback();
    }

    /**
     * When any error occurs, this functions is called
     * @param {?ApiErrorCallback} callback - The error callback to call
     * @param {ApiAjaxRequest} request - The request which failed
     * @param {{}} body - The body returned
     * @private
     */
    static _errorHandling(callback, request, body) {
        if(callback) {
            callback(
                request.getStatus(),
                body['error'] ? body['error'] : 'Unknown error occurred');
        }
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
    static buildItemsInCategoryUrl(categoryCode) {
        categoryCode = encodeURIComponent(categoryCode);
        return `categories/${categoryCode}/items/`;
    }

    /**
    * Builds the url to all the items, used to create new ones
    */
    static buildAllItemsUri() {
        return `items/`;
    }

    /**
     * Builds the url to get a single item
     * @param {int} itemId - The id of the item to get
     */
    static buildSingleItemUrl(itemId) {
        return `items/${encodeURIComponent(itemId)}`;
    }

    /**
     * Builds the url to get the icon of an item
     * @param {int} itemId
     * @return {string}
     */
    static buildSingleItemIconUrl(itemId) {
        return `items/${encodeURIComponent(itemId)}/icon`;
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
 * @callback ChangeIconCallback
 * @param {Item} item - The item sent by the API with the result of changing the icon
 */
/**
 * @callback ApiErrorCallback
 * @param {int} status - The status returned
 * @param {string} error - The error description
 */