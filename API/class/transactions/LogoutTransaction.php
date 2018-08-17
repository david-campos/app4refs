<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\UnauthorizedException;

class LogoutTransaction extends Transaction {
    /** @var string */
    private $token;

    /**
     * The request params should have the following structure:
     * ['get' => [], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     * @throws UnauthorizedException
     */
    public function __construct($requestParams) {
        // Get and save bearer token
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {

    }
}