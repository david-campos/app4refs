/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const HOME_ICONS = [
    'info',
    'help',
    'service',
    'leisure',
    'link',
    'emergency'
];

/**
 * Home page of the app, displayed when entering the app and when clicking the home button on the navigation bar
 */
class HomePage extends GridPage {
    /**
     * @param {App} app
     */
    constructor(app) {
        let icons = {};
        for(let key of HOME_ICONS) {
            icons[key] = ResourcesProvider.getMainMenuIconUrl(key);
        }

        /**
         * @param {string} id - id of the clicked icon
         */
        let iconClicked = (id) => {
            if(id === 'emergency') {
                app.navigateToPage(new EmergencyPage(app));
            } else {
                app.navigateToPage(new CategoriesGridPage(app, id));
            }
        };

        super(app, 2, icons, iconClicked, "App4Refs", false);
    }

    getState() {
        return super.getState(); // It will instance the home screen when "unknown"
    }
}