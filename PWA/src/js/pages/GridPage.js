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
     * @param {string}        title          - Title to show in the nav bar
     * @param {boolean}       displayNav     - Decides whether we should display the nav bar or not
     * @param {GridPageState} [state] - The state to restore, if present the parameters in the state will replace
     * the ones passed (the passed ones will be ignored).
     */
    constructor(columns, icons, clickCallback, title, displayNav, state) {
        super(title, displayNav, state);
        /**
         * Number of columns for the display
         * @type {Number}
         * @private
         */
        this._columns = state ? state.columns : columns;
        /**
         * Associative array of the icon urls where the key is an id for the icon (used on click callback)
         * @type {{string}}
         * @private
         */
        this._icons = state ? state.icons : icons;
        /**
         * Callback to call when icons are clicked
         * @type {GridPage~ClickCallback}
         * @private
         */
        this._clickCallback = clickCallback;
        /**
         * Main row of the grid (if created)
         * @type {Element|null}
         * @private
         */
        this._mainRow = null;
        /**
         * Internal check of "landscape", if width is greater than height
         * @type {boolean}
         * @private
         */
        this._portrait = (window.innerWidth <= window.innerHeight);
    }

    render(container) {
        super.render(container);

        // Creating the mainRow
        this._mainRow = document.createElement("div");
        this._mainRow.setAttribute("class", "row grid-page-main");
        // Create grid
        container.appendChild(this._mainRow);
        this._drawGridOfIcons();
        this._generateEventListeners();
    }

    resize(width, height) {
        super.resize(width, height);
        let newLandscape = (width <= height);
        let landscapeChanged = (newLandscape !== this._portrait);
        this._portrait = newLandscape;
        if(landscapeChanged) {
            this.app.clearContainer();
            this.render(this.app.getContainer());
        }
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

        // width is relative to 12 as it will be set with bootstrap grid
        let colW = 12 / this._columns;

        // When not in landscape, change the grid
        if(!this._portrait) {
            colW = 12 / this._landscapeColumns();
        }

        if(colW !== Math.round(colW)) {
            throw new Error("Unable to draw grid, number of columns is not a divisor of 12");
        }

        // Draw all divs at once (it is more efficient)
        let html = '';
        for(let [id, icon] of Object.entries(this._icons)) {
            html += `<button class="col-${colW} btn" data-id="${id}" style="background-image: url(${icon});"></button>`;
        }
        this._mainRow.innerHTML = html;
        //this._changeIconsHeight(this.getPageHeight());
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
     * Indicates how many columns we have in landscape display
     * @return {int}
     * @private
     */
    _landscapeColumns() {
        let rows = Object.keys(this._icons).length / this._columns;
        if(rows <= 3) {
            return rows;
        } else {
            return 4; // Never more than 4
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