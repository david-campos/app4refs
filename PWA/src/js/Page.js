/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * A page of our application
 * @abstract
 */
class Page {
    /**
     * @param {Page} parentPage     - The parent page to go when pressing back
     * @param {string} title        - The title to display when we are in the page
     * @param {boolean} displayNav  - Display the navigation bar?
     * @param {PageState} [state]     - If present, the other parameters will be ignored and taken from the state (except
     * the parent page ).
     * @abstract
     */
    constructor(parentPage, title, displayNav, state) {
        this.parentPage = parentPage;
        this.title = state ? state.title : title;
        this.displayNav = state ? state.displayNav : displayNav;
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
        throw new Error('Page::render must be implemented!');
    }

    /**
     * Called when the viewport is resized
     * @param {int} width   - The new width of the viewport
     * @param {int} height  - The new height of the viewport
     * @abstract
     */
    resize(width, height) {
        throw new Error('Page::resize must be implemented!');
    }

    /**
     * Called when the page is destroyed. The default implementation
     * does nothing.
     */
    destroy() {}

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