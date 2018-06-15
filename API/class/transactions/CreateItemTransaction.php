<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\InvalidParamInBodyException;
use exceptions\ListExpectedException;
use exceptions\ParamsNotFoundInBodyException;
use exceptions\RepeatedParamInBodyException;
use gateways\GatewayFactory;

class CreateItemTransaction extends Transaction {
    /** @var [[]] The periods to associate with the item */
    private $periods;
    /** @var string */
    private $name;
    /** @var string */
    private $address;
    /** @var string|null */
    private $webLink;
    /** @var string|null */
    private $placeId;
    /** @var string */
    private $iconUri;
    /** @var bool */
    private $isFree;
    /** @var double|null */
    private $coordLat;
    /** @var double|null */
    private $coordLon;
    /** @var string */
    private $categoryCode;
    /** @var string|null */
    private $languageCode;

    /**
     * CreateItemTransaction constructor.
     * @param array $requestParams The params of the request, including body parsed and get params
     * @throws InvalidParamInBodyException if an invalid param is found
     * @throws ParamsNotFoundInBodyException if some required param couldn't be found
     * @throws RepeatedParamInBodyException if some param for the item is repeated inside the body
     */
    public function __construct($requestParams) {
        $usedKeys = [];
        foreach($requestParams['body'] as $key=>$val) {
            if($key === \IApiInterface::ITEM_NAME) {
                $this->name = $val;
            } else if($key === \IApiInterface::ITEM_ADDR) {
                $this->address = $val;
            } else if($key === \IApiInterface::ITEM_LINK) {
                $this->webLink = $val;
            } else if($key === \IApiInterface::ITEM_PLACE) {
                $this->placeId = $val;
            } else if($key === \IApiInterface::ITEM_ICON) {
                $this->iconUri = $val;
            } else if($key === \IApiInterface::ITEM_IS_FREE) {
                $this->isFree = $val;
            } else if($key === \IApiInterface::ITEM_COORD_LAT) {
                $this->coordLat = $val;
            } else if($key === \IApiInterface::ITEM_COORD_LON) {
                $this->coordLon = $val;
            } else if($key == \IApiInterface::ITEM_CATEGORY_CODE) {
                $this->categoryCode = $val;
            } else if($key === \IApiInterface::ITEM_LANGUAGE_CODE) {
                $this->languageCode = $val;
            } else if($key === \IApiInterface::ITEM_OPENING_HOURS) {
                $this->readPeriods($val);
            } else {
                throw new InvalidParamInBodyException($key);
            }
            $usedKeys[] = $key;
        }
        // Check all values have been set
        if(count($usedKeys) < 10) {
            throw $this->paramNotFoundInItem($usedKeys);
        }

    }

    /**
     * Auxiliar function which helps the constructor reading the opening hours (a.k.a. periods)
     * for the item.
     * @param array $periodsArray an array with the values for the periods
     * @throws InvalidParamInBodyException if some invalid param is found
     * @throws ListExpectedException if the keys are not numeric (so it was not a list but rather a dictionary)
     * @throws ParamsNotFoundInBodyException if some required params are not found
     */
    private function readPeriods($periodsArray) {
        $this->periods = [];
        foreach($periodsArray as $i=>$periodArr) {
            $values = [];
            foreach($periodArr as $key=>$val) {
                if(!is_numeric($i)) {
                    throw new ListExpectedException(\IApiInterface::ITEM_OPENING_HOURS);
                }
                if($key === \IApiInterface::PERIOD_START_DAY) {
                    $values[\IApiInterface::PERIOD_START_DAY] = $val;
                } else if($key === \IApiInterface::PERIOD_START_HOUR) {
                    $values[\IApiInterface::PERIOD_START_HOUR] = $val;
                } else if($key === \IApiInterface::PERIOD_START_MINUTES) {
                    $values[\IApiInterface::PERIOD_START_MINUTES] = $val;
                } else if($key === \IApiInterface::PERIOD_END_DAY) {
                    $values[\IApiInterface::PERIOD_END_DAY] = $val;
                } else if($key === \IApiInterface::PERIOD_END_HOUR) {
                    $values[\IApiInterface::PERIOD_END_HOUR] = $val;
                } else if($key === \IApiInterface::PERIOD_END_MINUTES) {
                    $values[\IApiInterface::PERIOD_END_MINUTES] = $val;
                } else {
                    throw new InvalidParamInBodyException($key);
                }
            }
            if(count($values) < 6) {
                throw $this->paramNotFoundInPeriod(array_keys($values), $i);
            }
            $this->periods[] = $values;
        }
    }

    /**
     * Returns an exception indicating the params not found to create an item given a list
     * of the ones that, in fact, have been found.
     * @param array $foundOnes list with the keys of all the found parameters
     * @return ParamsNotFoundInBodyException
     */
    private function paramNotFoundInItem($foundOnes) {
        $itemKeys = [
            \IApiInterface::ITEM_NAME,
            \IApiInterface::ITEM_ADDR,
            \IApiInterface::ITEM_LINK,
            \IApiInterface::ITEM_PLACE,
            \IApiInterface::ITEM_ICON,
            \IApiInterface::ITEM_IS_FREE,
            \IApiInterface::ITEM_COORD_LAT,
            \IApiInterface::ITEM_COORD_LON,
            \IApiInterface::ITEM_CATEGORY_CODE,
            \IApiInterface::ITEM_LANGUAGE_CODE,
            \IApiInterface::ITEM_OPENING_HOURS
        ];
        $notFound = array_diff($itemKeys, $foundOnes);
        return new ParamsNotFoundInBodyException($notFound);
    }

    /**
     * @see CreateItemTransaction::paramNotFoundInItem()
     * @param array $foundOnes found params
     * @param int $param number of the period the missing params were
     * @return ParamsNotFoundInBodyException the exception constructed
     */
    private function paramNotFoundInPeriod($foundOnes, $param) {
        $periodKeys = [
            \IApiInterface::PERIOD_START_HOUR,
            \IApiInterface::PERIOD_START_DAY,
            \IApiInterface::PERIOD_START_MINUTES,
            \IApiInterface::PERIOD_END_DAY,
            \IApiInterface::PERIOD_END_HOUR,
            \IApiInterface::PERIOD_END_MINUTES
        ];
        $notFound = array_diff($periodKeys, $foundOnes);
        return new ParamsNotFoundInBodyException($notFound,
            \IApiInterface::ITEM_OPENING_HOURS.'/'.$param);
    }

    /**
     * Executes the transaction, has no return
     */
    public function execute() {
        $itemGtw = GatewayFactory::getInstance()->getItemsGateway();
        GatewayFactory::getInstance()->startTransaction(true);
        $item = $itemGtw->newItem(
            $this->name,
            $this->address,
            $this->webLink,
            $this->placeId,
            $this->iconUri,
            $this->isFree,
            $this->coordLat,
            $this->coordLon,
            $this->categoryCode,
            $this->languageCode);
        $periodsGtw = GatewayFactory::getInstance()->getPeriodsGateway();
        foreach($this->periods as $periodValues) {
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
        GatewayFactory::getInstance()->commit();
    }
}