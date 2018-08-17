<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\InvalidTokenException;
use exceptions\UnauthorizedException;
use formats\IApiOutputter;
use gateways\GatewayFactory;

class LogoutTransaction extends Transaction {
    /** @var string */
    private $token;

    /**
     * The request params should have the following structure:
     * ['get' => [], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     * @throws InvalidTokenException
     * @throws UnauthorizedException
     */
    public function __construct($requestParams) {
        $this->token = \SessionManager::getInstance()->getToken($requestParams);
        if($this->token === null) {
            throw new UnauthorizedException('No token found', UnauthorizedException::AUTHORISATION_BEARER);
        }
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {
        GatewayFactory::getInstance()->startTransaction(true);
        GatewayFactory::getInstance()->getSessionsGateway()->delete($this->token);
        $this->result = ['done'=>'Token deleted'];
        $this->status = IApiOutputter::HTTP_OK;
        GatewayFactory::getInstance()->commit();
    }
}