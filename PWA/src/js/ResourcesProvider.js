/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Extension for the icon images
 * @type {string}
 */
const RP_ICON_IMG_EXTENSION = "png";

/**
 * Folder where all the icons are saved
 * @type {string}
 */
const RP_ICONS_DIR = "ico";
/**
 * Directory where the main menu items are saved inside RP_ICONS_DIR
 * @type {string}
 */
const RP_MAIN_MENU_DIR = "mainmenu";
/**
 * Folder where the cost and language icons are saved
 * @type {string}
 */
const RP_COST_AND_LANG_DIR = "costandlanguage";

/**
 * Folder where the map icons are saved
 * @type {string}
 */
const RP_MAPS_DIR = "map";

/**
 * Directory to find, inside RP_ICONS_DIR, the icons for the items
 * @type {string}
 */
const RP_ITEM_ICONS_DIR = "items";

/**
 * Folder where the categories icons are saved (each one in its item-type folder)
 * @type {string}
 */
const RP_CATEGORIES_DIR = "categories";

/**
 * Name of the spritesheet file for the map
 * @type {string}
 */
const RP_MAP_SPRITESHEET = "sprite";

/**
 * Main menu icons names
 * @type {{info: string, help: string, service: string, leisure: string, link: string, emergency: string}}
 */
const RP_MAIN_MENU_ICONS = {
    'info': 'infonew',
    'help': 'helpnew',
    'service': 'servicesnew2',
    'leisure': 'leisurenew',
    'link': 'ser-internet',
    'emergency': 'emergency'
};

/**
 * Filename of the icon for the all items map button
 * @type {string}
 */
const RP_ALL_ITEMS_MAP_ICON = "all_items_map";

const MAPS_API_URL = "https://maps.googleapis.com/maps/api/js";
const MAPS_API_KEY = "AIzaSyCxqSnpE46I8g-m4pQBkx4yC3R3X6s75BQ"; // Just a testing api key for the alpha
const INIT_MAP_FUNCTION_NAME = 'initMap';

let glob_rp_base_url = null;

/**
 * Resource provider, it provides the needed resources for the app (the URLs). It
 * shouldn't be instantiated.
 * @abstract
 */
class ResourcesProvider {
    static getBaseUrl() {
        if(glob_rp_base_url === null) {
            if ((typeof RESOURCE_BASE_URL) === 'undefined') {
                console.log("Warning in ResourceProvider: RESOURCE_BASE_URL has not been defined, an empty string will be used instead.");
            }

            glob_rp_base_url = ResourcesProvider._clearBaseUrl((typeof RESOURCE_BASE_URL !== 'undefined') ? RESOURCE_BASE_URL : '');
        }
        return glob_rp_base_url;
    }

    /**
     * Gets the URL for a icon of the main menu
     * @param {string} iconIdent - The icon identifier
     * @return {string}
     */
    static getMainMenuIconUrl(iconIdent) {
        let chosenIcon = "unknown";
        if (iconIdent in RP_MAIN_MENU_ICONS) {
            chosenIcon = RP_MAIN_MENU_ICONS[iconIdent];
        }
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_MAIN_MENU_DIR}/${chosenIcon}.${RP_ICON_IMG_EXTENSION}`;
    }

    /**
     * Gets the url of the icon for the given category
     * @param {string} categoryCode - The code of the category we want to get the icon for
     * @return {string}
     */
    static getCategoryIconUrl(categoryCode) {
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_CATEGORIES_DIR}/${categoryCode}.${RP_ICON_IMG_EXTENSION}`;
    }

    /**
     * Gets the url of the icon for the given cost
     * @param {string} cost - 'free' or 'pay'
     * @return {string}
     */
    static getCostIconUrl(cost) {
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_COST_AND_LANG_DIR}/${cost}.${RP_ICON_IMG_EXTENSION}`;
    }

    /**
     * Gets the url of the icon for the given language
     * @param {string} language - The language
     * @return {string}
     */
    static getLanguageIconUrl(language) {
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_COST_AND_LANG_DIR}/${language}.${RP_ICON_IMG_EXTENSION}`;
    }


    /**
     * Gets the url for the icon of the item.
     * @param {Item} item - The item
     * @return {string}
     */
    static getItemIconUrl(item) {
        let relUrl = item.iconUri;
        if(!relUrl || relUrl === "") {
            // If we have no iconUri, take the name in lowercase and replace spaces by nothing, adding .jpg
            relUrl = item.name.toLowerCase();
            while(/\(|\)|\s|\?|-|"|\./.test(relUrl))
                relUrl = relUrl.replace(/\(|\)|\s|\?|-|"|\./, "");
            relUrl +=  ".jpg";
        }
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_ITEM_ICONS_DIR}/${relUrl}`;
    }

    /**
     * Gets the icon for the "All items map" button
     * @return {string}
     */
    static getAllMapsIconUrl() {
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_COST_AND_LANG_DIR}/${RP_ALL_ITEMS_MAP_ICON}.${RP_ICON_IMG_EXTENSION}`;
    }

    /**
     * Gets the Maps URL
     * @return {string}
     */
    static getMapsApiUrl() {
        // https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap
        return `${MAPS_API_URL}?key=${MAPS_API_KEY}&callback=${INIT_MAP_FUNCTION_NAME}`;
    }

    /**
     * Gets the url to find the map spritesheet
     * @return {string}
     */
    static getMapsSpritesheetUrl() {
        return `${ResourcesProvider.getBaseUrl()}${RP_ICONS_DIR}/${RP_MAPS_DIR}/${RP_MAP_SPRITESHEET}.${RP_ICON_IMG_EXTENSION}`;
    }

    /**
     * Clears the BaseUrl so it is ok to use
     * @param {string} url
     * @return {string}
     * @private
     */
    static _clearBaseUrl(url) {
        url = url.trim();

        if(url === "")
            return "";

        while(url.endsWith("/")) {
            url = url.substring(0, url.length - 1);
        }
        return url + "/";
    }
}