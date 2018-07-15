/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const LIST_PAGE_CLASS = "ListPage";

const LINK_ICON_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"external-link-alt\" class=\"svg-inline--fa fa-external-link-alt fa-w-18\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><path fill=\"currentColor\" d=\"M576 24v127.984c0 21.461-25.96 31.98-40.971 16.971l-35.707-35.709-243.523 243.523c-9.373 9.373-24.568 9.373-33.941 0l-22.627-22.627c-9.373-9.373-9.373-24.569 0-33.941L442.756 76.676l-35.703-35.705C391.982 25.9 402.656 0 424.024 0H552c13.255 0 24 10.745 24 24zM407.029 270.794l-16 16A23.999 23.999 0 0 0 384 303.765V448H64V128h264a24.003 24.003 0 0 0 16.97-7.029l16-16C376.089 89.851 365.381 64 344 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V287.764c0-21.382-25.852-32.09-40.971-16.97z\"></path></svg>";
const MAP_BUTTON_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"map-marker-alt\" class=\"svg-inline--fa fa-map-marker-alt fa-w-12\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><path fill=\"currentColor\" d=\"M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z\"></path></svg>";

/**
 * ListPage is a page with a list kind of layout. It displays an array of items
 * with several properties: an icon, name, adress, whether is is free or not, languages, link, schedules, map button
 */
class ListPage extends Page {
    /**
     * @param {App} app                 - The app we are running
     * @param {Page} parentPage         - Parent page to go back when pressing "back"
     * @param {Category} category       - The category to list the items in it
     * @param {ListPageState} [state]   - The state to restore, if present the parameters in the state will replace
     * the ones passed (the passed ones will be ignored).
     */
    constructor(app, parentPage, category, state) {
        if(!parentPage) {
            parentPage = new CategoriesGridPage(app, category.itemType);
        }

        super(app, parentPage, category.name, true, state);

        this._category = state ? state.category : category;

        /**
         * @type {Item[]}
         * @private
         */
        this._items = state ?
            state.items.map((itemObj)=>new Item(itemObj)):
            []; // TODO: load from cache ( on load function )
    }

    load(...loadingParams) {
        let self = this;
        let svc = new ApiService();
        svc.getItems(this._category.code, (...x)=>self._itemsReceived(...x));
    }

    render(container) {
        super.render(container);

        let htmlString = "";
        for(let item of this._items) {
            let iconUrl = ResourcesProvider.getItemIconUrl(item);
            let periods = ListPage._periodsStrFor(item);
            let costAndLang = ListPage._costAndLangHtmlFor(item);

            let textString = `<h3>${item.name}</h3>`;
            textString += `<p class="item-addr">${item.address}</p>`;
            textString += `<div class="item-cost-lang">${costAndLang}</div>`;
            if(item.webLink) {
                textString += `<a class="item-link" href="${item.webLink}"><span>${item.webLink}</span> ${LINK_ICON_SVG}</a>`;
            }
            textString += `<p class="item-periods">${periods}</p>`;

            if(this.shouldShowMapButton()) {
                textString += `<button class="item-map map-button" data-item="${item.itemId}">Map ${MAP_BUTTON_SVG}</button>`;
            }

            htmlString += `<div class='row item-row'><div class="col-4 item-icon"><img src="${iconUrl}"></div>`+
                `<div class="col-8">${textString}</div></div>`;
        }
        if(this.shouldShowMapButton() && this._items.length > 0) {
            // Open-map-with-all-of-them button
            htmlString += `<div class="row"><button id="all-items-map" class="map-button" style="background-image: url(${ResourcesProvider.getAllMapsIconUrl()});"></button></div>`;
        }
        container.innerHTML = htmlString;

        if(this.shouldShowMapButton()) {
            this._createMapButtonsCallback(container);
        }
    }

    /**
     * Creates the map buttons callback for the passed div map buttons
     * @param {Element} div - The div to search the map buttons in
     * @private
     */
    _createMapButtonsCallback(div) {
        let callback = (event)=>this._mapsButtonClicked(event);
        let btns = div.getElementsByTagName("button");
        for(let element of btns) {
            if(element.classList.contains("map-button")) {
                element.addEventListener('click', callback);
            }
        }
    }

