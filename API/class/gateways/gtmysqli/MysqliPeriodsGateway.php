<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;


use exceptions\DatabaseInternalException;
use exceptions\InvalidParamInBodyException;
use exceptions\InvalidValueInBodyException;
use gateways\IPeriodsGateway;
use Period;

class MysqliPeriodsGateway implements IPeriodsGateway {
    /** @var \mysqli */
    private $mysqli;

    /**
     * MysqliItemsGateway constructor.
     * @param \mysqli $mysqli
     */
    public function __construct(\mysqli $mysqli) {
        $this->mysqli = $mysqli;
    }

    /**
     * Inserts a new period in the database and returns it.
     * @param \WeekDays $startDay
     * @param int $startHour
     * @param int $startMinutes
     * @param \WeekDays $endDay
     * @param int $endHour
     * @param int $endMinutes
     * @param int $itemId
     * @return Period
     * @throws DatabaseInternalException
     * @throws InvalidValueInBodyException
     */
    function newPeriod(\WeekDays $startDay, int $startHour, int $startMinutes, \WeekDays $endDay,
                       int $endHour, int $endMinutes, int $itemId): \Period {
        $periodId = -1;
        $start = $startDay->val();
        $end = $endDay->val();
        $stmt = $this->mysqli->prepare(
            'INSERT INTO opening_hours(start_day,start_hour,start_minutes,end_day,end_hour,end_minutes,item_id) VALUES (?,?,?,?,?,?,?)');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('siisiii', $start, $startHour, $startMinutes, $end, $endHour, $endMinutes, $itemId);
            if (!$stmt->execute()) {
                // Check for invalid hour or minute triggers
                if($this->mysqli->sqlstate == 45000) {
                    throw new InvalidValueInBodyException($this->mysqli->error);
                } else {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
            }
            // Last inserted id
            $periodId = $this->mysqli->insert_id;
        } finally {
            $stmt->close();
        }
        return $this->findPeriod($periodId);
    }

    private function findPeriod($periodId) {
        $period = null;
        $stmt = $this->mysqli->prepare(
            'SELECT start_day,start_hour,start_minutes,end_day,end_hour,end_minutes,item_id FROM opening_hours WHERE period_id=?'
        );
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $periodId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($start,$startHour,$startMins,$end,$endHour,$endMins,$itemId);
            $stmt->fetch();
            $startDay = \WeekDays::forStr($start);
            $endDay = \WeekDays::forStr($end);
            $period = new Period($periodId, $startDay, $startHour,$startMins, $endDay, $endHour, $endMins, $itemId,$this);
        } finally {
            $stmt->close();
        }
        return $period;
    }

    /**
     * Saves the given period to the database
     * @param \Period $period
     * @throws DatabaseInternalException
     * @throws InvalidValueInBodyException
     */
    function savePeriod(\Period $period) {
        // We need the attributes in local variables
        $periodId = $period->getPeriodId();
        $startDay = $period->getStartDay()->val();
        $startHour = $period->getStartHour();
        $startMin = $period->getStartMinutes();
        $endDay = $period->getEndDay()->val();
        $endHour = $period->getEndHour();
        $endMin = $period->getEndMinutes();
        $itemId = $period->getItemId();

        $stmt = $this->mysqli->prepare(
            'UPDATE opening_hours SET start_day=?,start_hour=?,start_minutes=?,end_day=?,end_hour=?,end_minutes=?,item_id=? WHERE period_id=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('siisiiii', $startDay, $startHour, $startMin, $endDay, $endHour, $endMin, $itemId, $periodId);
            if (!$stmt->execute()) {
                // Check for invalid hour or minute triggers
                if($this->mysqli->sqlstate == 45000) {
                    throw new InvalidValueInBodyException($this->mysqli->error);
                } else {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Removes the given period from the database
     * @param \Period $period
     * @throws DatabaseInternalException if there is some problem while executing the query
     */
    function removePeriod(\Period $period) {
        $periodId = $period->getPeriodId();
        $stmt = $this->mysqli->prepare(
        // Notice that opening_hours has ON DELETE CASCADE restriction :)
            'DELETE FROM opening_hours WHERE period_id=? LIMIT 1');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $periodId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Gets all the periods for a given item id. The list will be empty if the id
     * doesn't exist.
     * @param int $itemId
     * @return Period[]
     * @throws DatabaseInternalException
     */
    function getPeriodsForItem(int $itemId) {
        $periods = [];
        $stmt = $this->mysqli->prepare(
            'SELECT period_id,start_day,start_hour,start_minutes,end_day,end_hour,end_minutes FROM opening_hours WHERE item_id=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($id, $start, $startHour, $startMinutes, $end, $endHour, $endMinutes);
            while($stmt->fetch()) {
                $startDay = \WeekDays::forStr($start);
                $endDay = \WeekDays::forStr($end);
                $periods[] = new Period($id, $startDay, $startHour, $startMinutes, $endDay, $endHour, $endMinutes, $itemId, $this);
            }
        } finally {
            $stmt->close();
        }
        return $periods;
    }
}