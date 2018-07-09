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
        this._api = new ApiAjaxAdapter(RESOURCE_BASE_URL+'/'+API_BASE_URL);
        this._callback = null;
    }

    /**
     * Gets a list with all the category ids associated with the given item type
     * @param {string} itemType - Item type to search categories for
     * @param {GetCategoriesCallback} callback - Function to be called when we have the categories
     */
    getCategories(itemType, callback) {
        this._callback = callback;
        let self = this;
        this._api.get(ApiService.buildCategoriesUrl(itemType), {}, (...x)=>self._categoriesSuccess(...x));
    }

    /**
     * Called when we obtain the categories from the API successfully
     * @param {[Category]} categories
     * @private
     */
    _categoriesSuccess(categories) {
        if(this._callback) {
            let sortedCategories = {};
            for(let category of categories) {
                if(category.code) {
                    sortedCategories[category.code] = category;
                }
            }
            this._callback(sortedCategories);
            this._callback = null;
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
}

/**
 * @callback GetCategoriesCallback
 * @param {{Category}} categories - The categories received, using as key the codes.
 */
/**
 * Categories interface
 * @typedef {Object} Category
 * @property {string} code
 * @property {string} itemType
 * @property {string} name
 * @property {string} [link]
 */