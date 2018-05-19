<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways;

/**
 * Interface for the categories gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 */
interface ICategoriesGateway {
    /**
     * Gets the category name for the given category code
     * @param string $categoryCode
     * @return string
     */
    function getCategoryName(string $categoryCode): string;

    /**
     * Gets the item type for the category with the given category code
     * @param string $categoryCode
     * @return \ItemType
     */
    function getCategoryItemType(string $categoryCode): \ItemType;

    /**
     * Returns the category codes of every category with the given item type
     * @param \ItemType $itemType
     * @return [string]
     */
    function getCategoriesForItemType(\ItemType $itemType);
}