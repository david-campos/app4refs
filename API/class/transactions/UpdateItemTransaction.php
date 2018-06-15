<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;


use exceptions\InvalidParamInBodyException;
use formats\IApiOutputter;
use gateways\GatewayFactory;
use Period;

class UpdateItemTransaction extends ItemParsingTransaction {
    /** @var int */
    private $itemId;

    public function __construct(array $requestParams) {
        parent::__construct($requestParams);
        // We obtain the id from the URL
        $this->itemId = $requestParams['get']['itemId'];
    }


    /**
     * Executes the transaction, has no return
     */
    public function execute() {
        $itemsGtw = GatewayFactory::getInstance()->getItemsGateway();
        GatewayFactory::getInstance()->startTransaction(true);
        $item = $itemsGtw->findItem($this->itemId);
        // Update item values
        $item->setName($this->name);
        $item->setAddress($this->address);
        $item->setWebLink($this->webLink);
        $item->setIconUri($this->iconUri);
        $item->setIsFree($this->isFree);
        $item->setCoordLat($this->coordLat);
        $item->setCoordLon($this->coordLon);
        $item->setCategoryCode($this->categoryCode);
        $item->setPlaceId($this->placeId);
        $item->setLanguageCode($this->languageCode);
        // Save item
        $item->saveItem();

        // Periods
        $periodsGtw = GatewayFactory::getInstance()->getPeriodsGateway();
        $periods = $periodsGtw->getPeriodsForItem($this->itemId);
        $updatedPeriods = [];

        foreach($this->periods as $periodValues) {
            if($periodValues[\IApiInterface::PERIOD_ID] !== \IApiInterface::PERIOD_ID_CREATE_NEW_VALUE) {
                // Update period, if the id does not match any period,
                // InvalidParamInBodyException will be thrown
                $this->updatePeriod($periods, $periodValues);
                $updatedPeriods[] = $periodValues[\IApiInterface::PERIOD_ID];
            } else {
                // Create period
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
        }

        // Delete non-updated periods
        foreach($periods as $period) {
            if(!in_array($period->getPeriodId(), $updatedPeriods)) {
                $period->removePeriod();
            }
        }

        // As item has a lazy loading of the periods, they will be loaded now and therefore be updated
        // We get it again because sometimes the database changes some data silently
        // (like cropping some fields or whatever), so better to make sure we are sending back the
        // exact information from the database.
        $item = $itemsGtw->findItem($item->getItemId());
        $this->result = $item->toMap();
        $this->status = IApiOutputter::HTTP_OK;
        // Commit!
        GatewayFactory::getInstance()->commit();
    }

    /**
     * Updates the period which ID matches $periodValues[IApiInterface::PERIOD_ID]
     * @param Period[] $periods array with the periods to search in
     * @param array $periodValues values to update the period, included its ID, using the constants in IApiInterface
     * as keys
     * @throws InvalidParamInBodyException if the period id does not match any of the periods
     */
    private function updatePeriod($periods, $periodValues) {
        $periodId = $periodValues[\IApiInterface::PERIOD_ID];
        foreach ($periods as $period) {
            if ($period->getPeriodId() === $periodId) {
                $period->setStartDay(\WeekDays::forStr($periodValues[\IApiInterface::PERIOD_START_DAY]));
                $period->setStartHour($periodValues[\IApiInterface::PERIOD_START_HOUR]);
                $period->setStartMinutes($periodValues[\IApiInterface::PERIOD_START_MINUTES]);
                $period->setEndDay(\WeekDays::forStr($periodValues[\IApiInterface::PERIOD_END_DAY]));
                $period->setEndHour($periodValues[\IApiInterface::PERIOD_END_HOUR]);
                $period->setEndMinutes($periodValues[\IApiInterface::PERIOD_END_MINUTES]);
                $period->savePeriod();
                return;
            }
        }
        // If we didn't return, this period couldn't be found
        throw new InvalidParamInBodyException(\IApiInterface::PERIOD_ID,
            'The item has no periods with id \'' . $periodId . '\'. If you want to create new periods ' .
            'you should use the periodId \'' . \IApiInterface::PERIOD_ID_CREATE_NEW_VALUE . '\'');
    }
}