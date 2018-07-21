/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * The Router class is defined to manage the URLs of the API.
 * @abstract
 */
class Router {
    constructor(app) {
        this.app = app;
        if(history.state) {
            this.onStatePopping({state: history.state});
        } else {
            this._onLocation(location.hash);
        }
    }

    /**
     * Saves the given page in the history
     * @param {Page} page
     */
    savePage(page) {
        this.saveState(page.getState(), page.title, Router.urlFor(page));
    }

    /**
     * Saves the given state in the history
     * @param {PageState} state
     * @param {string} [title]
     * @param {string} [url]
     */
    saveState(state, title, url) {
        history.pushState(state, title, url);
    }

    /**
     * Sometimes the pages need to update their saved state,
     * this is the function for it
     * @param {Page} page
     */
    replaceState(page) {
        history.replaceState(page.getState(), page.title, Router.urlFor(page));
    }

    /**
     * Should be linked to window.onpopstate, as it is able to handle
     * these events.
     * @param {{state: PageState|null}} event
     */
    onStatePopping(event) {
        if(event.state) {
            let page;
            switch(event.state.pageClass) {
                case CATEGORIES_GRID_PAGE_CLASS:
                    page = CategoriesGridPage.fromState(this.app, event.state);
                    break;
                case LIST_PAGE_CLASS:
                    page = ListPage.fromState(this.app, event.state);
                    break;
                case MAP_PAGE_CLASS:
                    page = MapPage.fromState(this.app, event.state);
                    break;
                case EMERGENCY_PAGE_CLASS:
                    page = EmergencyPage.fromState(this.app, event.state);
                    break;
                default:
                    page = new HomePage(this.app);
                    break;
            }
            if(page) {
                this.app.loadAndRenderPage(page);
            }
        } else {
            this.app.loadAndRenderPage(new HomePage(this.app));
        }
    }

    /**
     * Gets the URL which leads to a given page
     * @param {Page} page
     */
    static urlFor(page) {
        return "#not_implemented_yet";
    }

    /**
     * Called by the constructor when there is a hash in the URL.
     * It loads the corresponding page in the app
     * @param {string|null} urlHash - the hash in the URL or an expresion evaluating to false to load the home page
     * @private
     */
    _onLocation(urlHash) {
        if(urlHash) {
            console.log("URL HASH (NOT IMPLEMENTED)", urlHash);
            // While we don't implement it, we go to home page
            this.app.loadAndRenderPage(new HomePage(this.app));
        } else {
            // When null or "" we go to the home page
            this.app.loadAndRenderPage(new HomePage(this.app));
        }
    }
}