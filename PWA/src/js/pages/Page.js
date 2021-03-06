/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * A page of our application
 * @abstract
 */
class Page {
    /**
     * @param {string} title        - The title to display when we are in the page
     * @param {boolean} displayNav  - Display the navigation bar?
     * @param {PageState} [state]     - Not used by now
     * @abstract
     */
    constructor(title, displayNav, state) {
        /**
         * The app in which the page is running
         */
        this.app = App.getInstance();
        /**
         * The title of the page
         * @type {string}
         */
        this.title = title;
        /**
         * It indicates whether it should display the navigation bar or not
         * @type {boolean}
         */
        this.displayNav = displayNav;
        /**
         * Indicates if the page is visible or not
         * @type {boolean}
         * @private
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
     * Called when the page is changed by another.
     */
    onHide() {
        this._visible = false;
        this.app.getContainer().removeEventListener('scroll', this._scrollHandler);
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
     * @return {Number}
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
           pageClass: null,
           hash: null,
           scroll: 0
       };
    }
}
/**
 * PageState
 * @typedef {Object} PageState
 * @property {?string} pageClass
 * @property {?string} hash
 * @property {number} scroll - Used by the router to reset the scroll, the router will overwrite it
 */