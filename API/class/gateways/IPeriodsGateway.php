<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways;

/**
 * Interface for the periods gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 */
interface IPeriodsGateway {
    /**
     * Inserts a new period in the database and returns it.
     * @param \WeekDays $startDay
     * @param int $startHour
     * @param int $startMinutes
     * @param \WeekDays $endDay
     * @param int $endHour
     * @param int $endMinutes
     * @param int $itemId
     * @return \Period
     */
    function newPeriod(\WeekDays $startDay, int $startHour, int $startMinutes, \WeekDays $endDay,
                       int $endHour, int $endMinutes, int $itemId): \Period;

    /**
     * Saves the given period to the database
     * @param \Period $period
     */
    function savePeriod(\Period $period);

    /**
     * Removes the given period from the database
     * @param \Period $period
     */
    function removePeriod(\Period $period);

    /**
     * Gets all the periods for a given item id. The list will be empty if the id
     * doesn't exist. They are ordered by their end day, hour and minutes.
     * @param int $itemId
     * @return \Period[]
     */
    function getPeriodsForItem(int $itemId);
}