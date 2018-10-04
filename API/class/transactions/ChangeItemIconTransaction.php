<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\FileWritingException;
use exceptions\InvalidImageException;
use exceptions\RequestParsingException;
use formats\IApiOutputter;
use gateways\GatewayFactory;
use SessionManager;

class ChangeItemIconTransaction extends Transaction {
    /** @var int */
    private $itemId;
    /** @var string */
    private $image;

    /**
     * CreateItemTransaction constructor.
     * @param array $requestParams The params of the request, including body parsed and get params
     */
    public function __construct($requestParams) {
        // Item id is passed in the URL
        SessionManager::getInstance()->requireToken($requestParams);
        $this->itemId = $requestParams['get']['itemId'];
        $this->image = $requestParams['body']['image'];
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {
        $itemsGtw = GatewayFactory::getInstance()->getItemsGateway();
        GatewayFactory::getInstance()->startTransaction();
        $item = $itemsGtw->findItem($this->itemId);
        $icon = $item->getIconUri();
        $this->deleteIfExists($icon);
        $newIcon = $this->saveImage($this->image, $this->itemId);
        $item->setIconUri($newIcon);
        $item->saveItem();
        $this->status = IApiOutputter::HTTP_OK;
        $this->result = [];
        GatewayFactory::getInstance()->commit();
    }

    private function deleteIfExists($icon) {
        if(isset($icon) && trim($icon) !== '') {
            $iconFile = \IApiInterface::ITEM_ICONS_DIR.$icon;
            if(file_exists($iconFile)) {
                unlink($iconFile);
            }
        }
    }

    private function saveImage($image, $itemId) {
        $parts = explode(',', $image);
        if(count($parts) !== 2 || $parts[0] !== 'data:image/png;base64') {
            throw new InvalidImageException(
                'The format of the passed image is not valid, please send a png image in base64.');
        }

        $data = base64_decode($parts[1]);
        $fileName = 'icon_'.$itemId.'.png';
        if(file_put_contents(\IApiInterface::ITEM_ICONS_DIR.$fileName, $data) === false) {
            throw new FileWritingException(
                'Could not write file "'.\IApiInterface::ITEM_ICONS_DIR.$fileName.'".');
        }
        return $fileName;
    }
}