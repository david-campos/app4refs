/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * The Router class is defined to manage the URLs of the API.
 * @abstract
 */
class Router {
    constructor() {
        if(history.state) {
            this.onStatePopping({state: history.state});
        } else {
            this._onLocation(location.hash);
        }
    }

    /**
     * Saves the given page in the history
     * @param {Page} page
     */
    savePage(page) {
        this.saveState(page.getState(), page.title);
    }

    /**
     * Saves the given state in the history
     * @param {PageState} state
     * @param {string} [title]
     */
    saveState(state, title) {
        // We save the scroll to restore it
        state.scroll = App.getInstance().getContainer().scrollTop;
        history.pushState(state, title, this._urlFor(state));
    }

    /**
     * Sometimes the pages need to update their saved state,
     * this is the function for it
     * @param {Page} page
     */
    replaceState(page) {
        let state = page.getState();
        // We need to save the scroll to restore it
        state.scroll = App.getInstance().getContainer().scrollTop;
        history.replaceState(state, page.title, this._urlFor(state));
    }

    /**
     * Should be linked to window.onpopstate, as it is able to handle
     * these events.
     * @param {{state: PageState|null}} event
     */
    onStatePopping(event) {
        if(event.state) {
            let page;
            switch(event.state.pageClass) {
                case CATEGORIES_GRID_PAGE_CLASS:
                    page = CategoriesGridPage.fromState(event.state);
                    break;
                case LIST_PAGE_CLASS:
                    page = ListPage.fromState(event.state);
                    break;
                case MAP_PAGE_CLASS:
                    page = MapPage.fromState(event.state);
                    break;
                case EMERGENCY_PAGE_CLASS:
                    page = EmergencyPage.fromState(event.state);
                    break;
                default:
                    page = new HomePage();
                    break;
            }
            if(page) {
                App.getInstance().loadAndRenderPage(page);
                // Restore saved scroll
                App.getInstance().getContainer().scrollTop = event.state.scroll;
            }
        } else {
            this._onLocation(location.hash);
        }
    }

    /**
     * Gets the URL for the given state
     * @param {PageState} state
     * @return {string}
     * @private
     */
    _urlFor(state) {
        if(state.hash) {
            return `#${encodeURI(state.pageClass)}:${encodeURI(state.hash)}`;
        } else if(state.pageClass) {
            return `#${encodeURI(state.pageClass)}`;
        } else {
            // Delete hash
            let url = window.location.href;
            let hash = window.location.hash;
            let index_of_hash = url.indexOf(hash) || url.length;
            return url.substr(0, index_of_hash);
        }
    }

    /**
     * Called by the constructor when there is a hash in the URL.
     * It suggests a page to navigate to but navigates to HomePage first.
     * @param {string|null} urlHash - the hash in the URL or an expresion evaluating to false to load the home page
     * @private
     */
    _onLocation(urlHash) {
        App.getInstance().loadAndRenderPage(new HomePage());
        if(urlHash) {
            let matchs = /^#([^:]+)(:(.*))?$/.exec(urlHash);
            if(matchs) {
                let page = null;
                let className = decodeURI(matchs[1]);
                let stateHash = null;
                if(matchs.length === 4) {
                    stateHash = decodeURI(matchs[3]);
                }
                switch(className) {
                    case CATEGORIES_GRID_PAGE_CLASS:
                        page = CategoriesGridPage.navigateFromHash(stateHash);
                        break;
                    case LIST_PAGE_CLASS:
                        page = ListPage.navigateFromHash(stateHash);
                        break;
                    case MAP_PAGE_CLASS:
                        page = MapPage.navigateFromHash(stateHash);
                        break;
                    case EMERGENCY_PAGE_CLASS:
                        page = EmergencyPage.navigateFromHash(stateHash);
                        break;
                }
            } else {
                console.error("Incorrect hash format");
            }
        }
    }
}