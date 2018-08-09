/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * This class displays a panel allowing the user to see the directions
 * for the current route or to choose another transporting method.
 */
class DirectionsPanel {
    /**
     * @param {Element} container - The container to construct the panel into
     */
    constructor(container) {
        /**
         * The container the panel is constructed into
         * @type {Element}
         * @private
         */
        this._container = container;

        this._container.innerHTML = `
            <ul id="dir-pan-travel-types">
            <li>WALKING</li>
            <li>CAR</li>
            <li>TRANSIT</li></ul>
            <div id="dir-pan-travel-instr"></div>
        `;

        let tabsElements = this._container.querySelectorAll("li");

        /**
         * Each of the tabs of the panel
         * @type {Map<Element,TravelMode>}
         * @private
         */
        this._tabs = new Map([
            [tabsElements[0], TRAVEL_MODE_WALKING],
            [tabsElements[1], TRAVEL_MODE_DRIVING],
            [tabsElements[2], TRAVEL_MODE_TRANSIT]
        ]);

        tabsElements.forEach((v)=>v.addEventListener('click', (e)=>this._tabClicked(e)));

        /**
         * The container for the instructions of the directions to display
         * @type {Element}
         * @private
         */
        this._instructionsContainer = this._container.querySelector("#dir-pan-travel-instr");
        /**
         * The callback to be call when the mode is changed
         * @type {?DirectionsPanel#TravelModeChangedListener}
         * @private
         */
        this._modeChangeCallback = null;
    }

    /**
     * Clears the panel instructions
     */
    clear() {
        this._instructionsContainer.innerHTML = "";
    }

    /**
     * Shows the panel
     */
    show() {
        this._container.scrollTop = 0;
        this._container.style.bottom = "0";
    }

    /**
     * Hides the panel
     */
    hide() {
        this._container.style.bottom = "-50vh";
    }

    /**
     * Toggles the visibility of the panel
     */
    toggle() {
        if (this.isHidden()) this.show();
        else this.hide();
    }

    isHidden() {
        return parseInt(this._container.style.bottom) !== 0;
    }

    /**
     * Shows the tab corresponding to the given
     * travel mode as the active one
     * @param {TravelMode} travelMode
     */
    selectedTravelMode(travelMode) {
        this._tabs.forEach((v,k)=>{
            k.classList.remove('active');
            if(v === travelMode) {
                k.classList.add('active');
            }
        });
    }

    /**
     * Gets the container for the instructions
     * @return {Element}
     */
    getInstructionsContainer() {
        return this._instructionsContainer;
    }

    /**
     * Changes the mode change callback to listen
     * to changes on the travel mode
     * @param {?DirectionsPanel#TravelModeChangedListener} callback - The new callback (old will be lost)
     */
    setModeChangeCallback(callback) {
        this._modeChangeCallback = callback;
    }

    /**
     * @param {MouseEvent} event
     * @private
     */
    _tabClicked(event) {
        let tM = this._tabs.get(event.currentTarget);
        this.selectedTravelMode(tM);
        if(this._modeChangeCallback) {
            this._modeChangeCallback(tM);
        }
    }
}
/**
 * @callback DirectionsPanel#TravelModeChangedListener
 * @param {TravelMode} travelMode - The new travel mode
 */