/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Meters of distance under which we will consider
 * you have already reached the end of the step.
 * @type {number}
 */
const ROUTE_GUIDE_METERS_STEP_RADIUS = 10;

/**
 * This class manages route navigation listening to user updates and route changes.
 */
class RouteGuide {
    /**
     *
     * @param {UserTracker} userTracker - The tracker to get updates on user position
     * @param {RouteDrawer} routeDrawer - The route drawer to highligh the steps
     * @param {google.maps.DirectionsRoute} route - The route to navigate through
     */
    constructor(userTracker, routeDrawer, route) {
        /**
         * The user tracker to receive user position updates
         * @type {UserTracker}
         * @private
         */
        this._userTracker = userTracker;
        /**
         * The route drawer to highlight the current step of the guide.
         * @type {RouteDrawer}
         * @private
         */
        this._routeDrawer = routeDrawer;
        /**
         * The route we have to follow.
         * @type {google.maps.DirectionsRoute}
         * @private
         */
        this._route = route;
        /**
         * Current step in the route. It will allow us to
         * track the advance along the route.
         * @type {number}
         * @private
         */
        this._currentStepIdx = 0;
        /**
         * Voice synthesizer to read the steps
         * @type {VoiceSynthesizer}
         * @private
         */
        this._voice = new VoiceSynthesizer();

        /**
         * The index of the listener to position updates
         * of the user, to be able to del it later.
         * It is -1 if the guide has not been started previously.
         * @type {Number}
         * @private
         */
        this._listenerIdx = -1;
    }

    /**
     * Simply starts listening to user updates and reads the first step.
     * It has no effects if the guide has been started already
     * and is not finished.
     */
    start() {
        if(this._listenerIdx === -1) {
            this._listenerIdx = this._userTracker
                .registerPositionListener(() => this._onUserPositionUpdate());
            this._readWarnings();
            this.readStep();
            this._highlightStep();
            console.log("RG: started");
        }
    }

    /**
     * Removes the listener to the user tracker so
     * this class ends its tracking.
     */
    finish() {
        if(this._listenerIdx !== -1) {
            this._userTracker
                .removePositionListener(this._listenerIdx);
            this._listenerIdx = -1;
            this._voice.shutUp();
            this._clearHighlightedStep();
            console.log("RG: finished");
        }
    }

    /**
    * It will be called each time the user position is updated
    */
    _onUserPositionUpdate() {
        if(this._isUserAtTheEndOfCurrentStep()) {
            this._nextStep();
            if(!this._routeEnded()) {
                this.readStep();
                this._highlightStep();
            } else {
                this.finish();
                this._clearHighlightedStep();
            }
        }
    }

    /**
     * Changes to the next step
     * @private
     */
    _nextStep() {
        this._currentStepIdx++;
        console.log("RG: change to step ", this._currentStepIdx);
    }

    /**
     * Reads the current step to the user.
     * @private
     */
    readStep() {
        let instructions = this._getCurrentStep().instructions
            .replace(/<div[^>]*>/g, '. ') // Div starts are points
            .replace(/<[^>]*>/g, '') // Forget other tags
            .htmlUnescape(); // Replace '&amp;' by '&' and so on.
        this._voice.say(instructions);
    }

    /**
     * Highlights the current step of the route
     * @private
     */
    _highlightStep() {
        this._routeDrawer.highlightStep(this._currentStepIdx, this._getCurrentStep());
    }

    /**
     * Clears the last highlighted step
     * @private
     */
    _clearHighlightedStep() {
        this._routeDrawer.clearHighlightedStep();
    }

    /**
     * Reads the warnings of the route to the user
     * @private
     */
    _readWarnings() {
        for(let warning of this._route.warnings) {
            this._voice.say(warning.replace(/<[^>]*>/g, ''));
        }
    }

    /**
     * Checks if the user has reached the end of the current step
     * @return {boolean} - True if the user has reached the end of the step,
     *      false if not. It returns false if the user position is null.
     * @private
     */
    _isUserAtTheEndOfCurrentStep() {
        let position = this._userTracker.getUserPosition();

        // Return false if no position is given
        if(!position) {
            return false;
        }

        let positionLatLng = new google.maps.LatLng(
            position.latitude, position.longitude);

        let step = this._getCurrentStep();
        if(step) {
            let target = step.end_location;
            let distance = google.maps.geometry.spherical
                .computeDistanceBetween(positionLatLng, target);

            return distance <= ROUTE_GUIDE_METERS_STEP_RADIUS;
        } else {
            // If step is null the route is ended!
            return false;
        }
    }

    /**
     * Gets the current step, or null if the route is ended
     * @return {?google.maps.DirectionsStep} - The step, or null if it is ended
     * @private
     */
    _getCurrentStep() {
        if(!this._routeEnded()) {
            return this._getCurrentLeg().steps[this._currentStepIdx];
        }
        return null;
    }

    /**
     * Gets the current leg in use, by now it is the first one.
     * @return {google.maps.DirectionsLeg} - The leg
     * @private
     */
    _getCurrentLeg() {
        // The leg of the route we follow is always the 0... by now
        return this._route.legs[0];
    }

    /**
     * Checks whether the route is ended or not yet
     * return {boolean}
     * @private
     */
    _routeEnded() {
        return this._currentStepIdx === this._getCurrentLeg().steps.length;
    }
}