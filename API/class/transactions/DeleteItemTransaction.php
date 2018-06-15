<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use formats\IApiOutputter;
use gateways\GatewayFactory;

class DeleteItemTransaction extends Transaction {
    /** @var int */
    private $itemId;

    /**
     * CreateItemTransaction constructor.
     * @param array $requestParams The params of the request, including body parsed and get params
     */
    public function __construct($requestParams) {
        // Item id is passed in the URL
        $this->itemId = $requestParams['get']['itemId'];
    }

    /**
     * Executes the transaction, has no return
     */
    public function execute() {
        GatewayFactory::getInstance()->startTransaction(true);
        $itemsGtw = GatewayFactory::getInstance()->getItemsGateway();
        $item = $itemsGtw->findItem($this->itemId);
        $item->removeItem();
        GatewayFactory::getInstance()->commit();
        $this->result = null;
        $this->status = IApiOutputter::HTTP_OK;
    }
}