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

        this.navigateToPage(new HomePage(this));
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