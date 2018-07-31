/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const PERIOD_DAYS = ["mon", "tue", "wed", "thu", "fri","sat","sun"];
const PERIOD_DAYS_STRS = {
    "mon": "Monday",
    "tue": "Tuesday",
    "wed": "Wednesday",
    "thu": "Thursday",
    "fri": "Friday",
    "sat": "Saturday",
    "sun": "Sunday"
};

/**
 * @typedef {Object} PeriodObject
 * @property {int} periodId
 * @property {string} startDay
 * @property {int} startHour
 * @property {int} startMinutes
 * @property {string} endDay
 * @property {int} endHour
 * @property {int} endMinutes
 */

/**
 * A direct representation of the periods which come from the API
 */
class Period {
    /**
     * @param {PeriodObject} object - The period as it comes from the API
     */
    constructor(object) {
        /**
         * @type {int}
         */
        this.periodId = object.periodId;
        /**
         * @type {string}
         */
        this.startDay = object.startDay;
        /**
         * @type {int}
         */
        this.startHour = object.startHour;
        /**
         * @type {int}
         */
        this.startMinutes = object.startMinutes;
        /**
         * @type {string}
         */
        this.endDay = object.endDay;
        /**
         * @type {int}
         */
        this.endHour = object.endHour;
        /**
         * @type {int}
         */
        this.endMinutes = object.endMinutes;
    }

    /**
     * Returns a representation of the period to save in the state
     * @returns {PeriodObject}
     */
    toObject() {
        return {
            periodId: this.periodId,
            startDay: this.startDay,
            startHour: this.startHour,
            startMinutes: this.startMinutes,
            endDay: this.endDay,
            endHour: this.endHour,
            endMinutes: this.endMinutes
        };
    }

    /**
     * Checks if this period has the same hours to
     * start and end as the other one
     * @param {Period} periodB
     * @return {boolean}
     */
    hasSameHoursAs(periodB) {
        return this.startHour === periodB.startHour &&
            this.startMinutes === periodB.startMinutes &&
            this.endHour === periodB.endHour &&
            this.endMinutes === periodB.endMinutes;
    }

    /**
     * Returns the end hour as a formated string
     * @return {string}
     */
    endHourStr() {
        return Period.formatHour(this.endHour, this.endMinutes);
    }

    /**
     * Returns the starting hour as a formatted string
     * @return {string}
     */
    startHourStr() {
        return Period.formatHour(this.startHour, this.startMinutes);
    }

    /**
     * Returns the start day in a human-readable format
     * @return {string}
     */
    startDayStr() {
        return PERIOD_DAYS_STRS[this.startDay];
    }

    /**
     * Returns the end day in a human-readable format
     * @return {string}
     */
    endDayStr() {
        return PERIOD_DAYS_STRS[this.endDay];
    }

    /**
     * Returns the next day for the period to continue repetition.
     * If the period starts at an hour (and minutes) that is lower
     * than or exactly equals to the hour it ends, the day after endDay
     * is returned. If the starting hour is greater than the ending one,
     * then endDay is returned.
     * @return {string}
     */
    nextDay() {
        if(this.startHour > this.endHour ||
            (this.startHour === this.endHour &&
                this.startMinutes >= this.endMinutes)) {
            return this.endDay;
        } else {
            return Period.nextDay(this.endDay);
        }
    }

    /**
     * Returns the given hour and minutes as a string
     * @param {int} hour - Hour in the range [0, 23]
     * @param {int} minutes - Minutes in the range [0, 59]
     * @return {string}
     */
    static formatHour(hour, minutes) {
        let isPm = false;
        if(hour > 12) {
            isPm = true;
            hour -= 12;
        }
        let minutesStr = ( minutes !== 0 ? ":" + minutes : "" );
        return `${hour}${minutesStr}${isPm?"pm":"am"}`;
    }

    /**
     * Returs the day that comes after the passed day
     * @param {string} day - The day as returned by the period ("mon","tue","wed"...)
     */
    static nextDay(day) {
        let idx = PERIOD_DAYS.indexOf(day);
        if(idx >= 0) {
            return PERIOD_DAYS[(idx+1) % PERIOD_DAYS.length];
        } else {
            throw new Error(`Period::nextDay: Invalid day '${day}'.`)
        }
    }
}