(function(app) {
    app.GridPage = function(parent, title, displayNav, cols, buttons) {
        app.Page.call(this, parent, title, displayNav, function(){
            app.drawGridOfIcons(cols, buttons);
        });
    }
})(window.app = window.app || {});