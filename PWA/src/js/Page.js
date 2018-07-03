(function(app4refs) {
    /**
     * Page constructor, constructs a page
     *
     * @class
     * @classdesc A page of our application
     *
     * @param {app4refs.Page} parentPage    - The parent page to go when pressing back
     * @param {string} title                - The title to display when we are in the page
     * @param {boolean} displayNav          - Display the navigation bar?
     * @constructor
     * @abstract
     */
    app4refs.Page = function(parentPage, title, displayNav) {
        this.parentPage = parentPage;
        this.title = title;
        this.displayNav = displayNav;
    };

    app4refs.Page.prototype.load = function() {

    };

    /**
     * Called to render the page
     * @abstract
     */
    app4refs.Page.prototype.render = function() {
        throw new Error('Page::render must be implemented!');
    };

    /**
     * Called when the viewport is resized
     * @param {int} width   - The new width of the viewport
     * @param {int} height  - The new height of the viewport
     * @abstract
     */
    app4refs.Page.prototype.resize = function(width, height) {
        throw new Error('Page::resize must be implemented!');
    };

    /**
     * Called when the page is destroyed. The default implementation
     * does nothing.
     */
    app4refs.Page.prototype.destroy = function() {};
})(window.app4refs = window.app4refs || {});