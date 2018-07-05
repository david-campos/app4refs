<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;
use Category;
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

    function getCategoriesForItemType(\ItemType $itemType) {
        $categories = [];
        $itemTypeStr = $itemType->val();
        $stmt = $this->mysqli->prepare(
            "SELECT category_code,`name`,item_type,link FROM categories WHERE item_type=?");
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $itemTypeStr);
            if (!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($code, $name, $it, $link);
            while ($stmt->fetch()) {
                $categories[] = new Category($code, $name, \ItemType::FOR_STR($it), $link);
            }
        } finally {
            $stmt->close();
        }
        return $categories;
    }
}