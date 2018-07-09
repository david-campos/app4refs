/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * App class, this is the main class of our application
 */
class App {
    constructor() {
        /**
         * Navigation bar
         * @type {NavBar}
         * @private
         */
        this._nav = new NavBar(this);
        /**
         * Currently displayed page
         * @type {Page}
         * @private
         */
        this._currentPage = null;
        /**
         * App container to render the pages on
         * @type {Element}
         * @private
         */
        this._container = document.getElementById("app-container");
        /**
         * The router to direct inside the page navigation
         * @type {Router}
         * @private
         */
        this._router = new Router(this);

        window.onpopstate = (...x)=>this._router.onStatePopping(...x);
    }

    /**
     * Gets the current page we are showing
     * @returns {Page}
     */
    getCurrentPage() {
        return this._currentPage;
    }

    /**
     * Navigates to the given page
     * @param {Page} page page to navigate to
     * @param loadParams other params for the page loading
     */
    navigateToPage(page, ...loadParams) {
        this.loadAndRenderPage(page, ...loadParams);
        this._router.saveState(this._currentPage);
    }

    /**
     * Updates the saved state for the current page in the browser history
     */
    updateCurrentSavedState() {
        this._router.replaceState(this._currentPage);
    }

    /**
     * Loads and renders the given page. The difference with navigateToPage
     * is that this one does not save the state in the history.
     * @param {Page} page
     * @param loadParams other params for the page loading
     */
    loadAndRenderPage(page, ...loadParams) {
        if(!page) {
            console.log("Error in loadAndRenderPage, no page.");
            return;
        }

        page.load(...loadParams);
        if(page.displayNav) {
            this._nav.setTitle(page.title);
            this._nav.show();
        } else {
            this._nav.hide();
        }
        this.clearContainer();
        page.render(this._container);
        this._currentPage = page;
    }

    /**
     * Gets the container for the pages to render on
     * @return {Element}
     */
    getContainer() {
        return this._container;
    }

    /**
     * Clears the application container
     */
    clearContainer() {
        // This seems to be the fastest method to clear it
        let cNode = this._container.cloneNode(false);
        this._container.parentNode.replaceChild(cNode, this._container);
        this._container = cNode;
    }
}