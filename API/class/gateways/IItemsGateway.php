<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways;
use Item;

/**
 * Interface for the items gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 * @package gateways
 */
interface IItemsGateway {
    /**
     * Finds the item identified by the given item id
     * @param $itemId
     * @return Item
     */
    function findItem($itemId): Item;

    /**
     * Gets a list with all the items in the given category
     * @param $categoryCode
     * @return Item[]
     */
    function getItemsForCategory($categoryCode);

    /**
     * Creates a new item in the database and returns the
     * created item
     * @param string $name
     * @param string $address
     * @param string $webLink
     * @param string $placeId
     * @param string $iconUri
     * @param bool $isFree
     * @param float $coordLat
     * @param float $coordLon
     * @param string $categoryCode
     * @param string $languageCode
     * @return Item
     */
    function newItem($name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                     $categoryCode, $languageCode): Item;

    /**
     * Saves the given item in the database
     * @param Item $item
     */
    function saveItem($item);

    /**
     * Removes the given item from the database
     * @param Item $item
     */
    function removeItem($item);
}