<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\InvalidParamInBodyException;
use formats\IApiOutputter;
use gateways\GatewayFactory;
use SessionManager;

class CreateItemTransaction extends ItemParsingTransaction {

    /**
     * CreateItemTransaction constructor.
     * @param array $requestParams The params of the request, including body parsed and get params
     */
    public function __construct(array $requestParams) {
        parent::__construct($requestParams);
        SessionManager::getInstance()->requireToken($requestParams);
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {
        $itemGtw = GatewayFactory::getInstance()->getItemsGateway();
        GatewayFactory::getInstance()->startTransaction(true);
        $item = $itemGtw->newItem(
            $this->name,
            $this->order,
            $this->address,
            $this->webLink,
            $this->placeId,
            $this->iconUri,
            $this->isFree,
            $this->coordLat,
            $this->coordLon,
            $this->phone,
            $this->callForAppointment,
            $this->categoryCode,
            $this->languageCodes);
        $periodsGtw = GatewayFactory::getInstance()->getPeriodsGateway();
        foreach($this->periods as $periodValues) {
            if($periodValues[\IApiInterface::PERIOD_ID] !== \IApiInterface::PERIOD_ID_CREATE_NEW_VALUE) {
                throw new InvalidParamInBodyException(\IApiInterface::PERIOD_ID,
                    'When creating an item, all periods should have id \''.
                    \IApiInterface::PERIOD_ID_CREATE_NEW_VALUE.'\'');
            }
            $periodsGtw->newPeriod(
                \WeekDays::forStr($periodValues[\IApiInterface::PERIOD_START_DAY]),
                $periodValues[\IApiInterface::PERIOD_START_HOUR],
                $periodValues[\IApiInterface::PERIOD_START_MINUTES],
                \WeekDays::forStr($periodValues[\IApiInterface::PERIOD_END_DAY]),
                $periodValues[\IApiInterface::PERIOD_END_HOUR],
                $periodValues[\IApiInterface::PERIOD_END_MINUTES],
                $item->getItemId()
            );
        }
        $this->result = $item->toMap();
        $this->status = IApiOutputter::HTTP_CREATED;
        GatewayFactory::getInstance()->commit();
    }
}