/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * @typedef {Object} ItemObject
 * @property {int} itemId
 * @property {string} orderPreference
 * @property {string} name
 * @property {string} address
 * @property {?string} [webLink]
 * @property {?string} [placeId]
 * @property {string} iconUri
 * @property {boolean} isFree
 * @property {?number} coordLat
 * @property {?number} coordLon
 * @property {?string} phone
 * @property {boolean} callForAppointment
 * @property {string} categoryCode
 * @property {string[]} languageCodes
 * @property {PeriodObject[]} openingHours
 *
 */

/**
 * @typedef {string} ItemOrder
 */

/**
 *
 * @type {{FIRST: ItemOrder, SECOND: ItemOrder, THIRD: ItemOrder, REST: ItemOrder}}
 */
const ITEM_ORDER = {
    FIRST: 'first',
    SECOND: 'second',
    THIRD: 'third',
    REST: 'rest'
};

/**
 * A direct representation of the items which come from the API
 */
class Item {
    /**
     * Constructs an item from an item representation
     * @param {ItemObject} object - The representation of the item as it comes from the API
     */
    constructor(object) {
        /**
         * @type {int}
         */
        this.itemId = object.itemId;
        /**
         * @type {string}
         */
        this.name = object.name;
        /**
         * @type {string}
         */
        this.address = object.address;
        /**
         * @type {?string}
         */
        this.webLink = object.webLink;
        /**
         * @type {?string}
         */
        this.placeId = object.placeId;
        /**
         * @type {string}
         */
        this.iconUri = object.iconUri;
        /**
         * @type {boolean}
         */
        this.isFree = object.isFree;
        /**
         * @type {number}
         */
        this.coordLat = parseFloat(object.coordLat);
        /**
         * @type {number}
         */
        this.coordLon = parseFloat(object.coordLon);
        /**
         * @type {string}
         */
        this.phone = object.phone;
        /**
         * @type {boolean}
         */
        this.callForAppointment = object.callForAppointment;
        /**
         * @type {string}
         */
        this.categoryCode = object.categoryCode;
        /**
         * @type {string[]}
         */
        this.languageCodes = object.languageCodes;
        /**
         * @type {Period[]}
         */
        this.openingHours = object.openingHours.map((x)=>new Period(x));
        /**
         * @type {ItemOrder}
         */
        this.orderPreference = (
            Object.values(ITEM_ORDER).indexOf(object.orderPreference) > -1 ?
                object.orderPreference :
                ITEM_ORDER.REST);

    }

    /**
     * Returns a representation of the item to save in the state
     * @return {ItemObject}
     */
    toObject() {
        return {
            itemId: this.itemId,
            orderPreference: this.orderPreference,
            name: this.name,
            address: this.address,
            webLink: this.webLink,
            placeId: this.placeId,
            iconUri: this.iconUri,
            isFree: this.isFree,
            coordLat: this.coordLat,
            coordLon: this.coordLon,
            phone: this.phone,
            callForAppointment: this.callForAppointment,
            categoryCode: this.categoryCode,
            languageCodes: this.languageCodes,
            openingHours: this.openingHours.map((x)=>x.toObject())
        }
    }

    /**
     * Determines if the item is adequate to be shown in a map
     * @return {boolean} - True if it is, false if not
     */
    canBeShownInMap() {
        return !isNaN(this.coordLon) && !isNaN(this.coordLat);
    }

    /**
     * Determines if the item is currently opened or not given
     * the opening periods. If the item requires a call
     * for appointment this function returns false.
     * @return {boolean}
     */
    isOpenNow() {
        if(this.callForAppointment) {
            return false;
        }

        let time = new Date();

        for(let period of this.openingHours) {
            if(period.containsTime(time)) {
                return true;
            }
        }

        return false;
    }
}