    /**
     * Should be called whenever a button map of the list is clicked
     * @param {MouseEvent} event - The click event
     * @private
     */
    _mapsButtonClicked(event) {
        let item = null;
        let title = this.title;
        let itemId = event.currentTarget.getAttribute("data-item");
        if(itemId) {
            itemId = parseInt(itemId);
            // Search the item
            for(let itemToCheck of this._items) {
                if(itemToCheck.itemId === itemId) {
                    item = itemToCheck;
                    title = itemToCheck.name;
                    break;
                }
            }
        } else {
            // If no data-item attribute is set, we show all the items
            item = this._items;
        }
        if(item) {
            this.app.navigateToPage(new MapPage(this.app, title, item, this));
        }
    }

    /**
     * Callback to be called when we receive the items from the AJAX call
     * @param {Item[]} items
     * @private
     */
    _itemsReceived(items) {
        // If the page is hidden we ignore this
        if(!this.isVisible()) {
            return;
        }
        this._items = items;
        this.app.updateCurrentSavedState();
        this.app.clearContainer();
        this.render(this.app.getContainer());
    }

    static _periodsStrFor(item) {
        // We will group periods with the same schedule
        let startedSchedules = ListPage._groupPeriodsWithSameSchedule(item.openingHours);
        // Now we will print one line per schedule
        let htmlStr = "";
        for(let schedule of startedSchedules) {
            let startDay = schedule.startPeriod.startDayStr();
            let endDay = schedule.endDay;
            let days = startDay !== endDay ? `${startDay}-${endDay}` : startDay;
            let startHour = schedule.startPeriod.startHourStr();
            let endHour = schedule.startPeriod.endHourStr();
            htmlStr += `${days} ${startHour}-${endHour}<br>`;
        }
        return htmlStr;
    }

    /**
     * Groups all the periods with the same schedule
     * @param {[Period]} periods - A list of periods, it is expected to be chronologically ordered
     * @return {{startPeriod: Period, endDay: string}[]}
     * @private
     */
    static _groupPeriodsWithSameSchedule(periods) {
        /**
         * @type {{startPeriod: Period, endDay: string}[]}
         */
        let startedSchedules = [];
        for(let period of periods) {
            let found = false;
            for(let schedule of startedSchedules) {
                if(period.hasSameHoursAs(schedule.startPeriod)) {
                    schedule.endDay = period.endDayStr();
                    found = true;
                    break;
                }
            }
            if(!found) {
                startedSchedules.push({startPeriod: period, endDay: period.endDayStr()});
            }
        }
        return startedSchedules;
    }

    static _costAndLangHtmlFor(item) {
        let iconPayment = ResourcesProvider.getCostIconUrl(item.isFree?'free':'pay');
        let strHtml = `<img src='${iconPayment}'>`;
        for(let lang of item.languageCodes) {
            let langIcon = ResourcesProvider.getLanguageIconUrl(lang);
            strHtml += `<img src='${langIcon}'>`;
        }
        return strHtml;
    }

    /**
     * Returns whether the map buttons should be displayed in this page
     * @return {boolean} true if they should be displayed, false if not.
     */
    shouldShowMapButton() {
        return this._category.itemType !== 'link';
    }

    getState() {
        let state = super.getState();
        state.items = [];
        for(let item of this._items) {
            state.items.push(item.toObject());
        }
        state.pageClass = LIST_PAGE_CLASS;
        state.category = this._category;
        return state;
    }

    /**
     * @param {App} app
     * @param {ListPageState} state
     */
    static fromState(app, state) {
        if(state.pageClass !== LIST_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${LIST_PAGE_CLASS}"`);
        }
        return new ListPage(app, null, state.category, state);
    }
}
/**
 * @typedef {PageState} ListPageState
 * @property {ItemObject[]} items
 * @property {Category} category
 * @property {string} pageClass
 */