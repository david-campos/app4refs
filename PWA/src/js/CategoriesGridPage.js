/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Page which displays the categories associated to an item type in a grid layout
 */
class CategoriesGridPage extends GridPage {
    /**
     * @param {App} app - The app the page is running on
     * @param {Page} home - Home page to go back
     * @param {string} title - Title for the page
     * @param {string} itemType - Item-type of the categories we should display
     */
    constructor(app, home, title, itemType) {
        let categories = {}; // TODO: Get categories from the cache
        let icons = CategoriesGridPage._categoriesToIcons(categories);
        super(
            (itemType==='service'?3:2), // services is displayed in 3 cols
            icons, null, home, title, true);

        let self = this;

        super.setClickCallback((...x)=>self._categoryClicked(...x));

        /**
         * The app the Page is running on
         * @type {App}
         * @private
         */
        this._app = app;

        /**
         * The categories we are displaying
         * @type {{Category}}
         * @private
         */
        this._categories = categories;

        let svc = new ApiService();
        svc.getCategories(itemType, (...x)=>self._categoriesReceived(...x));
    }

    /**
     * Called when we receive the categories from the AJAX, redraws the page
     * showing the received categories.
     * @param {{Category}} categories - The categories using the code as key
     * @private
     */
    _categoriesReceived(categories) {
        this._categories = categories;
        let icons = CategoriesGridPage._categoriesToIcons(this._categories);
        super.changeIcons(icons);
        this._app.clearContainer();
        super.render(this._app.getContainer());
    }

    /**
     * Given a list of categories returns a list of icons for those categories,
     * where the keys are the codes of the categories
     * @param {{Category}} categories - the categories to get the list for
     * @return {{string}}
     * @private
     */
    static _categoriesToIcons(categories) {
        let icons = {};
        for(let c of categories) {
            icons[c.code] = ResourcesProvider.getCategoryIconUrl(c.code);
        }
        return icons;
    }

    /**
     * Called when a category is clicked on some CategoriesGridPage.
     * @param {string} id - Id of the clicked category
     * @private
     */
    _categoryClicked(id) {
        alert(JSON.stringify(this._categories[id]));
    }
}