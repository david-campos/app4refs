/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const PHONE_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"phone\" class=\"svg-inline--fa fa-phone fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z\"></path></svg>";
const EMERGENCY_PAGE_CLASS = "EmergencyPage";

/**
 * This page shows a button to call the emergency services
 */
class EmergencyPage extends Page {
    /**
     * @param {EmergencyPageState} [state]
     */
    constructor(state) {
        super("Emergencies", true, state);
        this.savedBackground = document.body.style.background;
    }

    render(container) {
        super.render(container);
        this.app.getNav().setStyle(NAVBAR_STYLES.ONLY_BACK);
        container.innerHTML = `<p class='emergency-p'>112</p><a class='emergency-btn' href="tel:112">${PHONE_SVG}</a>`;
        this.savedBackground = document.body.style.background;
        document.body.style.background = "#F13539";
    }

    onHide() {
        super.onHide();
        document.body.style.background = this.savedBackground;
    }

    getState() {
        let state = super.getState();
        state.pageClass = EMERGENCY_PAGE_CLASS;
        return state;
    }

    /**
     * @param {EmergencyPageState} state
     */
    static fromState(state) {
        if(state.pageClass !== EMERGENCY_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${EMERGENCY_PAGE_CLASS}"`);
        }
        return new EmergencyPage(state);
    }
}
/**
 * @typedef {PageState} EmergencyPageState
 */