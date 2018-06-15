<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;
use exceptions\DatabaseCategoryNotFoundException;
use exceptions\DatabaseInternalException;
use formats\IApiOutputter;
use gateways\ICategoriesGateway;
use mysqli;


class MysqliCategoriesGateway implements ICategoriesGateway {
    /** @var  mysqli */
    private $mysqli;

    /**
     * MysqliCategoriesGateway constructor.
     * @param $mysqli
     */
    public function __construct($mysqli) {
        $this->mysqli = $mysqli;
    }

    function getCategoryName(string $categoryCode): string {
        $name = "";
        $stmt = $this->mysqli->prepare(
            "SELECT `name` FROM categories WHERE category_code=? LIMIT 1");
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($name);
            if (!$stmt->fetch()) {
                throw new DatabaseCategoryNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "Couldn't find the category '$categoryCode'.");
            }
        } finally {
            $stmt->close();
        }
        return $name;
    }

    function getCategoryItemType(string $categoryCode): \ItemType {
        $typeStr = "";
        $stmt = $this->mysqli->prepare(
            "SELECT `item_type` FROM categories WHERE category_code=? LIMIT 1");
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $categoryCode);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($typeStr);
            if (!$stmt->fetch()) {
                throw new DatabaseCategoryNotFoundException(IApiOutputter::HTTP_NOT_FOUND, "Couldn't find the category '$categoryCode'.");
            }
        } finally {
            $stmt->close();
        }
        return \ItemType::FOR_STR($typeStr);
    }


    function getCategoriesForItemType(\ItemType $itemType) {
        $categories = [];
        $itemTypeStr = $itemType->val();
        $stmt = $this->mysqli->prepare(
            "SELECT category_code FROM categories WHERE item_type=?");
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $itemTypeStr);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($code);
            while ($stmt->fetch()) {
                $categories[] = $code;
            }
        } finally {
            $stmt->close();
        }
        return $categories;
    }
}