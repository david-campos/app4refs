/**
 * @callback OnImageChangeConfirmedCallback
 * @param {Item} item - The edited item
 * @param {string} imageBase64 - The image in base64 encoding
 */

class ImageModal {
    constructor() {
        this._imageModal = $('#imageModal');
        this._imageCrop = this._imageModal.find('.modal-body').croppie({
            viewport: {width: 300, height: 300, type: 'square'}
        });
        this._croppieBindOpts = {
            zoom: true
        };
        this._imageModal.on('shown.bs.modal', ()=>this._imageCrop.croppie('bind', this._croppieBindOpts));
        this._imageModal.find('#changeImageBtn').click((e)=>this._imageChangeConfirmed(e));

        let self = this;
        this._onchangeCallback = function(){self._readImageAndBind(this);};

        /**
         * @type {?Item}
         * @private
         */
        this._editedItem = null;

        /**
         * @type {?OnImageChangeConfirmedCallback}
         */
        this.onImageChangeConfirmed = null;
    }

    /**
     * Shows the modal to change the icon of the given item
     * @param {Item} item - The item to change the icon for
     */
    show(item) {
        this._editedItem = item;
        $('<input type="file" value="Choose a file" accept="image/*" hidden>')
            .on('change', this._onchangeCallback)
            .click();
    }

    /**
     * Reads the picked image in the input and binds it into croppie
     * @param {HTMLInputElement} input
     * @throws {string} If the FileReader API is not supported by the browser
     * @private
     */
    _readImageAndBind(input) {
        if(!input.files) {
            throw 'FileReader API not supported by your browser. Please, update.';
        }

        if(input.files[0]) {
            let reader = new FileReader();
            reader.onload = function(e) {
                this._croppieBindOpts.url = e.target.result;
                this._imageModal.modal('show');
                $(input).unbind('change', this._onchangeCallback);
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }
    }

    _imageChangeConfirmed() {
        this._imageModal.modal('hide');
        this._imageCrop.croppie('result', {
            type: 'base64',
            size: 'viewport',
            format: 'png'
        }).then(function(resp){
            if(this._editedItem && this.onImageChangeConfirmed) {
                this.onImageChangeConfirmed(this._editedItem, resp);
            }
        }.bind(this));
    }
}