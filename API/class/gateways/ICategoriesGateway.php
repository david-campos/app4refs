<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways;

use Category;

/**
 * Interface for the categories gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 */
interface ICategoriesGateway {
    /**
     * Returns the category codes of every category with the given item type
     * @param \ItemType $itemType
     * @return Category[]
     */
    function getCategoriesForItemType(\ItemType $itemType);
}