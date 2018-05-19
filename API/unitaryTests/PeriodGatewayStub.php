<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class PeriodGatewayStub implements gateways\IPeriodsGateway {
    private $stubId;

    /**
     * PeriodGatewayStub constructor.
     * @param $stubId
     */
    public function __construct($stubId) {
        $this->stubId = $stubId;
    }

    /**
     * @return mixed
     */
    public function getStubId() {
        return $this->stubId;
    }

    /**
     * @param mixed $stubId
     */
    public function setStubId($stubId) {
        $this->stubId = $stubId;
    }

    /**
     * Inserts a new period in the database and returns it.
     * @param int $periodId
     * @param string $startDay
     * @param int $startHour
     * @param int $startMinutes
     * @param string $endDay
     * @param int $endHour
     * @param int $endMinutes
     * @param int $itemId
     * @return Period
     */
    function newPeriod(int $periodId, string $startDay, int $startHour, int $startMinutes, string $endDay,
                       int $endHour, int $endMinutes, int $itemId): Period {
        // Do nothing
    }

    /**
     * Saves the given period to the database
     * @param Period $period
     */
    function savePeriod(Period $period) {
        // do nothing
    }

    /**
     * Removes the given period from the database
     * @param Period $period
     */
    function removePeriod(Period $period) {
        // do nothing
    }

    /**
     * Gets all the periods for a given item id. The list will be empty if the id
     * doesn't exist.
     * @param int $itemId
     * @return Period[]
     */
    function getPeriodsForItem(int $itemId) {
        // do nothing
    }
}