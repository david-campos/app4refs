/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

const LIST_PAGE_CLASS = "ListPage";

const LINK_ICON_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"external-link-alt\" class=\"svg-inline--fa fa-external-link-alt fa-w-18\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><path fill=\"currentColor\" d=\"M576 24v127.984c0 21.461-25.96 31.98-40.971 16.971l-35.707-35.709-243.523 243.523c-9.373 9.373-24.568 9.373-33.941 0l-22.627-22.627c-9.373-9.373-9.373-24.569 0-33.941L442.756 76.676l-35.703-35.705C391.982 25.9 402.656 0 424.024 0H552c13.255 0 24 10.745 24 24zM407.029 270.794l-16 16A23.999 23.999 0 0 0 384 303.765V448H64V128h264a24.003 24.003 0 0 0 16.97-7.029l16-16C376.089 89.851 365.381 64 344 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V287.764c0-21.382-25.852-32.09-40.971-16.97z\"></path></svg>";
const MAP_BUTTON_SVG = "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"map-marker-alt\" class=\"svg-inline--fa fa-map-marker-alt fa-w-12\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><path fill=\"currentColor\" d=\"M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z\"></path></svg>";
const GOOGLE_BUTTON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 48 48\"><defs><path id=\"a\" d=\"M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z\"/></defs><clipPath id=\"b\"><use xlink:href=\"#a\" overflow=\"visible\"/></clipPath><path clip-path=\"url(#b)\" fill=\"#FBBC05\" d=\"M0 37V11l17 13z\"/><path clip-path=\"url(#b)\" fill=\"#EA4335\" d=\"M0 11l17 13 7-6.1L48 14V0H0z\"/><path clip-path=\"url(#b)\" fill=\"#34A853\" d=\"M0 37l30-23 7.9 1L48 0v48H0z\"/><path clip-path=\"url(#b)\" fill=\"#4285F4\" d=\"M48 48L17 24l-4-3 35-10z\"/></svg>";

/**
 * ListPage is a page with a list kind of layout. It displays an array of items
 * with several properties: an icon, name, adress, whether is is free or not, languages, link, schedules, map button
 */
class ListPage extends Page {
    /**
     * @param {Category} category       - The category to list the items in it
     * @param {ListPageState} [state]   - The state to restore, if present the parameters in the state will replace
     * the ones passed (the passed ones will be ignored).
     */
    constructor(category, state) {
        super(category.name, true, state);

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
            let costAndLang = ListPage.costAndLangHtmlFor(item);

            let textString = `<h3>${item.name}</h3>`;
            textString += `<p class="item-addr">${item.address}</p>`;
            textString += `<div class="item-cost-lang">${costAndLang}</div>`;

            if(item.webLink) {
                textString += `<a class="item-link" href="${item.webLink}" target="_blank"><span>${item.webLink}</span> ${LINK_ICON_SVG}</a>`;
            }

            if(item.callForAppointment) {
                textString += `<a class="item-call" href="tel:${item.phone}">${PHONE_SVG} ${item.phone}</a>`;
            } else {
                textString += `<p class="item-periods">${periods}</p>`;
            }

            if(this.shouldShowMapButton() && item.canBeShownInMap()) {
                textString +=
                    `<button class="item-map map-button" data-item="${item.itemId}">Map ${MAP_BUTTON_SVG}</button>`;
                    //+ `<button class="item-map map-button-google" data-item="${item.itemId}">Map ${GOOGLE_BUTTON_SVG}</button>`;
            }

            htmlString += `<div class='row item-row'><div class="col-4 item-icon"><img src="${iconUrl}"></div>`+
                `<div class="col-8">${textString}</div></div>`;
        }
        if(this.shouldShowMapButton() && this._items.length > 0) {
            // Open-map-with-all-of-them button
            htmlString += `<div class="row">`
                +`<button id="all-items-map" class="map-button" style="background-image: url(${ResourcesProvider.getAllMapsIconUrl()});"></button>`
                +`</div>`;
        }
        container.innerHTML = htmlString;

