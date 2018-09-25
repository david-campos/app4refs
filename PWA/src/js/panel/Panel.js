
const ATTR_ITEM_TYPE = 'data-item-type';
const ATTR_CATEGORY_CODE = 'data-cat-code';

class Panel {
    /**
     * @param {ApiService} svc
     * @param {Token} token
     */
    constructor(svc, token) {
        this._svc = svc;
        this._itemTypesPanel = $('main.panel #itemTypes');
        this._categoriesPanel = $('main.panel #categories');
        this._itemsPanel = new ItemsPanel(svc);
        this._categories = [];

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
            self._itemsPanel.populate(
                $(event.currentTarget).attr(ATTR_CATEGORY_CODE));
        };

        $('main.panel h4').text(`Welcome, ${token.user}!`);
        this._populateItemTypesPanel();
    }

    _populateItemTypesPanel() {
        this._itemTypesPanel.empty();
        ITEM_TYPES.forEach((v)=>{
            if(v !== 'emergency') {
                let icon = ResourcesProvider.getMainMenuIconUrl(v);
                let button = $(`<button ${ATTR_ITEM_TYPE}="${v}" class="list-group-item list-group-item-action" data-toggle="list"><img src='${icon}'></li>`);
                button.click(this._clickItemTypeCallback);
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
            this._categoriesPanel.append(button);
        }
    }
}