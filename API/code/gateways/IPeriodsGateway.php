<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Interface for the periods gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 */
interface IPeriodsGateway {
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
                       int $endHour, int $endMinutes, int $itemId): Period;

    /**
     * Saves the given period to the database
     * @param Period $period
     */
    function savePeriod(Period $period);

    /**
     * Removes the given period from the database
     * @param Period $period
     */
    function removePeriod(Period $period);

    /**
     * Gets all the periods for a given item id. The list will be empty if the id
     * doesn't exist.
     * @param int $itemId
     * @return Period[]
     */
    function getPeriodsForItem(int $itemId);
}