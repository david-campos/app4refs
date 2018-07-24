/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class we have to add to the body to hide the navigation bar
 * @type {string}
 */
const BODY_NO_NAV_CLASS = "noNav";

/**
 * Valid navbar styles for the set style function
 * @type {{DEFAULT: NavbarStyle, ONLY_BACK: NavbarStyle}}
 */
const NAVBAR_STYLES = {
    DEFAULT: "",
    ONLY_BACK: "only-back"
};

/**
 * The navigation bar of the app
 */
class NavBar {
    /**
     * The constructor of the navbar searches for the elements in the DOM
     * to save the references and create the event listeners.
     */
    constructor() {
        this.element = document.getElementById("app-nav");
        this.backBtn = document.getElementById("nav-back-btn");
        this.titleElement = document.getElementById("nav-title");
        this.homeBtn = document.getElementById("nav-home-btn");

        let self = this;
        this.backBtn.addEventListener('click', ()=>self.back());
        this.homeBtn.addEventListener('click', ()=>self.home());
    }

    /**
     * Changes the title displayed in the navigation bar
     * @param {string} text - The new title to display
     */
    setTitle(text) {
        this.titleElement.innerHTML = text.htmlEscape();
    }

    /**
     * Sets the navbar style to the spacified one. The valid ones are the ones
     * in NAVBAR_STYLES.
     * @param {NavbarStyle} style
     */
    setStyle(style) {
        if(this.element.className !== style) {
            this.element.className = style;
        }
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
     * Returns whether the nav bar is hidden or not
     * @return {boolean} - True if it is hidden
     */
    isHidden() {
        return document.body.classList.contains(BODY_NO_NAV_CLASS);
    }

    /**
     * Navigates back to the parent page of the currently displayed one.
     * It is associated to the click on the "back" button.
     */
    back() {
        history.back();
    }

    /**
     * Navigates back to the home page. It is associated to the "home" button in the navbar.
     */
    home() {
        App.getInstance().navigateToPage(new HomePage());
    }
}
/**
 * @typedef {string} NavbarStyle
 */