/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * App class, this is the main class of our application. Singleton class.
 */
class App {
    /**
     * It will always return the same instance because of singleton pattern
     * @return {App}
     */
    constructor() {
        if(!App._instance) {
            App._instance = this;

            /**
             * Navigation bar
             * @type {NavBar}
             * @private
             */
            this._nav = new NavBar();
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
            this._router = new Router();
            /**
             * Indicates if the Maps Api is available already to be used or not yet.
             * @type {boolean}
             * @private
             */
            this._mapsAvailable = false;

            window.onpopstate = (...x) => this._router.onStatePopping(...x);
            window.addEventListener('resize', (e) => this._currentPage.resize(innerWidth, innerHeight));
            window[INIT_MAP_FUNCTION_NAME] = () => this.setMapsAvailable();
        }

        return App._instance;
    }

    /**
     * Gets the singleton instance of the App
     * @return {App}
     */
    static getInstance() {
        return new App();
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
     * @param {Page} page - The page to navigate to
     * @param loadParams - Some other params for the page loading
     */
    navigateToPage(page, ...loadParams) {
        this.loadAndRenderPage(page, ...loadParams);
        this._router.savePage(this._currentPage);
    }

    /**
     * Stores in the story a navigation to a page state,
     * but it does not navigate anywhere.
     * @param {PageState} state - The state to save
     * @param {string} [title] - Optional title
     * @param {string} [url] - Optional url
     */
    fakeNavigation(state, title, url) {
        this._router.saveState(state, title, url);
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

        // Hide the previous page
        if(this._currentPage) {
            this._currentPage.onHide();
        }

        this._currentPage = page;

        page.load(...loadParams);
        if(page.displayNav) {
            this._nav.setStyle(NAVBAR_STYLES.DEFAULT);
            this._nav.setTitle(page.title);
            this._nav.show();
        } else {
            this._nav.hide();
        }
        this.clearContainer();
        page.render(this._container);
    }

    /**
     * Gets the container for the pages to render on
     * @return {Element}
     */
    getContainer() {
        return this._container;
    }

    /**
     * Gets the nav of the application
     * @return {NavBar}
     */
    getNav() {
        return this._nav;
    }

    /**
     * Clears the application container
     */
    clearContainer() {
        // This seems to be the fastest method to clear it
        let cNode = this._container.cloneNode(false);
        this._container.parentNode.replaceChild(cNode, this._container);
        this._container = cNode;
        // Remove also possible styling from previous page
        this._container.removeAttribute("style");
    }

    /**
     * Sets the availability of the Maps Api to true
     */
    setMapsAvailable() {
        this._mapsAvailable = true;
        if(this._mapsCallback) {
            this._mapsCallback();
        }
    }

    /**
     * Requires the Maps API and calls the callback
     * when the api is available, calling it inmediatly
     * if it is already available
     * @param {Function} callback
     */
    requireMapsApi(callback) {
        if(this._mapsAvailable) {
            callback();
        } else {
            // We use _mapsCallback to save the callback
            this._mapsCallback = callback;
            // We load the map api adding an script like the following one to the document:
            //<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
            // async defer></script>
            let mapsApiElement = document.createElement("script");
            mapsApiElement.setAttribute("src", ResourcesProvider.getMapsApiUrl());
            mapsApiElement.setAttribute("async", "");
            mapsApiElement.setAttribute("defer", "");
            document.body.appendChild(mapsApiElement);
        }
    }
}