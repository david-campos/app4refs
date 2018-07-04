/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Titles for the subpages based on the item-type
 * @type {{info: string, help: string, service: string, leisure: string, link: string, emergency: string}}
 */
const TITLES = {
    'info': 'Info',
    'help': 'Help',
    'service': 'Services',
    'leisure': 'Leisure',
    'link': 'Links',
    'emergency': 'Emergency' // no bar
};

/**
 * Home page of the app, displayed when entering the app and when clicking the home button on the navigation bar
 */
class HomePage extends GridPage {
    /**
     * @param {App} app
     */
    constructor(app) {
        let icons = {};
        for(let [key, val] of Object.entries(TITLES)) {
            icons[key] = ResourcesProvider.getMainMenuIconUrl(key);
        }

        /**
         * @param {string} id - id of the clicked icon
         */
        let iconClicked = (id) => {
            switch(id) {
                case 'leisure':
                case 'info':
                case 'service':
                case 'link':
                    app.navigateToPage(new CategoriesGridPage(app, this, TITLES[id], id));
                    break;
                case 'help':
                    // help is special cause each category leads directly to the first item
                    // without a intermediate list
                    break;
                case 'emergency':
                    // emergency page
                    break;
            }
        };
        super(2, icons, iconClicked, null, "App4Refs", false);
    }
}