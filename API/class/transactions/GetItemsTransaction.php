<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;


use formats\IApiOutputter;
use gateways\GatewayFactory;
use Item;

class GetItemsTransaction extends Transaction {
    /** @var string */
    private $categoryCode;

    /**
     * GetCategoriesTransaction constructor. The request params should have the following structure:
     * ['get' => ['categoryCode'=>code of the category], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     */
    public function __construct($requestParams) {
        $this->categoryCode = $requestParams['get']['categoryCode'];
    }

    /**
     * Executes the transaction, has no return
     */
    public function execute() {
        $gateway = GatewayFactory::getInstance()->getItemsGateway();
        GatewayFactory::getInstance()->startTransaction();
        $items = $gateway->getItemsForCategory($this->categoryCode);
        $this->result = array_map(function(Item $item){return $item->toMap();}, $items);
        $this->status = IApiOutputter::HTTP_OK;
        GatewayFactory::getInstance()->commit();
    }
}