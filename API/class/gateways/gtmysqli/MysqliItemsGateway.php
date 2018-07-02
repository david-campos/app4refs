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
            'SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,call_for_appointment,category_code,lang_code FROM items WHERE item_id=? LIMIT 1');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$phone,$callForApp,$cat,$lg);
            if(!$stmt->fetch()) {
                throw new DatabaseItemNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "The item with id '$itemId' couldn't be found on the database.");
            }
            $item = new Item($itemId, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $phone, $callForApp, $cat, $lg, $this);
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
            $stmt->bind_result($categoryCodeCheck);
            if(!$stmt->fetch()) {
                throw new DatabaseCategoryNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "Couldn't find any category with category code '$categoryCode'.");
            }
        } finally {
            $stmt->close();
        }

        $stmt = $this->mysqli->prepare(
            'SELECT item_id,`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,call_for_appointment,lang_code FROM items WHERE category_code=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($id,$name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$phone,$callForApp,$lg);
            while($stmt->fetch()) {
                $items[] = new Item($id, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $phone, $callForApp, $categoryCode, $lg, $this);
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
     * @param string $phone
     * @param bool $callForApp
     * @param string $categoryCode
     * @param string $languageCode
     * @return Item
     * @throws DatabaseInternalException
     */
    function newItem($name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                     $phone, $callForApp, $categoryCode, $languageCode): Item {
        $itemId = -1;
        $stmt = $this->mysqli->prepare(
            'INSERT INTO items(`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,call_for_appointment,lang_code,category_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sssssisssiss', $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat,
                $coordLon, $phone, $callForApp, $languageCode, $categoryCode);
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
     * @throws DatabaseInternalException if something goes wrong internally
     */
    function saveItem($item) {
        // We need the attributes in local variables
        $itemId = $item->getItemId();
        $name = $item->getName();
        $address = $item->getAddress();
        $webLink = $item->getWebLink();
        $placeId = $item->getPlaceId();
        $iconUri = $item->getIconUri();
        $isFree = $item->isFree();
        $coordLat = $item->getCoordLat();
        $coordLon = $item->getCoordLon();
        $phone = $item->getPhone();
        $callForApp = $item->shouldCallForAppointment();
        $languageCode = $item->getLanguageCode();
        $categoryCode = $item->getCategoryCode();

        $stmt = $this->mysqli->prepare(
            'UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
            'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,phone=?,call_for_appointment=?,lang_code=?,category_code=? WHERE item_id=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sssssisssissi', $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat,
                $coordLon, $phone, $callForApp, $languageCode, $categoryCode, $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Removes the given item from the database
     * @param Item $item
     * @throws DatabaseInternalException if any error happens while executing the query
     */
    function removeItem($item) {
        $itemId = $item->getItemId();
        $stmt = $this->mysqli->prepare(
            // Notice that opening_hours has ON DELETE CASCADE restriction :)
            'DELETE FROM items WHERE item_id=? LIMIT 1');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
    }
}