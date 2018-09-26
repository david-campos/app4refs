
const ATTR_ITEM_IDX = 'data-item-idx';

class ItemsPanel {
    constructor(panel, svc) {
        this._svc = svc;
        this._panel = panel;
        this._items = [];
        this._itemsPanel = $('main.panel #items');
        this._deletionModal = $('#deletionModal');
        this._deletionModal.find("#delConfBtn").click((e)=>this._confirmDeletion(e));
        this._itemToDeleteIdx = null;
        this._editedLi = null;
    }

    populate(categoryCode) {
        this.clear();
        this._svc.getItems(categoryCode, this._receivedItems.bind(this));
    }

    _receivedItems(items) {
        this._items = items;
        this.redraw();
    }

    clear() {
        this._items = [];
        this.redraw();
    }

    redraw() {
        this._editedLi = null;
        this._itemsPanel.empty();
        for(let i=0; i < this._items.length; i++) {
            let item = this._items[i];
            let li = $(ItemsPanel._htmlForItem(i, item));
            li.find("button.edit").click((e)=>this._editClicked(e));
            li.find("button.delete-item").click((e)=>this._deleteItemClicked(e));
            let moveButton = li.find("button.move-item");
            moveButton.on('dragstart', (e)=>this._itemDragStart(e));
            moveButton.on('dragend', (e)=>this._itemDragEnd(e));
            this._itemsPanel.append(li);
        }
    }

    itemDragged(itemIdx, categoryCode) {
        console.log("Lets move", this._items[itemIdx], "to", categoryCode);
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
            }.bind(this));
        }
    }

    _editClicked(event) {
        let idx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));

        // Cancel previous edition
        this.redraw();

        /** @type Item */
        let item = this._items[idx];
        this._editedLi = this._itemsPanel.find("li.media:nth-child("+(idx+1)+")");

        this._editedLi.addClass("edited");
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
        this._editedLi.find("button#cancelBtn").click((e)=>this._cancelEdition(e));
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

        this._editedLi.find("#periodsRow")
            .append($(ItemsPanel._htmlForPeriodEdition(
                new Period({
                    periodId: 0,
                    startDay: PERIOD_DAYS[0],
                    startHour: 0,
                    startMinutes: 0,
                    endDay: PERIOD_DAYS[0],
                    endHour: 23,
                    endMinutes: 59
                }))));
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

    _cancelEdition(event) {
        event.preventDefault();

        this._editedLi = null;
        this.redraw();
    }

    /*###########################################################################
     * HTML GENERATION
     ###########################################################################*/
    static _htmlForItem(i, item) {
        let greekBtn = (item.languageCodes.indexOf('el') > -1?'info':'secondary');
        let engliBtn = (item.languageCodes.indexOf('en') > -1?'info':'secondary');
        let schedule = item.phone;
        if(!item.callForAppointment) {
            schedule = periodsStrFor(item);
        }
        return `<li class="media" ${ATTR_ITEM_IDX}="${i}">
                    <img class="mr-3 item-icon" src="${ResourcesProvider.getItemIconUrl(item)}" alt="${item.name}">
                    <div class="media-body">
                        <button type="button" class="btn btn-secondary move-item" draggable="true"><i class="fas fa-arrows-alt"></i></button>
                        <button type="button" class="btn btn-secondary delete-item"><i class="fas fa-trash-alt"></i></button>
                        <h3 class="mt-0 mb-1 item-name">${item.name}</h3>
                        <p class="item-addr">${item.address}</p>
                        <p class="item-coords">${item.coordLat}; ${item.coordLon}</p>
                        <p>
                        <button type="button" class="btn btn-success item-price"> ${item.isFree?'€':'&nbsp;'}</button>
                        <button type="button" class="btn btn-${engliBtn} item-english">English</button>
                        <button type="button" class="btn btn-${greekBtn} item-greek">Greek</button>
                        </p>
                        <a class="item-link" href="${item.webLink}">${item.webLink}</a>
                        <p class="item-cfap">${item.callForAppointment?'✓':'✕'} Call for appointment</p>
                        <p class="item-sched">${schedule}</p>
                        <button class="btn btn-primary edit"><i class="fas fa-pen"></i> Edit</button>
                    </div>
                </li>`;
    }

    static _htmlForEditionForm(item) {
        let inEnglish = (item.languageCodes.indexOf('en') > -1);
        let inGreek = (item.languageCodes.indexOf('el') > -1);
        let webLink = (item.webLink?item.webLink.replace('"', '\\"'):'Null');
        let addressRequired = (item.callForAppointment?'':'required');
        let phoneReadOnly = (item.callForAppointment?'':'readonly');
        let phone = (item.phone?item.phone.replace('"', '\\"'):'Null');

        return `<form><div class="form-group row">
                <label for="itemName" class="col-2 col-form-label">Name</label>
                <div class="col-10">
                  <input type="text" class="form-control" id="itemName" value="${item.name.replace('"','\\"')}" required>
                </div>
            </div>
            <div class="form-group row">
                <label for="itemAddr" class="col-2 col-form-label">Address</label>
                <div class="col-10">
                  <input type="text" class="form-control" id="itemAddr" value="${item.address.replace('"', '\\"')}" ${addressRequired}>
                </div>
            </div>
            <div class="form-group row">
                <label for="itemCoords" class="col-2 col-form-label">Coords</label>
                <div class="col-5">
                  <input type="text" class="form-control" id="itemLat" value="${item.coordLat}">
                </div>
                <div class="col-5">
                  <input type="text" class="form-control" id="itemLon" value="${item.coordLon}">
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
                <div class="col-3"><select class="custom-select form-control-sm">${selectStartOpts}</select></div>
                <div class="col-3"><input class="form-control" type="time" value="${startH}:${startM}" required></div>
                <div class="col-3"><select class="custom-select  form-control-sm">${selectEndOpts}</select></div>
                <div class="col-3"><input class="form-control" type="time" value="${endH}:${endM}" required></div></div></div>`;
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