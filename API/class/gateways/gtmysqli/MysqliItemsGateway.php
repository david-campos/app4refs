<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;

use exceptions\DatabaseCategoryNotFoundException;
use exceptions\DatabaseInternalException;
use exceptions\DatabaseItemNotFoundException;
use exceptions\InvalidValueInBodyException;
use formats\IApiOutputter;
use gateways\IItemsGateway;
use Item;

class MysqliItemsGateway implements IItemsGateway {
    /** @var \mysqli */
    private $mysqli;

    const ITEM_SELECT = 'SELECT `item_id`,`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,'.
        'call_for_appointment,category_code FROM items ';

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
        $name = $addr = $web = $pl = $ico = $fr = $lat = $lon = $phone = $callForApp = $cat = $lgCodes = $item = null;
        $stmt = $this->mysqli->prepare(
            self::ITEM_SELECT . 'WHERE item_id=? LIMIT 1');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($resId,$name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$phone,$callForApp,$cat);
            if(!$stmt->fetch()) {
                throw new DatabaseItemNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "The item with id '$itemId' couldn't be found on the database.");
            }
        } finally {
            $stmt->close();
        }
        $lgCodes = $this->getLangCodes([$itemId])[0];
        return new Item($itemId, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $phone, $callForApp, $cat, $lgCodes, $this);
    }

    /**
     * Gets all the language codes associated to the given items
     * @param int[] $itemIds the items we want to search the lang codes for.
     * @return string[][]
     * @throws DatabaseInternalException if some error occurs
     */
    private function getLangCodes($itemIds) {
        $codes = [];
        $stmt = $this->mysqli->prepare('SELECT lang_code FROM item_languages WHERE item_id = ?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('i', $itemId);
            foreach($itemIds as $itemId) {
                if (!$stmt->execute()) {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
                $stmt->bind_result($code);
                $lgCodes = [];
                while ($stmt->fetch()) {
                    $lgCodes[] = $code;
                }
                $codes[] = $lgCodes;
            }
        } finally {
            $stmt->close();
        }
        return $codes;
    }

    /**
     * Gets a list with all the items in the given category
     * @param $categoryCode
     * @return Item[]
     * @throws DatabaseCategoryNotFoundException if the category could not be found
     * @throws DatabaseInternalException if there is some internal error executing
     */
    function getItemsForCategory($categoryCode) {
        $itemsData = [];
        $itemIds = [];
        // Check that the category exists (just to make the function more meaningful)
        $this->checkCategoryExists($categoryCode);

        $stmt = $this->mysqli->prepare(
            self::ITEM_SELECT . 'WHERE category_code=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($id,$name,$addr,$web,$pl,$ico,$fr,$lat,$lon,$phone,$callForApp,$categoryRet);
            while($stmt->fetch()) {
                $itemsData[] = [$id, $name, $addr, $web, $pl, $ico, $fr, $lat, $lon, $phone, $callForApp, $categoryCode];
                $itemIds[] = $id;
            }
        } finally {
            $stmt->close();
        }

        $languages = $this->getLangCodes($itemIds);
        // Copy the language codes arrays to each item
        for($i=0;$i<count($itemIds);++$i) {
            $itemsData[$i][] = $languages[$i];
        }

        // Generate items
        $items = [];
        foreach($itemsData as $it) {
            $items[] = new Item($it[0], $it[1], $it[2], $it[3], $it[4], $it[5], $it[6], $it[7],
                $it[8], $it[9], $it[10], $it[11], $it[12], $this);
        }

        return $items;
    }

    /**
     * Checks the category exists
     * @param string $categoryCode
     * @throws DatabaseCategoryNotFoundException if the category does not exist
     * @throws DatabaseInternalException if there is some internal error
     */
    private function checkCategoryExists($categoryCode) {
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
                throw new DatabaseCategoryNotFoundException(
                    IApiOutputter::HTTP_NOT_FOUND, "Couldn't find any category with category code '$categoryCode'.");
            }
        } finally {
            $stmt->close();
        }
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
     * @param string[] $languageCodes
     * @return Item
     * @throws DatabaseInternalException
     * @throws InvalidValueInBodyException
     */
    function newItem($name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                     $phone, $callForApp, $categoryCode, $languageCodes): Item {
        $itemId = -1;
        $stmt = $this->mysqli->prepare(
            'INSERT INTO items(`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,call_for_appointment,category_code) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sssssisssis', $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat,
                $coordLon, $phone, $callForApp, $categoryCode);
            if (!$stmt->execute()) {
                // Check for trigger of call for appointment
                if($this->mysqli->sqlstate == 45000) {
                    throw new InvalidValueInBodyException($this->mysqli->error);
                } else {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
            }
            // Last inserted id
            $itemId = $this->mysqli->insert_id;
        } finally {
            $stmt->close();
        }
        $this->insertLanguageCodes($itemId, $languageCodes);
        return $this->findItem($itemId);
    }

    /**
     * Inserts the given language codes associated to the given item
     * @param int $itemId the id of the item
     * @param string[] $languageCodes the language codes to associate with the item
     * @throws DatabaseInternalException
     */
    private function insertLanguageCodes($itemId, $languageCodes) {
        $stmt = $this->mysqli->prepare('INSERT INTO item_languages(item_id, lang_code) VALUES(?,?)');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('is', $itemId, $langCode);
            foreach($languageCodes as $langCode) {
                if (!$stmt->execute()) {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Saves the given item in the database
     * @param Item $item
     * @throws DatabaseInternalException if something goes wrong internally
     * @throws InvalidValueInBodyException
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
        $languageCodes = $item->getLanguageCodes();
        $categoryCode = $item->getCategoryCode();

        $stmt = $this->mysqli->prepare(
            'UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
            'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,phone=?,call_for_appointment=?,category_code=? WHERE item_id=?');
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sssssisssisi', $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat,
                $coordLon, $phone, $callForApp, $categoryCode, $itemId);
            if (!$stmt->execute()) {
                // Check for trigger of call for appointment
                if($this->mysqli->sqlstate == 45000) {
                    throw new InvalidValueInBodyException($this->mysqli->error);
                } else {
                    throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
                }
            }
        } finally {
            $stmt->close();
        }
        $this->removeLanguageCodes($itemId);
        $this->insertLanguageCodes($itemId, $languageCodes);
    }

    /**
     * Removes all the language codes associated with the item
     * @param int $itemId the id of the item we are working on
     * @throws DatabaseInternalException
     */
    private function removeLanguageCodes($itemId) {
        $stmt = $this->mysqli->prepare('DELETE FROM item_languages WHERE item_id=?');
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