/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * A page of our application
 * @abstract
 */
class Page {
    /**
     * @param {App} app             - The app in which the page is running
     * @param {Page} parentPage     - The parent page to go when pressing back
     * @param {string} title        - The title to display when we are in the page
     * @param {boolean} displayNav  - Display the navigation bar?
     * @param {PageState} [state]     - If present, the other parameters will be ignored and taken from the state (except
     * the parent page ).
     * @abstract
     */
    constructor(app, parentPage, title, displayNav, state) {
        /**
         * The app in which the page is running
         */
        this.app = app;
        /**
         * Parent page of this page, it was used to get back to the previous one,
         * it might be necessary in browser which don't support history
         * @type {Page}
         */
        this.parentPage = parentPage;
        /**
         * The title of the page
         * @type {string}
         */
        this.title = state ? state.title : title;
        /**
         * It indicates whether it should display the navigation bar or not
         * @type {boolean}
         */
        this.displayNav = state ? state.displayNav : displayNav;
        /**
         * Indicates if the page is visible or not
         * @type {boolean}
         */
        this._visible = false;
    };

    /**
     * Called when the page is loaded, it can receive parameters from the previous page.
     * The default implementation does nothing.
     * @param loadingParams - Parameters sent by the previous page
     */
    load(...loadingParams) {}

    /**
     * Called to render the page
     * @param {Element} container - The container node to render pages in
     * @abstract
     */
    render(container) {
        this._visible = true;
    }

    /**
     * Called when the viewport is resized
     * @param {int} width   - The new width of the viewport
     * @param {int} height  - The new height of the viewport
     * @abstract
     */
    resize(width, height) {}

    /**
     * Called when the page is changed by another. The default implementation
     * does nothing.
     */
    onHide() {
        this._visible = false;
    }

    /**
     * Returns the height available for the page (discounting already the nav
     * if present and the top and bottom paddings)
     * @return {Number}
     */
    getPageHeight() {
        let nav = this.app.getNav().element;
        let container = this.app.getContainer();
        if(container && nav) {
            let styleNav = window.getComputedStyle(nav);
            let styleContainer = window.getComputedStyle(container);
            let heightNav = parseInt(styleNav.height);
            if(this.app.getNav().isHidden()) {
                heightNav = 0;
            }
            let paddingTop = parseInt(styleContainer.paddingTop);
            let paddingBottom = parseInt(styleContainer.paddingBottom);
            return window.innerHeight - heightNav - paddingTop - paddingBottom;
        } else {
            return 0;
        }
    }

    /**
     * Returns the width available for the page
     */
    getPageWidth() {
        let container = this.app.getContainer();
        if(container) {
            let style = window.getComputedStyle(container);
            return parseInt(style.width) - parseInt(style.paddingLeft) - parseInt(style.paddingRight);
        } else {
            return 0;
        }
    }

    /**
     * Returns whether the page is visible or not currently
     * @return boolean
     */
    isVisible() {
        return this._visible;
    }

    /**
     * Gets the state of the page to save. Should be overloaded
     * by the classes extending this one.
     * @return {PageState}
     */
    getState() {
       return {
           title: this.title,
           displayNav: this.displayNav
       };
    }
}
/**
 * PageState
 * @typedef {Object} PageState
 * @property {string} title
 * @property {boolean} displayNav
 */