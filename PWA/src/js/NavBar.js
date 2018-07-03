/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class we have to add to the body to hide the navigation bar
 * @type {string}
 */
const BODY_NO_NAV_CLASS = "noNav";

/**
 * The navigation bar of the app
 */
class NavBar {
    /**
     * The constructor of the navbar searches for the elements in the DOM
     * to save the references and create the event listeners.
     * @param {App} app - The app in which the nav bar is working
     */
    constructor(app) {
        this.app = app;
        this.element = document.getElementById("app-nav");
        this.backBtn = document.getElementById("nav-back-btn");
        this.titleElement = document.getElementById("nav-title");
        this.homeBtn = document.getElementById("nav-home-btn");

        this.backBtn.addEventListener('click', this._back);
        this.homeBtn.addEventListener('click', this._home);
    }

    /**
     * Changes the title displayed in the navigation bar
     * @param {string} text - The new title to display
     */
    setTitle(text) {
        this.titleElement.innerHTML = text.htmlEscape();
    }

    /**
     * Shows the navigation bar (removing the body class BODY_NO_NAV_CLASS)
     */
    show() {
        document.body.classList.remove(BODY_NO_NAV_CLASS);
    }

    /**
     * Hides the navigation bar (adding the body class BODY_NO_NAV_CLASS)
     */
    hide() {
        document.body.classList.add(BODY_NO_NAV_CLASS);
    }

    /**
     * Navigates back to the parent page of the currently displayed one.
     * It is associated to the click on the "back" button.
     * @private
     */
    _back() {
        let parentPage = this.app.getCurrentPage().parentPage;
        if(parentPage !== null) {
            this.app.navigateToPage(parentPage);
        }
    }

    /**
     * Navigates back to the home page. It is associated to the "home" button in the navbar.
     * @private
     */
    _home() {
        this.app.navigateToPage(new HomePage());
    }
}