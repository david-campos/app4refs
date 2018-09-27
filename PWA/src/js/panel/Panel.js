
const ATTR_ITEM_TYPE = 'data-item-type';
const ATTR_CATEGORY_CODE = 'data-cat-code';

class Panel {
    /**
     * @param {ApiService} svc
     * @param {Token} token
     */
    constructor(svc, token) {
        this._svc = svc;
        this.element = $('main.panel');
        this._errorsPanel = this.element.find("#errorDisplay");
        this._errorNumber = 1;
        this._itemTypesPanel = this.element.find('#itemTypes');
        this._categoriesPanel = this.element.find('#categories');
        this._itemsPanel = new ItemsPanel(this, svc);
        this._categories = [];
        this._categoriesCopy = [];

        let self = this;
        this._clickItemTypeCallback = (event) => {
            self._categories = [];
            self._redrawCategoriesPanel();
            self._itemsPanel.clear();
            self._svc.getCategories(
                $(event.currentTarget).attr(ATTR_ITEM_TYPE),
                self._receivedCategories.bind(self));
        };

        this._clickCategoryCallback = (event) => {
            let catCode = $(event.currentTarget).attr(ATTR_CATEGORY_CODE);
            if(this._categories[catCode])
                self._itemsPanel.populate(this._categories[catCode]);
            else
                console.error("The clicked category is not in the list");
        };

        this.element.find('.nav h4').text(`Welcome, ${token.user}!`);
        this.element.find('.nav #logoutBtn').click(()=>svc.logout(loggedOut));
        this._populateItemTypesPanel();
    }

    /**
     * Displays an error to the user
     * @param {int} status - Http status returned
     * @param {string} errorMessage - Message
     */
    displayError(status, errorMessage) {
        let alert = $(
            `<div class="alert alert-danger alert-dismissible fade show ${(this._errorNumber%2)?'':'dark'}" role="alert">
                <strong>${this._errorNumber++}. Error:</strong> ${errorMessage.htmlEscape()}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
        this._errorsPanel.prepend(alert);
        console.log(status, errorMessage);
    }

    itemDragStart(event) {
        let idx = parseInt($(event.currentTarget).closest("li.media").attr(ATTR_ITEM_IDX));
        this._dragging = true;
        this._categoriesCopy = this._categories;
        event.originalEvent.dataTransfer.setData("item", idx);
        this.element.addClass("dragging");
    }

    _itemDraginCategory(event) {
        if(this._dragging) {
            let leftBtn = $(event.relatedTarget).closest("button");
            let newBtn = $(event.currentTarget).closest("button");
            if(!newBtn.is(leftBtn)) {
                newBtn.addClass("drop-allowed");
            }
        }
    }

    _itemDraginItemType(event) {
        if(this._dragging) {
            // We have a copy of the original categories to restore them!
            this._categories = [];
            this._redrawCategoriesPanel();
            this._svc.getCategories(
                $(event.currentTarget).attr(ATTR_ITEM_TYPE),
                this._receivedCategories.bind(this), this.displayError.bind(this));
        }
    }

    _itemDragover(event) {
        if(this._dragging) {
            // prevent default to allow drop
            event.preventDefault();
        }
    }

    _itemDragout(event) {
        if(this._dragging) {
            let newBtn = $(event.relatedTarget).closest("button");
            let leftBtn = $(event.currentTarget).closest("button");
            if(!newBtn.is(leftBtn)) {
                leftBtn.removeClass("drop-allowed");
            }
        }
    }

    itemDragEnd(event) {
        if(this._dragging) {
            this._dragging = false;
            if (this._categories !== this._categoriesCopy) {
                this._categories = this._categoriesCopy;
                this._redrawCategoriesPanel();
            }
            this.element.removeClass("dragging");
        }
    }

    _itemDrop(event) {
        if(this._dragging) {
            event.preventDefault();

            $(event.currentTarget).removeClass("drop-allowed");

            let categoryCode = $(event.currentTarget).attr(ATTR_CATEGORY_CODE);
            let itemIdx = event.originalEvent.dataTransfer.getData("item");
            this._itemsPanel.itemDragged(itemIdx, categoryCode);
        }
    }

    _populateItemTypesPanel() {
        this._itemTypesPanel.empty();
        ITEM_TYPES.forEach((v)=>{
            if(v !== 'emergency') {
                let icon = ResourcesProvider.getMainMenuIconUrl(v);
                let button = $(`<button ${ATTR_ITEM_TYPE}="${v}" class="list-group-item list-group-item-action" data-toggle="list"><img src='${icon}'></li>`);
                button.click(this._clickItemTypeCallback);
                button.on('dragenter', (e)=>this._itemDraginItemType(e));
                this._itemTypesPanel.append(button);
            }
        });
    }

    _receivedCategories(categories) {
        this._categories = categories;
        this._redrawCategoriesPanel();
    }

    _redrawCategoriesPanel() {
        this._categoriesPanel.empty();
        for(let cat of Object.values(this._categories)) {
            let catIcon = ResourcesProvider.getCategoryIconUrl(cat.code);
            let button = $(`<button ${ATTR_CATEGORY_CODE}="${cat.code}" class="list-group-item list-group-item-action" data-toggle="list"><img src='${catIcon}'></li>`);
            button.click(this._clickCategoryCallback);
            button
                .on('dragover', (e)=>this._itemDragover(e))
                .on('dragenter', (e)=>this._itemDraginCategory(e))
                .on('dragleave', (e)=>this._itemDragout(e))
                .on('drop', (e)=>this._itemDrop(e));
            this._categoriesPanel.append(button);
        }
    }
}