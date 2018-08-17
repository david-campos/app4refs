<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\UnauthorizedException;
use formats\IApiOutputter;
use gateways\GatewayFactory;

class LoginTransaction extends Transaction {
    /** @var string */
    private $user;
    /** @var string */
    private $receivedPassword;

    /**
     * The request params should have the following structure:
     * ['get' => [], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     * @throws UnauthorizedException
     */
    public function __construct($requestParams) {
        if (!isset($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
            throw new UnauthorizedException(
                'Please, send user and password with the basic authentication method.',
                UnauthorizedException::AUTHORISATION_BASIC);
        } else {
            $this->user = $_SERVER['PHP_AUTH_USER'];
            $this->receivedPassword = $_SERVER['PHP_AUTH_PW'];
        }
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {
        GatewayFactory::getInstance()->startTransaction(true);
        $token = GatewayFactory::getInstance()->getSessionsGateway()->login(
            $this->user,
            $this->receivedPassword);
        $this->result = $token->toMap();
        $this->status = IApiOutputter::HTTP_OK;
        GatewayFactory::getInstance()->commit();
    }
}