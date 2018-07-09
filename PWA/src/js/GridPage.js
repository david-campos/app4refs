/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * GridPage is a page with a grid kind of layout. It displays an array of icons
 * in a grid and allows clicking on them.
 */
class GridPage extends Page {
    /**
     * @param {int}           columns        - Number of columns in the display
     * @param {{string}}      icons          - Associative array with an id for each icon and the route to the icon
     * @param {GridPage~ClickCallback} clickCallback  - Callback for item clicking
     * @param {Page}          parentPage     - Parent page to go back when pressing "back"
     * @param {string}        title          - Title to show in the nav bar
     * @param {boolean}       displayNav     - Decides whether we should display the nav bar or not
     * @param {GridPageState} [state] - The state to restore, if present the parameters in the state will replace
     * the ones passed (the passed ones will be ignored).
     */
    constructor(columns, icons, clickCallback, parentPage, title, displayNav, state) {
        super(parentPage, title, displayNav, state);
        /**
         * Number of columns for the display
         * @type {Number}
         */
        this._columns = state ? state.columns : columns;
        /**
         * Associative array of the icon urls where the key is an id for the icon (used on click callback)
         * @type {{string}}
         */
        this._icons = state ? state.icons : icons;
        /**
         * Callback to call when icons are clicked
         * @type {GridPage~ClickCallback}
         */
        this._clickCallback = clickCallback;
        /**
         * Main row of the grid (if created)
         * @type {Element|null}
         * @private
         */
        this._mainRow = null;
    }

    render(container) {
        // Creating the mainRow
        this._mainRow = document.createElement("div");
        this._mainRow.setAttribute("class", "row grid-page-main");
        // Create grid
        container.appendChild(this._mainRow);
        this._drawGridOfIcons();
        this._generateEventListeners();
    }

    /**
     * Changes the icons (it does not render the page!)
     * @param {{string}} newIcons - The new icons to set the page to, render should be called after for them to be displayed
     */
    changeIcons(newIcons) {
        this._icons = newIcons;
    }

    /**
     * Changes the callback to be called when an icon is clicked.
     * @param {GridPage~ClickCallback} clickcallback - The new callback to be called
     */
    setClickCallback(clickcallback) {
        this._clickCallback = clickcallback;
    }

    /**
     * Draws the grid of icons
     * @private
     */
    _drawGridOfIcons() {
        if(!this._mainRow) return;

        const rows = this._icons.length / this._columns;
        const colW = 12 / this._columns; // width is relative to 12 as it will be set with bootstrap grid
        const heightPerc = 100.0 / rows; // height is in percantage

        // Draw all divs at once (it is more efficient)
        let html = '';
        for(let [id, icon] of Object.entries(this._icons)) {
            html += `<div class="col-${colW} btn" data-id="${id}" style="background-image: url(${icon});"></div>`;
        }
        this._mainRow.innerHTML = html;
    }

    /**
     * With the icon grid generated, it associates the clickCallback to them
     * @private
     */
    _generateEventListeners() {
        if(!this._mainRow) return;

        let self = this;
        for(let iconDiv of this._mainRow.childNodes) {
            iconDiv.addEventListener('click', (e)=>{this._onClick.call(self, e);});
        }
    }

    /**
     * Callback called internally when an icon in the grid is clicked
     * @param {MouseEvent} event
     * @private
     */
    _onClick(event) {
        let id = event.currentTarget.getAttribute("data-id");
        this._clickCallback(id);
    }

    /**
     * @inheritDoc
     * @return {GridPageState}
     */
    getState() {
        let state = super.getState();
        state.columns = this._columns;
        state.icons = this._icons;
        return state;
    }
}

/**
 * @callback GridPage~ClickCallback
 * @param {string} iconId - the id of the clicked icon
 */
/**
 * GridPageState is mean to save the state of a GridPage
 * @typedef {PageState} GridPageState
 * @property {int} columns
 * @property {{string}} icons
 */