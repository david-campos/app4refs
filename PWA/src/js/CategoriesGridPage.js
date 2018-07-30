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
     * @param {string} itemType - Item-type of the categories we should display
     * @param {CategoriesGridPageState} [state] - Saved state to restore from
     */
    constructor(itemType, state) {
        if(!TITLES[itemType]) {
            itemType = Object.keys(TITLES)[0];
        }

        let categories = ( state ? state.categories : {} ); // TODO: Get categories from the cache (in load)

        let icons = CategoriesGridPage._categoriesToIcons(categories);
        let columns = ( state ? state.columns : (itemType==='service'?3:2) ); // services is displayed in 3 cols

        super(columns, icons, null, TITLES[itemType], true, state);

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
        // If the page is hidden we ignore this
        if(!this.isVisible()) {
            return;
        }

        this._categories = categories;
        let icons = CategoriesGridPage._categoriesToIcons(this._categories);
        super.changeIcons(icons);
        this.app.updateCurrentSavedState();
        this.app.clearContainer();
        super.render(this.app.getContainer());
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
                window.open(category.link, "_blank");
            } else {
                this.app.navigateToPage(new ListPage(category));
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
        state.hash = state.itemType;
        return state;
    }

    /**
     * Returns a new CatgoriesGridPage for the given hash
     * @param {string} hash
     */
    static navigateFromHash(hash) {
        if(hash && /^[0-9a-z_\-]+$/i.test(hash)) {
            App.getInstance().navigateToPage(new CategoriesGridPage(hash));
        }
    }

    /**
     * Returns a new CategoriesGridPage with the data of the saved state.
     * @param {CategoriesGridPageState} state - The state to restore
     * @return {CategoriesGridPage}
     */
    static fromState(state) {
        if(state.pageClass !== CATEGORIES_GRID_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${CATEGORIES_GRID_PAGE_CLASS}"`);
        }
        return new CategoriesGridPage(state.itemType, state);
    }
}
/**
 * CategoriesGridPageState
 * @typedef {GridPageState} CategoriesGridPageState
 * @property {{string}} categories
 * @property {string} itemType
 */