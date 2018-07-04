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
        let icons = {}; // TODO: Get icons from the cache

        let svc = new ApiService();

        super(
            (itemType==='service'?3:2), // services is displayed in 3 cols
            icons, CategoriesGridPage._categoryClicked, home, title, true);

        this._app = app;
        svc.getCategories(itemType, this._categoriesReceived);
    }

    /**
     * Called when we receive the categories from the AJAX, redraws the page
     * showing the received categories.
     * @param {[string]} categories - The id codes of the categories
     * @private
     */
    _categoriesReceived(categories) {
        console.log("Categories received");
        let icons = {};
        for(let c of categories) {
            icons[c] = 'ico/costandlanguage/pay.png';
        }
        super.changeIcons(icons);
        this._app.clearContainer();
        super.render(this._app.getContainer());
    }

    /**
     * Called when a category is clicked on some CategoriesGridPage.
     * It needs to be static as it is passed to the parent constructor.
     * @param {string} id - Id of the clicked category
     * @private
     */
    static _categoryClicked(id) {
        alert(id);
    }
}