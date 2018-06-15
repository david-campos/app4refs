<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Stub for ITransaction used in testing, the result will return the array
 * passed in the constructor. Executing does nothing.
 */
class FakeTransaction implements \transactions\ITransaction {
    private $result;

    /**
     * FakeTransaction constructor.
     * @param mixed $array
     */
    public function __construct($array) {
        $this->result = $array;
    }

    /**
     * Does nothing
     */
    public function execute() {
        // Do nothing
    }

    /**
     * Gets the result of the transaction, which will be the array passed to the constructor
     * @return mixed
     */
    public function getResult() {
        return $this->result;
    }

    /**
     * Gets the final response status of the transaction, which should be an integer
     * @return int
     */
    public function getStatus() {
        return 200; // OK!
    }
}