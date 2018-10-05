
const ATTR_ITEM_IDX = 'data-item-idx';

class ItemsPanel {
    constructor(panel, svc) {
        /** @type {ApiService} */
        this._svc = svc;
        /** @type {Panel} */
        this._panel = panel;
        /** @type {Item[]} */
        this._items = [];
        /** @type {?Category} */
        this._currentCategory = null;
        this._itemsCol = this._panel.element.find('#itemsCol');
        this._itemsPanel = this._itemsCol.find('#items');
        this._categoryCodeHolder = this._itemsCol.find("#categoryCode");
        this._categoryNameHolder = this._itemsCol.find("#categoryName");
        this._categoryLinkHolder = this._itemsCol.find("#categoryLink");
        this._addItemBtn = this._panel.element.find('#addItemBtn');
        this._addItemBtn.click((e)=>this._addItemClicked(e));

        this._deletionModal = $('#deletionModal');
        this._deletionModal.find("#delConfBtn").click((e)=>this._confirmDeletion(e));

        this._imageModal = new ImageModal();
        this._imageModal.onImageChangeConfirmed = (...x)=>this._imageChanged(...x);

        /** @type {?int} */
        this._itemToDeleteIdx = null;
        this._editedLi = null;

        this._orderChangeCallback = (e)=>this._orderChangeClicked(e);
    }

    populate(category) {
        this.clear();
        this._currentCategory = category;
        this._svc.getItems(category.code,
            this._receivedItems.bind(this),
            this._panel.displayError.bind(this._panel));
    }

    _receivedItems(items) {
        this._items = items;
        this.redraw();
    }

    clear() {
        this._items = [];
        this._currentCategory = null;
        this.redraw();
    }

    redraw() {
        this._editedLi = null;
        this._itemsPanel.empty();

        if(this._currentCategory) {
            this._itemsCol.removeAttr("hidden");
            this._categoryCodeHolder.text(this._currentCategory.code);
            this._categoryNameHolder.text(this._currentCategory.name);
            this._categoryLinkHolder.text(this._currentCategory.link ? this._currentCategory.link : 'None');
            this._categoryLinkHolder.attr("href", this._currentCategory.link ? this._currentCategory.link : '#');

            for (let i = 0; i < this._items.length; i++) {
                let item = this._items[i];
                let li = $(ItemsPanel._htmlForItem(i, item));
                li.find("button.order-change").click(this._orderChangeCallback);
                li.find("button.edit").click((e) => this._editClicked(e));
                li.find("button.delete-item").click((e) => this._deleteItemClicked(e));
                let moveButton = li.find("button.move-item");
                moveButton.on('dragstart', (e) => this._itemDragStart(e));
                moveButton.on('dragend', (e) => this._itemDragEnd(e));
                li.find(".item-icon").click((e)=>this._itemIconClicked(e));
                this._itemsPanel.append(li);
            }
        } else {
            this._itemsCol.attr("hidden", true);
        }
    }

    itemDragged(itemIdx, categoryCode) {
        let item = this._items[itemIdx];
        item.categoryCode = categoryCode;
        this._svc.saveItem(
            item,
            (item)=>this._itemUpdated(itemIdx, item),
            this._panel.displayError.bind(this._panel));
    }

    _itemUpdated(itemIdx, item) {
        if(this._items[itemIdx].itemId === -1 ||
                this._items[itemIdx].itemId === item.itemId) {
            if(item.categoryCode === this._currentCategory.code) {
                this._items.splice(itemIdx, 1);
                this._addToItems(item);
            } else {
                this._items.splice(itemIdx, 1);
            }
            this.redraw();
        }
    }

    /**
     * Places the item in the correspondent place,
     * supposing they have to be ordered by order preference,
     * whether they are free or not and item id.
     * @param {Item} item
     * @private
     */
    _addToItems(item) {
        let orders = ['first','second','third','rest'];
        let i=0;
        let itemPref = orders.indexOf(item.orderPreference);
        for( ; i < this._items.length; i++) {
            let other = this._items[i];
            let otherPref = orders.indexOf(other.orderPreference);
            if(otherPref > itemPref) break;
            else if(otherPref === itemPref) {
                if(item.isFree && !other.isFree) break;
                else if(other.isFree === item.isFree) {
                    if(other.itemId > item.itemId) break;
                }
            }
        }
        this._items.splice(i, 0, item);
    }

    _itemDragStart(event) {
        $(event.currentTarget).closest("li").addClass("chosen");
        this._panel.itemDragStart(event);
    }

    _itemDragEnd(event) {
        $(event.currentTarget).closest("li").removeClass("chosen");
        this._panel.itemDragEnd(event);
    }

