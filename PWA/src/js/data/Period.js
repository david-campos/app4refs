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
 * @property {int|string} periodId
 * @property {string} startDay
 * @property {int} startHour
 * @property {int} startMinutes
 * @property {string} endDay
 * @property {int} endHour
 * @property {int} endMinutes
 */

/**
 * @typedef {Object} PeriodMarker
 * @property {Period} startPeriod
 * @property {string} endDay
 * @property {string} nextDay
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
         * @type {int|string}
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
     * Determines if this period contains the specified
     * time. Notice we will use UTC time to translate it
     * to Greek time so the comparison is right with any
     * time zone offset.
     * @param {Date} time - The time to check
     */
    containsTime(time) {
        let cloned = new Date(time.getTime());
        cloned.addHours(3); // Since Greece has UTC+3, now UTC returns Greek time

        // Returns 0 = Sunday, 6 = Saturday, we need to get it to 0 = Monday, 6 = Sunday
        let weekDay = (cloned.getUTCDay()+6) % 7;
        let hour = cloned.getUTCHours();
        let minute = cloned.getUTCMinutes();

        // Calculate the minutes since the start of the week for each start and end
        let minsSinceWeekStart = (weekDay * 24 + hour) * 60 + minute;
        let startMSWS = this.startInMinutesSinceStartOfTheWeek();
        let endMSWS = this.endInMinutesSinceStartOfTheWeek();

        if(startMSWS <= endMSWS) {
            return startMSWS <= minsSinceWeekStart && minsSinceWeekStart <= endMSWS;
        } else {
            return minsSinceWeekStart <= endMSWS || minsSinceWeekStart >= startMSWS;
        }
    }

    /**
     * Returns the number of minutes passed from the start of the week
     * until the start of the period
     * @return {number}
     */
    startInMinutesSinceStartOfTheWeek() {
        return (PERIOD_DAYS.indexOf(this.startDay) * 24
            + this.startHour) * 60
            + this.startMinutes;
    }

    /**
     * Returns the number of minutes passed from the start of the week
     * until the end of the period.
     * @return {number}
     */
    endInMinutesSinceStartOfTheWeek() {
        return (PERIOD_DAYS.indexOf(this.endDay) * 24
                + this.endHour) * 60
            + this.endMinutes;
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
     * Checks if this period and the indicated one are overlapping
     * @param {Period} period - The other period
     * @return {boolean} true if they overlap, false if they don't
     */
    overlaps(period) {
        let a = this.startInMinutesSinceStartOfTheWeek();
        let b = this.startInMinutesSinceStartOfTheWeek();
        let c = period.startInMinutesSinceStartOfTheWeek();
        let d = period.endInMinutesSinceStartOfTheWeek();

        let mod = (7 * 24 + 23) * 60 + 59;
        return Math.mod((c-a), mod) <= Math.mod((b-a), mod) || Math.mod((a-c), mod) <= Math.mod((d-c), mod);
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

    /**
     * Groups all the periods with the same schedule
     * @param {Period[]} periods - A list of periods, ordered by their end day.
     * @return {PeriodMarker[]}
     */
    static groupPeriodsWithSameSchedule(periods) {
        let periodsLeft = periods.slice();
        /**
         * @type {PeriodMarker[]}
         */
        let schedules = [];
        // While there are periods to group
        while(periodsLeft.length > 0) {
            let next = periodsLeft.shift();
            let newSchedule = {
                startPeriod: next,
                endDay: next.endDayStr(),
                nextDay: next.nextDay()};
            let foundNextPeriod;
            do {
                foundNextPeriod = false;
                for (let idx=0; idx < periodsLeft.length; idx++) {
                    let period = periodsLeft[idx];
                    // It has the same schedule and it starts the next day
                    if (period.hasSameHoursAs(newSchedule.startPeriod) &&
                        period.startDay === newSchedule.nextDay) {
                        newSchedule.endDay = period.endDayStr();
                        newSchedule.nextDay = period.nextDay();
                        // Remove period from periodsLeft
                        periodsLeft.splice(idx, 1);
                        foundNextPeriod = true;
                        break;
                    }
                }
            } while(foundNextPeriod); // Repeat while next is found

            // Check to join with previous ones
            foundNextPeriod = false;
            for (let schedule of schedules) {
                if (schedule.startPeriod.hasSameHoursAs(newSchedule.startPeriod) &&
                    newSchedule.nextDay === schedule.startPeriod.startDay) {
                    schedule.startPeriod  = newSchedule.startPeriod;
                    foundNextPeriod = true;
                    break;
                }
            }
            if(!foundNextPeriod) {
                schedules.push(newSchedule);  // Add to the schedule
            }
        }
        return schedules;
    }
}