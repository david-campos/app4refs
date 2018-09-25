/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Home page of the app, displayed when entering the app and when clicking the home button on the navigation bar
 */
class HomePage extends GridPage {
    constructor() {
        let icons = {};
        for(let key of ITEM_TYPES) {
            icons[key] = ResourcesProvider.getMainMenuIconUrl(key);
        }

        /**
         * @param {string} id - id of the clicked icon
         */
        let iconClicked = (id) => {
            if(id === 'emergency') {
                App.getInstance().navigateToPage(new EmergencyPage());
            } else {
                App.getInstance().navigateToPage(new CategoriesGridPage(id));
            }
        };

        super(2, icons, iconClicked, "", false);
    }

    getState() {
        return super.getState(); // It will instance the home screen when "unknown"
    }
}