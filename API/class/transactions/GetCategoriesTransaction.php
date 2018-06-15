<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\RequestParsingException;
use exceptions\UnknownTypeStrException;
use formats\IApiOutputter;
use gateways\GatewayFactory;
use ItemType;

class GetCategoriesTransaction extends Transaction {
    /** @var ItemType */
    private $itemType;

    /**
     * GetCategoriesTransaction constructor. The request params should have the following structure:
     * ['get' => ['itemType'=>itemType], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     * @throws RequestParsingException if the item type is not a valid one
     */
    public function __construct($requestParams) {
        try {
            $this->itemType = ItemType::FOR_STR($requestParams['get']['itemType']);
        } catch (UnknownTypeStrException $ex) {
            throw new RequestParsingException(400, 'Invalid item type found while parsing the request.');
        }
    }


    /**
     * Executes the transaction, has no return
     */
    public function execute() {
        $gateway = GatewayFactory::getInstance()->getCategoriesGateway();
        GatewayFactory::getInstance()->startTransaction();
        $categories = $gateway->getCategoriesForItemType($this->itemType);
        $this->result = $categories;
        $this->status = IApiOutputter::HTTP_OK;
        GatewayFactory::getInstance()->commit();
    }
}