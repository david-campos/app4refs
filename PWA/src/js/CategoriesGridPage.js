/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * pageClass for the Router to know this is the page it should load
 * @type {string}
 */
const CATEGORIES_GRID_PAGE_CLASS = "CategoriesGridPage";

/**
 * Titles for the page based on the item-type
 * @type {{info: string, help: string, service: string, leisure: string, link: string}}
 */
const TITLES = {
    'info': 'Info',
    'help': 'Help',
    'service': 'Services',
    'leisure': 'Leisure',
    'link': 'Links'
};

/**
 * Page which displays the categories associated to an item type in a grid layout.
 * Categories with "link" different from null will open the link directly on clicking.
 * The other categories will show a list page with the items in the category.
 */
class CategoriesGridPage extends GridPage {
    /**
     * @param {App} app - The app the page is running on
     * @param {string} itemType - Item-type of the categories we should display
     * @param {CategoriesGridPageState} [state] - Saved state to restore from
     */
    constructor(app, itemType, state) {
        let categories = ( state ? state.categories : {} ); // TODO: Get categories from the cache (in load)

        let icons = CategoriesGridPage._categoriesToIcons(categories);
        let columns = ( state ? state.columns : (itemType==='service'?3:2) ); // services is displayed in 3 cols

        super(columns, icons, null, new HomePage(app), TITLES[itemType], true, state);

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
        /**
         * The itemType which the categories are displayed for
         * @type {string}
         * @private
         */
        this._itemType = itemType;
    }

    load(...loadingParams) {
        // We move the AJAX call to load since we don't want this to be
        // performed in the constructor. For example when a subpage creates
        // this page as a parent, it might be not necessary to ever
        // get to perform this action
        let self = this;

        super.setClickCallback((...x)=>self._categoryClicked(...x));

        let svc = new ApiService();
        svc.getCategories(this._itemType, (...x)=>self._categoriesReceived(...x));
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
        this._app.updateCurrentSavedState();
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
        for(let key in categories) {
            if(categories.hasOwnProperty(key)) {
                icons[key] = ResourcesProvider.getCategoryIconUrl(key);
            }
        }
        return icons;
    }

    /**
     * Called when a category is clicked on some CategoriesGridPage.
     * @param {string} id - Id of the clicked category
     * @private
     */
    _categoryClicked(id) {
        let category = this._categories[id];

        if(category) {
            if(category.link) {
                // By now this is OK, when checking installation maybe
                // we need to set up a link or whatever in fact.
                window.location.href = category.link;
            } else {
                this._app.navigateToPage(new ListPage(this._app, this, category));
            }
        }
    }

    /**
     * @inheritDoc
     */
    getState() {
        let state = super.getState();
        state.pageClass = CATEGORIES_GRID_PAGE_CLASS;
        state.itemType = this._itemType;
        state.categories = this._categories;
        return state;
    }

    /**
     * Returns a new CategoriesGridPage with the data of the saved state.
     * @param {App} app - The app for the page to be created on
     * @param {CategoriesGridPageState} state - The state to restore
     */
    static fromState(app, state) {
        if(state.pageClass !== CATEGORIES_GRID_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${CATEGORIES_GRID_PAGE_CLASS}"`);
        }
        return new CategoriesGridPage(app, state.itemType, state);
    }
}
/**
 * CategoriesGridPageState
 * @typedef {GridPageState} CategoriesGridPageState
 * @property {{string}} categories
 * @property {string} itemType
 * @property {string} pageClass - Should be equals to 'GridPageState'
 */