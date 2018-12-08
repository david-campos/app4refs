
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
        this._passwordChangeForm = $('#passwordChangeModal').find('form');
        this._passwordChangeForm.submit((event)=>this._changePassword(event));
        $('#confirmPasswordBtn').click(()=>this._passwordChangeForm.submit());
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

    /**
     * Displays a log to the user
     * @param {string} message - Message
     * @param {string} alertType - Bootstrap alert type (success, info, primary...)
     */
    log(message, alertType='success') {
        let alert = $(
            `<div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
                <strong>Info:</strong> ${message.htmlEscape()}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
        this._errorsPanel.prepend(alert);
    }

    itemDragStart(event) {
        let li = $(event.currentTarget).closest("li.media");
        let idx = parseInt(li.attr(ATTR_ITEM_IDX));
        this._dragging = true;
        this._categoriesCopy = this._categories;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData("item", idx);
        this.element.addClass("dragging");

        if (event.dataTransfer.setDragImage instanceof Function) {
            let img = li.find(".item-icon img")[0];
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.3;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            event.dataTransfer.setDragImage(canvas, img.width / 2, img.height / 2);
        }
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
            event.dataTransfer.dropEffect = 'move';
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
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();

            $(event.currentTarget).removeClass("drop-allowed");

            let categoryCode = $(event.currentTarget).attr(ATTR_CATEGORY_CODE);
            let itemIdx = event.dataTransfer.getData("item");
            console.log(event.dataTransfer.getData("item"), event.dataTransfer);
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

    _changePassword(event) {
        event.preventDefault();

        let passIpt = this._passwordChangeForm.find("#currentPass");
        let invalidPass = this._passwordChangeForm.find("#invalidCurrentPass");
        let newPassIpt = this._passwordChangeForm.find("#newPass");
        let invalidNewPass = this._passwordChangeForm.find("#invalidNewPass");
        let repeatPassIpt = this._passwordChangeForm.find("#repeatPass");
        let invalidRepeatPass = this._passwordChangeForm.find("#invalidRepeatPass");

        invalidPass.text('');
        invalidNewPass.text('');
        invalidRepeatPass.text('');

        let pass = passIpt.val();
        let newPass = newPassIpt.val();
        let repeatPass = repeatPassIpt.val();

        if(!pass) {
            invalidPass.text('Introduce your password');
        }
        if(!newPass) {
            invalidNewPass.text('Introduce your new password');
        }
        if(!repeatPass) {
            invalidRepeatPass.text('Repeat your new password');
        }

        if(!(pass && repeatPass && newPass))
            return;

        if(repeatPass !== newPass) {
            invalidRepeatPass.text('The new password and the repetition do not match.');
        } else {
            $('#passwordChangeModal').modal('hide');
            this._svc.changePassword(pass, newPass,
                ()=>this.log('Password changed.'),
                this.displayError.bind(this));
        }
    }

    _receivedCategories(categories) {
        this._categories = categories;
        this._redrawCategoriesPanel();
    }

    _redrawCategoriesPanel() {
        this._categoriesPanel.empty();
        let cbDragOver = (e)=>this._itemDragover(e);
        let cbDragEnter = (e)=>this._itemDraginCategory(e);
        let cbDragLeave = (e)=>this._itemDragout(e);
        let cbDragDrop = (e)=>this._itemDrop(e);
        for(let cat of Object.values(this._categories)) {
            let catIcon = ResourcesProvider.getCategoryIconUrl(cat.code);
            let button = $(`<button ${ATTR_CATEGORY_CODE}="${cat.code}" class="list-group-item list-group-item-action" data-toggle="list"><img src='${catIcon}'></li>`);
            button.click(this._clickCategoryCallback);
            button.on('dragenter', cbDragEnter)
                .on('dragleave', cbDragLeave);
            button[0].addEventListener('drop', cbDragDrop, false);
            button[0].addEventListener('dragover', cbDragOver, false);
            this._categoriesPanel.append(button);
        }
    }
}