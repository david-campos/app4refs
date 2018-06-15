<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

/**
 * Abstract class which serves as base for all the transactions of the domain layer in the system.
 * @package transactions
 */
abstract class Transaction implements ITransaction {
    /** @var int http status after executing the transaction */
    protected $status;
    /** @var mixed result of the transaction after the execution */
    protected $result;

    public function getResult() {
        return $this->result;
    }

    public function getStatus() {
        return $this->status;
    }
}