    _deleteItemClicked(event) {
        let idx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));

        /** @type Item */
        let item = this._items[idx];

        this._cancelEdition();

        this._itemToDeleteIdx = idx;
        this._deletionModal.find(".modal-body b").text(item.name);
        this._deletionModal.modal('show');
    }

    _confirmDeletion() {
        this._deletionModal.modal('hide');
        let idx = this._itemToDeleteIdx;
        this._itemToDeleteIdx = null;
        if(idx !== null) {
            this._svc.deleteItem(this._items[idx], function() {
                this._items.splice(idx, 1);
                this.redraw();
            }.bind(this), this._panel.displayError.bind(this._panel));
        }
    }

    _editClicked(event) {
        let idx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));
        this._editItem(idx);
    }

    _editItem(idx) {
        // Cancel previous edition
        this._cancelEdition();

        let item = this._items[idx];
        this._editedLi = this._itemsPanel.find("li.media:nth-child("+(idx+1)+")");

        this._editedLi.addClass("edited");
        this._editedLi.attr("original-order", item.orderPreference); // Order could be changed during edition
        this._editedLi.find(".media-body").html(ItemsPanel._htmlForEditionForm(item));

        let periodsRow = this._editedLi.find("#periodsRow");
        for(let period of item.openingHours) {
            let newPeriod = $(ItemsPanel._htmlForPeriodEdition(period));
            newPeriod.find(".delete-period").click((e)=>this._deletePeriodClicked(e));
            periodsRow.append(newPeriod);
        }
        this._editedLi.find("button#tryItemLink").click((e)=>this._tryItemLinkClicked(e));
        this._editedLi.find("button#addPeriodBtn").click((e)=>this._addPeriodClicked(e));
        this._editedLi.find("input#itemCfa").change((e)=>this._cfaChanged(e));
        this._editedLi.find("button#cancelBtn").click((e)=>this._cancelEditionClick(e));
        this._editedLi.find("form").submit((e)=>this._submitEdition(e));

        this._editedLi.find("input#itemName").focus();
    }

    _submitEdition(event) {
        event.preventDefault();

        let itemIdx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));
        let item = this._items[itemIdx];

        let callForAppointment = this._editedLi.find("#itemCfa").is(":checked");
        let periods;
        if(!callForAppointment) {
            periods = this._getEditedPeriodsOn(item);
            let overlapped = ItemsPanel._thereArePeriodsOverlappingIn(periods);
            if(overlapped) {
                let a = overlapped[0]+1;
                let b = overlapped[1]+1;
                this._panel.displayError(
                    0,
                    `The periods ${a} and ${b} are overlapped, please, specify periods which do not overlap.`);
                return;
            }
        }

        item.name = this._editedLi.find("#itemName").val();
        item.address = this._editedLi.find("#itemAddr").val();
        item.coordLat = this._editedLi.find("#itemLat").val();
        item.coordLon = this._editedLi.find("#itemLon").val();
        item.isFree = this._editedLi.find("#itemFree").is(":checked");
        item.webLink = this._editedLi.find("#itemLink").val();
        item.callForAppointment = callForAppointment;

        if(item.callForAppointment) {
            item.phone = this._editedLi.find("#itemPhone").val();
        } else {
            item.openingHours = periods;
        }

        let langs = [];
        if(this._editedLi.find("#itemEnglish").is(":checked")) {
            langs.push('en');
        }
        if(this._editedLi.find("#itemGreek").is(":checked")) {
            langs.push('el');
        }
        item.languageCodes = langs;

        if(item.itemId === -1) {
            // -1 indicates it is created, not updated
            console.log(item);
            this._svc.createItem(
                item,
                (item)=>this._itemUpdated(itemIdx, item),
                this._panel.displayError.bind(this._panel));
        } else {
            this._svc.saveItem(
                item,
                (item) => this._itemUpdated(itemIdx, item),
                this._panel.displayError.bind(this._panel));
        }
    }

    /**
     * @param {Period[]} periods
     * @return {boolean|[number]} - False if they do not overlap, or the pair of overlapping periods
     * @private
     */
    static _thereArePeriodsOverlappingIn(periods) {
        for(let i=0; i < periods.length-1; i++) {
            for(let j=i+1; j < periods.length; j++) {
                if(periods[i].overlaps(periods[j]))
                    return [i,j];
            }
        }
        return false;
    }

    _getEditedPeriodsOn(item) {
        let newPeriods = this._getEditedPeriods();
        // Preserve all the item periods we can
        for(let i=0; i<item.openingHours.length && i<newPeriods.length; i++) {
            newPeriods[i].periodId = item.openingHours[i].periodId;
        }
        return newPeriods;
    }

    /**
     * @return {Period[]}
     * @private
     */
    _getEditedPeriods() {
        let periods = [];
        let periodDivs = this._editedLi.find("#periodsRow .period");
        periodDivs.each(function(){
            let startDay = $(this).find(".period-start-day").val();
            let startHour = $(this).find(".period-start-hour").val();
            let endDay = $(this).find(".period-end-day").val();
            let endHour = $(this).find(".period-end-hour").val();
            periods.push(new Period({
                periodId: 'new',
                startDay: startDay,
                startHour: parseInt(startHour.substring(0, 2)),
                startMinutes: parseInt(startHour.substring(3)),
                endDay: endDay,
                endHour: parseInt(endHour.substring(0, 2)),
                endMinutes: parseInt(endHour.substring(3))
            }));
        });
        return periods;
    }

    _deletePeriodClicked(event) {
        event.preventDefault();

        if(!this._editedLi) return;

        $(event.currentTarget).closest("div.period").remove();
    }

    _tryItemLinkClicked(event) {
        event.preventDefault();

        if(!this._editedLi) return;

        window.open(this._editedLi.find("#itemLink").val(), '_blank');
    }

    _addPeriodClicked(event) {
        event.preventDefault();

        if(!this._editedLi) return;

        let newPeriod = $(ItemsPanel._htmlForPeriodEdition(
            new Period({
                periodId: 0,
                startDay: PERIOD_DAYS[0],
                startHour: 0,
                startMinutes: 0,
                endDay: PERIOD_DAYS[0],
                endHour: 23,
                endMinutes: 59
            })));
        newPeriod.find(".delete-period").click((e)=>this._deletePeriodClicked(e));
        this._editedLi.find("#periodsRow").append(newPeriod);
    }

    _cfaChanged(event) {
        if(!this._editedLi) return;
        if($(event.currentTarget).is(':checked')) {
            this._editedLi.find("#periodsRow,#addPeriodRow").hide();
            this._editedLi.find("#itemPhone").removeAttr('readonly');
            this._editedLi.find("#itemAddr").removeAttr('required');
        } else {
            this._editedLi.find("#periodsRow,#addPeriodRow").removeAttr('hidden');
            this._editedLi.find("#periodsRow,#addPeriodRow").show();
            this._editedLi.find("#itemPhone").attr('readonly', true);
            this._editedLi.find("#itemAddr").attr('required', true);
        }
    }

    _cancelEditionClick(event) {
        event.preventDefault();
        this._cancelEdition();
    }

    _cancelEdition() {
        if(this._editedLi) {
            let itemIdx = this._editedLi.attr(ATTR_ITEM_IDX);
            // If the item has id -1 it means we are creating it, so we have to delete it.
            if (this._items[itemIdx].itemId === -1) {
                this._items.splice(itemIdx, 1);
            } else {
                // Restore the order
                this._items[itemIdx].orderPreference =
                    this._editedLi.attr("original-order");
            }
        }
        this._editedLi = null;
        this.redraw();
    }

    _addItemClicked(event) {
        if(!this._currentCategory) {
            this._panel.displayError(0, 'To create a new item, select a category first.');
            return;
        }

        this._items.push(new Item({
            itemId: -1,
            orderPreference: 'rest',
            name: '',
            address: '',
            webLink: null,
            placeId: null,
            iconUri: 'no_icon.png',
            isFree: false,
            coordLat: null,
            coordLon: null,
            phone: null,
            callForAppointment: false,
            categoryCode: this._currentCategory.code,
            languageCodes: [],
            openingHours: []
        }));
        this._cancelEdition();
        this._editItem(this._items.length-1);
    }

    _orderChangeClicked(event) {
        let li = $(event.currentTarget).closest("li.media");
        let idx = parseInt(li.attr(ATTR_ITEM_IDX));
        let edited = li.hasClass('edited');
        let item = this._items[idx];
        item.orderPreference = $(event.currentTarget).attr("data-order");

        // Find the representation and change it
        let mark = $(event.currentTarget).closest(".item-order").find(".order-mark");
        mark.attr("data-order", item.orderPreference);
        mark.html(ItemsPanel._orderMarkerText(item.orderPreference));

        // If we are not editing it, send the item to be saved
        if(!edited) {
            this._svc.saveItem(
                item,
                (item) => this.populate(this._currentCategory),
                this._panel.displayError.bind(this._panel));
        }
    }

    _itemIconClicked(event) {
        let idx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));
        /** @type Item */
        let item = this._items[idx];
        if(item.itemId !== -1) {
            this._imageModal.show(item);
        }
    }

    /**
     * @param {Item} item - Item to change
     * @param {string} newImage - Picked image in base64
     * @private
     */
    _imageChanged(item, newImage) {
        this._svc.changeIcon(
            item, newImage,
            (item) => this.populate(this._currentCategory),
            this._panel.displayError.bind(this._panel));
    }

    static _orderMarkerText(preference) {
        switch(preference) {
            case 'first': return '1<sup>st</sup>';
            case 'second': return '2<sup>nd</sup>';
            case 'third': return '3<sup>rd</sup>';
            default: return 'Any';
        }
    }

    /*###########################################################################
     * HTML GENERATION
     ###########################################################################*/
    static _htmlForItem(i, item) {
        let greekBtn = (item.languageCodes.indexOf('el') > -1?'info':'secondary');
        let engliBtn = (item.languageCodes.indexOf('en') > -1?'info':'secondary');
        let coords = (isNaN(item.coordLat)||isNaN(item.coordLon)?'No coordinates':item.coordLat+';'+item.coordLon);
        let order = ItemsPanel._orderMarkerText(item.orderPreference);
        let schedule = item.phone;
        if(!item.callForAppointment) {
            schedule = periodsStrFor(item);
        }
        return `<li class="media" ${ATTR_ITEM_IDX}="${i}">
                    <div class="mr-3 item-left-col">
                        <div class="item-icon">
                            <div class="overlay"><span>Click to change</span></div>
                            <img src="${ResourcesProvider.getItemIconUrl(item)}?random=${Math.random()}" title="${item.name}">
                        </div>
                        <h6>Order preference:</h6>
                        <div class="item-order">
                            <div class="order-mark" data-order="${item.orderPreference}">${order}</div>
                            <div class="dropdown">
                              <button class="btn btn-secondary btn-block dropdown-toggle" type="button" id="orderMenuButton${i}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Change
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton${i}">
                                <button class="dropdown-item order-change" data-order="first">First</button>
                                <button class="dropdown-item order-change" data-order="second">Second</button>
                                <button class="dropdown-item order-change" data-order="third">Third</button>
                                <button class="dropdown-item order-change" data-order="rest">None</button>
                              </div>
                            </div>
                        </div>
                    </div>                    
                    <div class="media-body">
                        <button type="button" class="btn btn-secondary move-item" draggable="true"><i class="fas fa-arrows-alt"></i></button>
                        <button type="button" class="btn btn-secondary delete-item"><i class="fas fa-trash-alt"></i></button>
                        <h3 class="mt-0 mb-1 item-name">${item.name.htmlEscape()}</h3>
                        <p class="item-addr">${item.address?item.address:'No address'}</p>
                        <p class="item-coords">${coords}</p>
                        <p>
                        <button type="button" class="btn btn-success item-price"> ${item.isFree?'Free':'€'}</button>
                        <button type="button" class="btn btn-${engliBtn} item-english">English</button>
                        <button type="button" class="btn btn-${greekBtn} item-greek">Greek</button>
                        </p>
                        <a class="item-link" href="${item.webLink?item.webLink:'#'}">${item.webLink?item.webLink:'No link'}</a>
                        <p class="item-cfap">${item.callForAppointment?'✓':'✕'} Call for appointment</p>
                        <p class="item-sched">${schedule}</p>
                        <button class="btn btn-primary edit"><i class="fas fa-pen"></i> Edit</button>
                    </div>
                </li>`;
    }

    static _htmlForEditionForm(item) {
        let inEnglish = (item.languageCodes.indexOf('en') > -1);
        let inGreek = (item.languageCodes.indexOf('el') > -1);
        let webLink = (item.webLink?item.webLink.replace('"', '\\"'):'');
        let addressRequired = (item.callForAppointment?'':'required');
        let phoneReadOnly = (item.callForAppointment?'':'readonly');
        let phone = (item.phone?item.phone.replace('"', '\\"'):'');

        return `<form><div class="form-group row">
                <label for="itemName" class="col-2 col-form-label">Name</label>
                <div class="col-10">
                  <input type="text" class="form-control" id="itemName" value="${item.name.replace('"','\\"')}" required>
                </div>
            </div>
            <div class="form-group row">
                <label for="itemAddr" class="col-2 col-form-label">Address</label>
                <div class="col-10">
                  <input type="text" class="form-control" id="itemAddr" value="${item.address?item.address.replace('"', '\\"'):''}" ${addressRequired}>
                </div>
            </div>
            <div class="form-group row">
                <label class="col-2 col-form-label">Coords</label>
                <div class="col-5">
                  <input type="text" class="form-control" id="itemLat" value="${isNaN(item.coordLat)?'':item.coordLat}">
                </div>
                <div class="col-5">
                  <input type="text" class="form-control" id="itemLon" value="${isNaN(item.coordLon)?'':item.coordLon}">
                </div>
            </div>
            <div class="form-group row">
                <div class="custom-control custom-checkbox col-3 offset-1">
                  <input type="checkbox" class="custom-control-input" id="itemFree" ${item.isFree?'checked':''}>
                  <label class="custom-control-label" for="itemFree">Free</label>
                </div>
                <div class="custom-control custom-checkbox col-3">
                  <input type="checkbox" class="custom-control-input" id="itemEnglish" ${inEnglish?'checked':''}>
                  <label class="custom-control-label" for="itemEnglish">English</label>
                </div>
                <div class="custom-control custom-checkbox col-3">
                  <input type="checkbox" class="custom-control-input" id="itemGreek" ${inGreek?'checked':''}>
                  <label class="custom-control-label" for="itemGreek">Greek</label>
                </div>
            </div>
            <div class="form-group row linkRow">
                <label for="itemLink" class="col-2 col-form-label">Link</label>
                <div class="col-9">
                  <input type="url" class="form-control" id="itemLink" value="${webLink}">
                </div>
                <button class="btn btn-secondary col-1" id="tryItemLink" type="button"><i class="fas fa-external-link-alt"></i></button>
            </div>
            <div class="form-group row row-cfa">
                <div class="custom-control custom-checkbox col-3 offset-1 control-cfa">
                  <input type="checkbox" class="custom-control-input" id="itemCfa"  ${item.callForAppointment?'checked':''}>
                  <label class="custom-control-label" for="itemCfa">Make call</label>
                </div>
                <label for="itemPhone" class="col-2 col-form-label">Phone</label>
                <div class="col-6">
                  <input type="tel" ${phoneReadOnly} class="form-control" id="itemPhone" value="${phone}">
                </div>
            </div>
            <div class="form-group" id="periodsRow" ${item.callForAppointment?'hidden':''}>
                <h5 class="col-12">Periods</h5>
            </div>
            <div class="form-group row" id="addPeriodRow" ${item.callForAppointment?'hidden':''}>
                <div class="col-12"><button id="addPeriodBtn" class="btn btn-primary btn-block" type="button"><i class="fas fa-plus"></i> Add period</button></div>
            </div>
            <div class="form-group row">
                <div class="col-6"><button id="cancelBtn" class="btn btn-danger btn-block" type="button"><i class="fas fa-times"></i> Cancel</button></div>
                <div class="col-6"><button class="btn btn-success btn-block" type="submit"><i class="fas fa-save"></i> Submit</button></div>
            </div>
            </form>`;
    }

    /**
     * @param {Period} period
     * @private
     */
    static _htmlForPeriodEdition(period) {
        let selectStartOpts = ItemsPanel._htmlForDayOptions(period.startDay);
        let selectEndOpts = ItemsPanel._htmlForDayOptions(period.endDay);
        let startH = (period.startHour < 10 ? '0'+period.startHour : period.startHour);
        let startM = (period.startMinutes < 10 ? '0'+period.startMinutes : period.startMinutes);
        let endH = (period.endHour < 10 ? '0'+period.endHour : period.endHour);
        let endM = (period.endMinutes < 10 ? '0'+period.endMinutes : period.endMinutes);

        return  `<div class="period">
                <button class="btn btn-danger delete-period" type="button"><i class="far fa-calendar-times"></i></button>
                <div class="row no-gutters">
                    <small class="col-6">Start</small><small class="col-6">End</small>
                </div>
                <div class="row no-gutters">
                <div class="col-3"><select class="custom-select form-control-sm period-start-day">${selectStartOpts}</select></div>
                <div class="col-3"><input class="form-control period-start-hour" type="time" value="${startH}:${startM}" required></div>
                <div class="col-3"><select class="custom-select  form-control-sm period-end-day">${selectEndOpts}</select></div>
                <div class="col-3"><input class="form-control period-end-hour" type="time" value="${endH}:${endM}" required></div></div></div>`;
    }

    static _htmlForDayOptions(selectedDay) {
        let html = "";
        for(let dayKey in PERIOD_DAYS_STRS) {
            if(PERIOD_DAYS_STRS.hasOwnProperty(dayKey)) {
                let selected = (dayKey === selectedDay ? 'selected' : '');
                html += `<option ${selected} value="${dayKey}">${PERIOD_DAYS_STRS[dayKey]}</option>`;
            }
        }
        return html;
    }
}