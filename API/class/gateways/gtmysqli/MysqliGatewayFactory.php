<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;

use gateways\GatewayFactory;
use gateways\ICategoriesGateway;
use gateways\IItemsGateway;
use gateways\IPeriodsGateway;
use mysqli;

class MysqliGatewayFactory extends GatewayFactory {
    /** @var mysqli */
    private $mysqli;

    /**
     * MysqliGatewayFactory constructor.
     */
    public function __construct() {
        $this->mysqli = new mysqli();
    }

    /**
     * Gets the items gateway to obtain items from the database
     * @return IItemsGateway
     */
    public function getItemsGateway(): IItemsGateway {
        // TODO: Implement getItemsGateway() method.
    }

    /**
     * Gets the categories gateway to obtain information about the categories from the database
     * @return ICategoriesGateway
     */
    public function getCategoriesGateway(): ICategoriesGateway {
        return new MysqliCategoriesGateway($this->mysqli);
    }

    /**
     * Gets the periods gateway to obtain periods (opening hours) from the database
     * @return IPeriodsGateway
     */
    public function getPeriodsGateway(): IPeriodsGateway {
        // TODO: Implement getPeriodsGateway() method.
    }

    /**
     * Starts a new database transaction (if possible)
     */
    public function startTransaction(): void {
        $this->mysqli->begin_transaction();
    }

    /**
     * Commits the database transaction
     */
    public function commit(): void {
        $this->commit();
    }

    /**
     * Rollback the database transaction
     */
    public function rollback(): void {
        $this->rollback();
    }
}