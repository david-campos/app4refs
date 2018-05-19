<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */
namespace transactions;

interface ITransaction {
    /**
     * Executes the transaction, has no return
     */
    public function execute();

    /**
     * Gets the result of the transaction, whatever it is
     * @return mixed
     */
    public function getResult();

    /**
     * Gets the final response status of the transaction, which should be an integer
     * @return int
     */
    public function getStatus();
}