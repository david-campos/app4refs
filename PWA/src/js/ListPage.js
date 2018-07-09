/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * ListPage is a page with a list kind of layout. It displays an array of items
 * with several properties: an icon, name, adress, whether is is free or not, languages, link, schedules, map button
 */
class ListPage extends Page {
    /**
     * @param {Page}          parentPage - Parent page to go back when pressing "back"
     * @param {ListPageState} [state]    - The state to restore, if present the parameters in the state will replace
     * the ones passed (the passed ones will be ignored).
     */
    constructor(parentPage, category, state) {
        super(parentPage, category.name, true, state);

        // To test
        /**
         * @type {Item[]}
         * @private
         */
        this._items = [{"itemId":88,"name":"National Bank of Greece","address":"3rd September str. 75, Athens 104 34","webLink":"https://www.nbg.gr/en/branches-atms","placeId":null,"iconUri":"","isFree":0,"coordLat":"37.991829","coordLon":"23.729901","phone":null,"callForAppointment":0,"categoryCode":"link_banks","languageCodes":["el","en"],"openingHours":[{"periodId":333,"startDay":"mon","startHour":8,"startMinutes":0,"endDay":"mon","endHour":14,"endMinutes":30},{"periodId":334,"startDay":"tue","startHour":8,"startMinutes":0,"endDay":"tue","endHour":14,"endMinutes":30},{"periodId":335,"startDay":"wed","startHour":8,"startMinutes":0,"endDay":"wed","endHour":14,"endMinutes":30},{"periodId":336,"startDay":"thu","startHour":8,"startMinutes":0,"endDay":"thu","endHour":14,"endMinutes":30},{"periodId":337,"startDay":"fri","startHour":8,"startMinutes":0,"endDay":"fri","endHour":14,"endMinutes":0}]},{"itemId":89,"name":"Peiraios Bank","address":"28th of October str. 70, Athens 104 34","webLink":"http://www.piraeusbank.gr/en/idiwtes/kanalia-eksypiretisis/diktio-eksipiretisis","placeId":null,"iconUri":"","isFree":0,"coordLat":"37.990514","coordLon":"23.731084","phone":null,"callForAppointment":0,"categoryCode":"link_banks","languageCodes":["el","en"],"openingHours":[{"periodId":338,"startDay":"mon","startHour":8,"startMinutes":0,"endDay":"mon","endHour":14,"endMinutes":30},{"periodId":339,"startDay":"tue","startHour":8,"startMinutes":0,"endDay":"tue","endHour":14,"endMinutes":30},{"periodId":340,"startDay":"wed","startHour":8,"startMinutes":0,"endDay":"wed","endHour":14,"endMinutes":30},{"periodId":341,"startDay":"thu","startHour":8,"startMinutes":0,"endDay":"thu","endHour":14,"endMinutes":30},{"periodId":342,"startDay":"fri","startHour":8,"startMinutes":0,"endDay":"fri","endHour":14,"endMinutes":0}]},{"itemId":90,"name":"Alpha Bank","address":"28th of October str. 172, Athens 112 52","webLink":"https://secure.alpha.gr/AlphaLookUp/Search.aspx?LookUpID=4","placeId":null,"iconUri":"","isFree":0,"coordLat":"38.002069","coordLon":"23.733997","phone":null,"callForAppointment":0,"categoryCode":"link_banks","languageCodes":["el","en"],"openingHours":[{"periodId":343,"startDay":"mon","startHour":8,"startMinutes":0,"endDay":"mon","endHour":14,"endMinutes":30},{"periodId":344,"startDay":"tue","startHour":8,"startMinutes":0,"endDay":"tue","endHour":14,"endMinutes":30},{"periodId":345,"startDay":"wed","startHour":8,"startMinutes":0,"endDay":"wed","endHour":14,"endMinutes":30},{"periodId":346,"startDay":"thu","startHour":8,"startMinutes":0,"endDay":"thu","endHour":14,"endMinutes":30},{"periodId":347,"startDay":"fri","startHour":8,"startMinutes":0,"endDay":"fri","endHour":14,"endMinutes":0}]}];
    }

    render(container) {
        let htmlString = "";
        for(let item of this._items) {
            let iconUrl = ResourcesProvider.getItemIconUrl(item);
            let periods = this._periodsStrFor(item);
            let costAndLang = this._costAndLangHtmlFor(item);

            let textString = `<h3>${item.name}</h3>`;
            textString += `<p class="item-addr">${item.address}</p>`;
            textString += `<div class="item-cost-lang">${costAndLang}</div>`;
            if(item.weblink) {
                textString += `<a class="item-link" href="${item.weblink}">${item.weblink}</a>`;
            }
            textString += `<p class="item-periods">${periods}</p>`;
            textString += `<button class="item-map">Map</button>`;

            htmlString += `<div class='row'><div class="col-4" style="background-image: url(${iconUrl})"></div>`+
                `<div class="col-8">${textString}</div></div>`;
        }
        container.innerHTML = htmlString;
    }

    _periodsStrFor(item) {
        return "Monday-Friday 9am-8pm";
    }

    _costAndLangHtmlFor(item) {
        let iconA = ResourcesProvider.getCostIconUrl('free');
        let iconB = ResourcesProvider.getLanguageIconUrl('el');
        return `<img src='${iconA}'><img src='${iconB}'>`;
    }
}
/**
 * @typedef {PageState} ListPageState
 */
/**
 * @typedef {Object} Item
 * @property {int} itemId
 * @property {string} name
 * @property {string} address
 * @property {string} [weblink]
 * @property {string} [placeId]
 * @property {string} iconUri
 * @property {boolean} isFree
 * @property {number} coordLat
 * @property {number} coordLon
 * @property {string|null} phone
 * @property {boolean} callForAppointment
 * @property {string} categoryCode
 * @property {[string]} languageCodes
 * @property openingHours
 *
 */