<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Class InvalidTransactionException is thrown when we try to make
 * a class that does not implement ITransaction as a transaction.
 * Used, for example, in TransactionMap
 * @package exceptions
 */
class InvalidTransactionException extends \Exception {}