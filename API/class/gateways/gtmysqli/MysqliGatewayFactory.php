<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;

use exceptions\DatabaseInternalException;
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
        $this->mysqli = new mysqli('localhost', 'root', '', 'pruebas_tfg');
        if ($this->mysqli->connect_error) {
            throw new DatabaseInternalException('Database connection error (' . $this->mysqli->connect_errno . ') '
                . $this->mysqli->connect_error);
        }
        $this->mysqli->autocommit(false);
        if (!$this->mysqli->set_charset("utf8")) {
            throw new DatabaseInternalException("Error loading charset utf8: %s\n", $this->mysqli->error);
        }
    }

    /**
     * Gets the items gateway to obtain items from the database
     * @return IItemsGateway
     */
    public function getItemsGateway(): IItemsGateway {
        return new MysqliItemsGateway($this->mysqli);
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
        return new MysqliPeriodsGateway($this->mysqli);
    }

    /**
     * Starts a new database transaction (if possible)
     */
    public function startTransaction() {
        $this->mysqli->begin_transaction();
    }

    /**
     * Commits the database transaction
     */
    public function commit() {
        $this->mysqli->commit();
    }

    /**
     * Rollback the database transaction
     */
    public function rollback() {
        $this->mysqli->rollback();
    }
}