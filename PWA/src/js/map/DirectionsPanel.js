/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const DIRECTIONS_PANEL_CAR_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"car\" class=\"svg-inline--fa fa-car fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z\"></path></svg>";
const DIRECTIONS_PANEL_WALKING_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"walking\" class=\"svg-inline--fa fa-walking fa-w-10\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M208 96c26.5 0 48-21.5 48-48S234.5 0 208 0s-48 21.5-48 48 21.5 48 48 48zm94.5 149.1l-23.3-11.8-9.7-29.4c-14.7-44.6-55.7-75.8-102.2-75.9-36-.1-55.9 10.1-93.3 25.2-21.6 8.7-39.3 25.2-49.7 46.2L17.6 213c-7.8 15.8-1.5 35 14.2 42.9 15.6 7.9 34.6 1.5 42.5-14.3L81 228c3.5-7 9.3-12.5 16.5-15.4l26.8-10.8-15.2 60.7c-5.2 20.8.4 42.9 14.9 58.8l59.9 65.4c7.2 7.9 12.3 17.4 14.9 27.7l18.3 73.3c4.3 17.1 21.7 27.6 38.8 23.3 17.1-4.3 27.6-21.7 23.3-38.8l-22.2-89c-2.6-10.3-7.7-19.9-14.9-27.7l-45.5-49.7 17.2-68.7 5.5 16.5c5.3 16.1 16.7 29.4 31.7 37l23.3 11.8c15.6 7.9 34.6 1.5 42.5-14.3 7.7-15.7 1.4-35.1-14.3-43zM73.6 385.8c-3.2 8.1-8 15.4-14.2 21.5l-50 50.1c-12.5 12.5-12.5 32.8 0 45.3s32.7 12.5 45.2 0l59.4-59.4c6.1-6.1 10.9-13.4 14.2-21.5l13.5-33.8c-55.3-60.3-38.7-41.8-47.4-53.7l-20.7 51.5z\"></path></svg>";
const DIRECTIONS_PANEL_TRANSIT_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"subway\" class=\"svg-inline--fa fa-subway fa-w-14\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 96v256c0 51.815-61.624 96-130.022 96l62.98 49.721C386.905 502.417 383.562 512 376 512H72c-7.578 0-10.892-9.594-4.957-14.279L130.022 448C61.82 448 0 403.954 0 352V96C0 42.981 64 0 128 0h192c65 0 128 42.981 128 96zM200 232V120c0-13.255-10.745-24-24-24H72c-13.255 0-24 10.745-24 24v112c0 13.255 10.745 24 24 24h104c13.255 0 24-10.745 24-24zm200 0V120c0-13.255-10.745-24-24-24H272c-13.255 0-24 10.745-24 24v112c0 13.255 10.745 24 24 24h104c13.255 0 24-10.745 24-24zm-48 56c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm-256 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z\"></path></svg>";
const DIRECTIONS_PANEL_NO_RESULTS =
    "<div id=\"dir-pan-travel-zero-results\">No routes available.</div>";

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
            <li>${DIRECTIONS_PANEL_WALKING_SVG}</li>
            <li>${DIRECTIONS_PANEL_CAR_SVG}</li>
            <li>${DIRECTIONS_PANEL_TRANSIT_SVG}</li></ul>
            <button id="dir-pan-start-btn" style="display: none;">START</button>
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
         * The button to start navigation
         * @type {Element}
         * @private
         */
        this._guideButton = this._container.querySelector("#dir-pan-start-btn");

        this._guideButton.addEventListener('click', (e)=>this._startButtonClicked(e));

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
        /**
         * The callback to call when the start-navigation
         * button is clicked.
         * @type {?DirectionsPanel#StartNavigationCallback}
         * @private
         */
        this._startNavigationCallback = null;
    }

    /**
     * Clears the panel instructions
     */
    clear() {
        this._instructionsContainer.innerHTML = "";
        this.hideGuideButton();
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
        this._container.style.bottom = "-60vh";
    }

    /**
     * Toggles the visibility of the panel
     */
    toggle() {
        if (this.isHidden()) this.show();
        else this.hide();
    }

    /**
     * Indicates whether this panel is currently hidden or not
     * @return {boolean}
     */
    isHidden() {
        return parseInt(this._container.style.bottom) !== 0;
    }

    /**
     * Hides the button that allows to start
     * the navigation guide
     */
    hideGuideButton() {
        this._guideButton.style.display = "none";
    }

    /**
     * Shows the button which allows to start
     * the navigation guide
     */
    showGuideButton() {
        this._guideButton.style.display = "block";
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
     * Changes the navigation start callback to listen
     * to the user requests to start the navigation guide.
     * @param {?DirectionsPanel#StartNavigationCallback} callback callback - The new callback (old will be lost)
     */
    setNavigationStartCallback(callback) {
        this._startNavigationCallback = callback;
    }

    /**
     * Highlights an step of the route in the panel (if possible)
     * @param {Number} idx - Index of the step.
     */
    highlightStep(idx) {
        // This method uses a "hack", searching manually in the table google
        // creates. It may stop working with Google changes.
        let step = this._instructionsContainer.querySelector(`tr[data-step-index="${idx}"]`);
        if(step) {
            step.style.backgroundColor = "#7C0D82";
            step.style.color = "white";
        }
    }

    /**
     * If there is any highlighted step in the panel, it returns it to normal.
     */
    clearHighlightedSteps() {
        // This method uses a "hack", searching manually in the table google
        // creates. It may stop working with Google changes.
        let steps = this._instructionsContainer.querySelectorAll("table.adp-directions tr");
        for(let step of steps) {
            step.removeAttribute("style");
        }
    }

    /**
     * Displays the text to show when no results are found
     */
    displayZeroResults() {
        if(this.isHidden())
            this.show();

        this._instructionsContainer.innerHTML = DIRECTIONS_PANEL_NO_RESULTS;
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

    _startButtonClicked(event) {
        if(this._startNavigationCallback) {
            this._startNavigationCallback();
            this.hideGuideButton();
            this.hide();
        }
    }
}
/**
 * @callback DirectionsPanel#TravelModeChangedListener
 * @param {TravelMode} travelMode - The new travel mode
 */

/**
 * @callback DirectionsPanel#StartNavigationCallback
 */