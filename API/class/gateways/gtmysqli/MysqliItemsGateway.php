<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;

use exceptions\DatabaseCategoryNotFoundException;
use exceptions\DatabaseInternalException;
use exceptions\DatabaseItemNotFoundException;
use formats\IApiOutputter;
use gateways\IItemsGateway;
use Item;

class MysqliItemsGateway implements IItemsGateway {
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
     * Finds the item identified by the given item id
     * @param $itemId
     * @return Item
     * @throws DatabaseInternalException if there is some internal error executing
     * @throws DatabaseItemNotFoundException if the item couldn't be found
     */
    function findItem($itemId): Item {
        $item = null;
        $stmt = $this->mysqli->prepare(
            'SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,category_code,lang_code FROM items WHERE item_id=? LIMIT 1');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$cat,$lg);
            if(!$stmt->fetch()) {
                throw new DatabaseItemNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "The item with id '$itemId' couldn't be found on the database.");
            }
            $item = new Item($itemId, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $cat, $lg, $this);
        } finally {
            $stmt->close();
        }
        return $item;
    }

    /**
     * Gets a list with all the items in the given category
     * @param $categoryCode
     * @return Item[]
     * @throws DatabaseCategoryNotFoundException if the category could not be found
     * @throws DatabaseInternalException if there is some internal error executing
     */
    function getItemsForCategory($categoryCode) {
        $items = [];
        // Check that the category exists (just to make the function more meaningful)
        $stmt = $this->mysqli->prepare('SELECT category_code FROM categories WHERE category_code=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            if(!$stmt->fetch()) {
                throw new DatabaseCategoryNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "Couldn't find any category with category code '$categoryCode'.");
            }
        } finally {
            $stmt->close();
        }

        $stmt = $this->mysqli->prepare(
            'SELECT item_id,`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,lang_code FROM items WHERE category_code=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($id,$name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$lg);
            while($stmt->fetch()) {
                $items[] = new Item($id, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $categoryCode, $lg, $this);
            }
        } finally {
            $stmt->close();
        }
        return $items;
    }

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
     * @throws DatabaseInternalException
     */
    function newItem($name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                     $categoryCode, $languageCode): Item {
        $itemId = -1;
        $stmt = $this->mysqli->prepare(
            'INSERT INTO items(`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,lang_code,category_code) VALUES (?,?,?,?,?,?,?,?,?,?)');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sssssissss', $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon, $languageCode, $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            // Last inserted id
            $itemId = $this->mysqli->insert_id;
        } finally {
            $stmt->close();
        }
        return $this->findItem($itemId);
    }

    /**
     * Saves the given item in the database
     * @param Item $item
     */
    function saveItem($item) {
        // TODO: Implement saveItem() method.
    }

    /**
     * Removes the given item from the database
     * @param Item $item
     */
    function removeItem($item) {
        // TODO: Implement removeItem() method.
    }
}