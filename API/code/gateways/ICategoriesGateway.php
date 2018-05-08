<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Interface for the categories gateways. This interface allows us to hide the information of the
 * underlying logic for the database connections.
 */
interface ICategoriesGateway {
    function getCategoryName(string $categoryCode): string;
    function getCategoryItemType(string $categoryCode): ItemType;
    function getCategoriesForItemType(ItemType $itemType);
}