<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\InvalidParamInBodyException;
use exceptions\InvalidValueInBodyException;
use exceptions\ListExpectedException;
use exceptions\ParamsNotFoundInBodyException;
use exceptions\RepeatedParamInBodyException;

abstract class ItemParsingTransaction extends Transaction {
    /** @var [[]] The periods to associate with the item */
    protected $periods;
    /** @var string */
    protected $name;
    /** @var string */
    protected $address;
    /** @var string|null */
    protected $webLink;
    /** @var string|null */
    protected $placeId;
    /** @var string */
    protected $iconUri;
    /** @var bool */
    protected $isFree;
    /** @var double|null */
    protected $coordLat;
    /** @var double|null */
    protected $coordLon;
    /** @var string|null */
    protected $phone;
    /** @var bool */
    protected $callForAppointment;
    /** @var string */
    protected $categoryCode;
    /** @var string|null */
    protected $languageCode;

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
            } else if($key === \IApiInterface::ITEM_PHONE) {
                $this->phone = $val;
            } else if($key === \IApiInterface::ITEM_CALL_FOR_APPOINTMENT) {
                $this->callForAppointment = $val;
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
        if(count($usedKeys) < 13) {
            throw $this->paramNotFoundInItem($usedKeys);
        }

        $this->checkNulls();
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
                } else if($key === \IApiInterface::PERIOD_ID) {
                    $values[\IApiInterface::PERIOD_ID] = $val;
                } else {
                    throw new InvalidParamInBodyException($key);
                }
                // None of the period params can be null
                if($val === null) {
                    throw new InvalidValueInBodyException(
                        "The param $key in ".\IApiInterface::ITEM_OPENING_HOURS." cannot be null.");
                }
            }
            if(count($values) < 7) {
                throw $this->paramNotFoundInPeriod(array_keys($values), $i);
            }
            $this->periods[] = $values;
        }
    }

    /**
     * Checks that all the fields which can't be null have a non-null value
     */
    private function checkNulls() {
        $notNullOnes = [
            \IApiInterface::ITEM_NAME => $this->name,
            \IApiInterface::ITEM_ADDR => $this->address,
            \IApiInterface::ITEM_ICON => $this->iconUri,
            \IApiInterface::ITEM_IS_FREE => $this->isFree,
            \IApiInterface::ITEM_CALL_FOR_APPOINTMENT => $this->callForAppointment,
            \IApiInterface::ITEM_CATEGORY_CODE => $this->categoryCode];
        foreach($notNullOnes as $key=>$val) {
            if($val === null) {
                throw new InvalidValueInBodyException("Param $key can't be null.");
            }
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
            \IApiInterface::ITEM_PHONE,
            \IApiInterface::ITEM_CALL_FOR_APPOINTMENT,
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
            \IApiInterface::PERIOD_END_MINUTES,
            \IApiInterface::PERIOD_ID
        ];
        $notFound = array_diff($periodKeys, $foundOnes);
        return new ParamsNotFoundInBodyException($notFound,
            \IApiInterface::ITEM_OPENING_HOURS.'/'.$param);
    }
}