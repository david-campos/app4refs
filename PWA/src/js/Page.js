(function(app) {
    app.Page = function(parent, title, displayNav, renderingCallback) {
        this.parent = parent;
        this.title = title;
        this.displayNav = displayNav;
        this.renderingCallback = renderingCallback;
    };
})(window.app = window.app || {});