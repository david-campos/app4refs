/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Home page of the app, displayed when entering the app and when clicking the home button on the navigation bar
 */
class HomePage extends GridPage {
    constructor() {
        let icons = {
            'info': 'ico/mainmenu/infonew.png',
            'help': 'ico/mainmenu/helpnew.png',
            'services': 'ico/mainmenu/servicesnew2.png',
            'leisure': 'ico/mainmenu/leisurenew.png',
            'internet': 'ico/mainmenu/ser-internet.png',
            'emergency': 'ico/mainmenu/emergency.png'
        };
        /**
         * @param {string} id - id of the clicked icon
         */
        let iconClicked = (id) => {
            // TODO: navigate to corresponding page
            alert(id);
        };
        super(2, icons, iconClicked, null, "App4Refs", false);
    }
}