/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class CategoriesGridPage extends GridPage {
    /**
     * @param {App} app - The app the page is running on
     * @param {Page} home - Home page to go back
     * @param {string} title - Title for the page
     * @param {string} itemType - Item-type of the categories we should display
     */
    constructor(app, home, title, itemType) {
        let icons = {}; // TODO: Get icons from the cache and try to get from API (update)

        /**
         * @param {string} id - id of the clicked icon
         */
        let categoryClicked = (id) => {
            alert(id);
        };

        super(
            (itemType==='service'?3:2), // services is displayed in 3 cols
            icons, categoryClicked, home, title, true);
    }
}