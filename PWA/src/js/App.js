(function(app4refs) {
    /**
     * App class, this is the main class of our application
     * @constructor
     */
    app4refs.App = function() {
        /**
         * Navigation bar
         * @type {app4refs.NavBar}
         */
        this.nav = new app4refs.NavBar();
        /**
         * Currently displayed page
         * @type {app4refs.Page}
         */
        this.currentPage = new app4refs.HomePage();
    };

    app4refs.App.prototype.navigateToPage = function(page, loadParams) {

    };

})(window.app4refs = window.app4refs || {});