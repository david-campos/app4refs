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
        this.periodId = object.periodId;
        this.startDay = object.startDay;
        this.startHour = object.startHour;
        this.startMinutes = object.startMinutes;
        this.endDay = object.endDay;
        this.endHour = object.endHour;
        this.endMinutes = object.endMinutes;
    }

    /**
     * Checks if this period has the same hours to
     * start and end as the other one
     * @param {Period} periodB
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
     * Returns the given hour and minutes as a string
     * @param {int} hour - Hour in the range [0, 23]
     * @param {int} minutes - Minutes in the range [0, 59]
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
}