        if(this.shouldShowMapButton()) {
            this._createMapButtonsCallback(container);
            window.addEventListener('online', (...x)=>this._onOnlineStateChange(...x));
            window.addEventListener('offline', (...x)=>this._onOnlineStateChange(...x));
            this._onOnlineStateChange();
        }
    }

    /**
     * Creates the map buttons callback for the passed div map buttons
     * @param {Element} div - The div to search the map buttons in
     * @private
     */
    _createMapButtonsCallback(div) {
        let callback = (event)=>this._mapsButtonClicked(event);
        let googleCbck = (event)=>this._googleMapsButtonClicked(event);
        let btns = div.getElementsByTagName("button");
        for(let element of btns) {
            if(element.id === 'all-items-map') {
                element.addEventListener('click', callback);
            } else if(element.classList.contains("map-button")) {
                element.addEventListener('click', googleCbck);
            }
        }
    }

    /**
     * Hides or shows the map buttons depending on the network state
     * of online or offline
     * @private
     */
    _onOnlineStateChange() {
        let btns = this.app.getContainer().getElementsByTagName("button");
        let onlineState = (navigator.onLine !== false);
        let display = (onlineState ? "block" : "none");
        for(let element of btns) {
            if(element.classList.contains("item-map") || element.id === "all-items-map") {
                element.style.display = display;
            }
        }
    }

    /**
     * Should be called whenever a button map of the list is clicked
     * @param {MouseEvent} event - The click event
     * @private
     */
    _mapsButtonClicked(event) {
        if(navigator.onLine === false) {
            // This should never be seen, since we hide the buttons
            alert("Maps cannot be shown on offline mode");
            return;
        }
        let itemId = event.currentTarget.getAttribute("data-item");
        let item = this._searchItem(itemId);
        if(item) {
            this.app.navigateToPage(new MapPage(this._category, item));
        }
    }

    _googleMapsButtonClicked(event) {
        let itemId = event.currentTarget.getAttribute("data-item");
        let item = this._searchItem(itemId);
        if(item) {
            let link = ResourcesProvider.getExternalDirectionsUrl(item);
            window.open(link, "_blank");
        }
    }

    /**
     * Returns the item for the given itemId if
     * one is passed or all the items if null is given.
     * @param {?string} itemId
     * @return {Item|Item[]|null} the item if itemId is not null, or
     * all the items of the page if it is null. If an itemId is given
     * but no item matchs the id it returns null.
     * @private
     */
    _searchItem(itemId) {
        let item = null;
        if(itemId) {
            let itemIdInt = parseInt(itemId);
            // Search the item
            for(let itemToCheck of this._items) {
                if(itemToCheck.itemId === itemIdInt) {
                    item = itemToCheck;
                    //title = itemToCheck.name;
                    break;
                }
            }
        } else {
            // If no data-item attribute is set, we show all the items
            item = this._items;
        }
        return item;
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

        // Keep scroll please
        let scroll = this.app.getContainer().scrollTop;

        this.app.clearContainer();
        this.render(this.app.getContainer());

        this.app.getContainer().scrollTop = scroll;
    }

    /**
     * Generates the periods html for the item, grouping periods on sucessive
     * days into single lines.
     * @param {Item} item - The item to print the periods for
     * @return {string}
     * @private
     */
    static _periodsStrFor(item) {
        // We will group periods with the same schedule
        let startedSchedules = Period.groupPeriodsWithSameSchedule(item.openingHours);
        // Now we will print one line per schedule
        let htmlStr = "";
        for(let schedule of startedSchedules) {
            let startDay = schedule.startPeriod.startDayStr();
            let endDay = schedule.endPeriod.startDayStr(); // We suppose periods do not last longer than 24h
            let days =
                startDay !== endDay ?
                `${startDay}-${endDay}` :
                    (schedule.startPeriod.startHour > schedule.startPeriod.endHour ?
                        'Monday-Sunday' : startDay);
            if(schedule.startPeriod.startHour === 0 &&
                schedule.startPeriod.startMinutes === 0 &&
                schedule.startPeriod.endHour === 23 &&
                schedule.startPeriod.endMinutes === 59) {

                htmlStr += `${days}<br>`; // whole day, no hours
            } else {
                let startHour = schedule.startPeriod.startHourStr();
                let endHour = schedule.startPeriod.endHourStr();
                htmlStr += `${days} ${startHour}-${endHour}<br>`;
            }
        }
        return htmlStr;
    }

    static costAndLangHtmlFor(item) {
        let iconPayment = ResourcesProvider.getCostIconUrl(item.isFree?'free':'pay');
        let strHtml = "";
        if(!item.isFree) {
            strHtml = `<img src='${iconPayment}' alt="This item requires payment" title="This item requires payment">`;
        }
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
        state.hash = state.category.itemType + "," + state.category.code;
        return state;
    }

    static navigateFromHash(hash) {
        let svc = new ApiService();
        let matchs = /^([0-9a-z_\-]+),([0-9a-z_\-]+)$/i.exec(hash);
        if(matchs) {
            let itemType = matchs[1];
            let categoryCode = matchs[2];
            svc.getCategories(itemType, (cats) => {
                App.getInstance().navigateToPage(new ListPage(cats[categoryCode]));
            });
        } else {
            console.error("Invalid hash for ListPage");
        }
    }

    /**
     * @param {ListPageState} state
     */
    static fromState(state) {
        if(state.pageClass !== LIST_PAGE_CLASS) {
            throw new Error( `The passed state has not pageClass="${LIST_PAGE_CLASS}"`);
        }
        return new ListPage(state.category, state);
    }
}
/**
 * @typedef {PageState} ListPageState
 * @property {ItemObject[]} items
 * @property {Category} category
 */