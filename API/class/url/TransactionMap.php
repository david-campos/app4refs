<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace url;

use exceptions\InvalidTransactionException;
use HttpMethod;
use transactions\ITransaction;

/**
 * A set of pairs <key, value> where the key is an HttpMethod and the value
 * is a string which is the complete name of a transaction class
 */
class TransactionMap {
    /** @var [string] the key is the http method val() */
    private $pairs;

    /**
     * Create a map
     */
    public function __construct() {
        $this->pairs = []; // Empty array
    }

    /**
     * Adds the transaction to the map with the given method. If the
     * method already had another transaction associated, it will
     * be replaced silently.
     * @param HttpMethod $httpMethod
     * @param string $transactionClass
     * @throws InvalidTransactionException whn the transaction class does not implement ITransaction
     */
    public function put($httpMethod, $transactionClass) {
        $interfaces = class_implements($transactionClass);
        // Check it implements ITransaction
        if(isset($interfaces[ITransaction::class])) {
            $this->pairs[$httpMethod->val()] = $transactionClass;
        } else {
            if(class_exists($transactionClass)) {
                throw new InvalidTransactionException(
                    "$transactionClass is not an implementation of ITransaction.");
            } else {
                throw new InvalidTransactionException(
                    "Class $transactionClass does not exist.");
            }
        }
    }

    /**
     * Removes the transaction associated to the given http method
     * @param HttpMethod $httpMethod the method whose associated transaction we want to remove
     */
    public function rem($httpMethod) {
        if(isset($this->pairs[$httpMethod->val()])) {
            unset($this->pairs[$httpMethod->val()]);
        }
    }

    /**
     * Gets the transaction class name for the given http method. If there is no transaction
     * associated to the given method, null is returned.
     * @param HttpMethod $httpMethod the http method whose associated transaction we want to get
     * @return string|null the associated transaction class to the method or null if there is no class asociated to the method
     */
    public function get($httpMethod) {
        if(isset($this->pairs[$httpMethod->val()])) {
            return $this->pairs[$httpMethod->val()];
        }
        return null;
    }

    /**
     * Gets the number of methods which have an associated transaction
     */
    public function size() {
        return count($this->pairs);
    }

    /**
     * Checks if the given method has any Transaction associated
     * @param HttpMethod $httpMethod
     * @return bool
     */
    public function managesMethod($httpMethod) {
        return array_key_exists($httpMethod->val(), $this->pairs);
    }
}