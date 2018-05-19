<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class Period. Represents a period of time as in the database
 */
class Period {
    /** @var int */
    private $periodId;
    /** @var WeekDays */
    private $startDay;
    /** @var int */
    private $startHour;
    /** @var int */
    private $startMinutes;
    /** @var WeekDays */
    private $endDay;
    /** @var int */
    private $endHour;
    /** @var int */
    private $endMinutes;
    /** @var int */
    private $itemId;
    /** @var gateways\IPeriodsGateway */
    private $gateway;

    /**
     * Period constructor.
     * @param int $periodId the id of the period
     * @param WeekDays $startDay the day when the period starts
     * @param int $startHour the hour when the period starts
     * @param int $startMinutes the minutes when the period starts
     * @param WeekDays $endDay the day when the period ends
     * @param int $endHour the hour when the period ends
     * @param int $endMinutes the minutes when the period ends
     * @param int $itemId the item opened in this period
     * @param gateways\IPeriodsGateway $gateway the gateway which manages this period
     */
    public function __construct(int $periodId, WeekDays $startDay, int $startHour, int $startMinutes, WeekDays $endDay,
                                int $endHour, int $endMinutes, int $itemId, gateways\IPeriodsGateway $gateway) {
        $this->periodId = $periodId;
        $this->startDay = $startDay;
        $this->startHour = $startHour;
        $this->startMinutes = $startMinutes;
        $this->endDay = $endDay;
        $this->endHour = $endHour;
        $this->endMinutes = $endMinutes;
        $this->itemId = $itemId;
        $this->gateway = $gateway;
    }

    function toMap(): array {
        return [
            "periodId" => $this->periodId,
            "startDay" => $this->startDay,
            "startHour" => $this->startHour,
            "startMinutes" => $this->startMinutes,
            "endDay" => $this->endDay,
            "endHour" => $this->endHour,
            "endMinutes" => $this->endMinutes
        ];
    }

    function savePeriod() {
        $this->gateway->savePeriod($this);
    }

    function removePeriod() {
        $this->gateway->removePeriod($this);
    }

    /**
     * @return int
     */
    public function getPeriodId(): int {
        return $this->periodId;
    }

    /**
     * @param int $periodId
     */
    public function setPeriodId(int $periodId) {
        $this->periodId = $periodId;
    }

    /**
     * @return int
     */
    public function getStartHour(): int {
        return $this->startHour;
    }

    /**
     * @param int $startHour
     * @throws exceptions\InvalidHourException
     */
    public function setStartHour(int $startHour) {
        if($startHour < 0 || $startHour > 23) {
            throw new exceptions\InvalidHourException(400, "$startHour is not a valid hour");
        }
        $this->startHour = $startHour;
    }

    /**
     * @return int
     */
    public function getStartMinutes(): int {
        return $this->startMinutes;
    }

    /**
     * @param int $startMinutes
     * @throws exceptions\InvalidMinutesException
     */
    public function setStartMinutes(int $startMinutes) {
        if($startMinutes < 0 || $startMinutes > 59) {
            throw new exceptions\InvalidMinutesException(400, "$startMinutes is not a valid amount of minutes");
        }
        $this->startMinutes = $startMinutes;
    }

    /**
     * @return int
     */
    public function getEndHour(): int {
        return $this->endHour;
    }

    /**
     * @param int $endHour
     * @throws exceptions\InvalidHourException
     */
    public function setEndHour(int $endHour) {
        if($endHour < 0 || $endHour > 23) {
            throw new exceptions\InvalidHourException(400, "$endHour is not a valid hour");
        }
        $this->endHour = $endHour;
    }

    /**
     * @return int
     */
    public function getEndMinutes(): int {
        return $this->endMinutes;
    }

    /**
     * @param int $endMinutes
     * @throws exceptions\InvalidMinutesException
     */
    public function setEndMinutes(int $endMinutes) {
        if($endMinutes < 0 || $endMinutes > 59) {
            throw new exceptions\InvalidMinutesException(400, "$endMinutes is not a valid amount of minutes");
        }
        $this->endMinutes = $endMinutes;
    }

    /**
     * @return int
     */
    public function getItemId(): int {
        return $this->itemId;
    }

    /**
     * @param int $itemId
     */
    public function setItemId(int $itemId) {
        $this->itemId = $itemId;
    }

    /**
     * @return WeekDays
     */
    public function getStartDay(): WeekDays {
        return $this->startDay;
    }

    /**
     * @param WeekDays $startDay
     */
    public function setStartDay(WeekDays $startDay) {
        $this->startDay = $startDay;
    }

    /**
     * @return WeekDays
     */
    public function getEndDay(): WeekDays {
        return $this->endDay;
    }

    /**
     * @param WeekDays $endDay
     */
    public function setEndDay(WeekDays $endDay) {
        $this->endDay = $endDay;
    }
}