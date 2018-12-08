<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace transactions;

use exceptions\RequestParsingException;
use formats\IApiOutputter;
use gateways\GatewayFactory;
use SessionManager;

class ChangePasswordTransaction extends Transaction {
    /** @var \Token */
    private $token;
    /** @var string */
    private $newPassword;
    /** @var string */
    private $oldPassword;

    /**
     * The request params should have the following structure:
     * ['get' => [], 'body'=>[]]
     * @param array $requestParams the request params after all the processing
     * @throws RequestParsingException
     */
    public function __construct($requestParams) {
        $this->token = SessionManager::getInstance()->requireToken($requestParams);

        if(isset($requestParams['body'][\IApiInterface::SESSION_PASSWORD])) {
            $this->oldPassword = $requestParams['body'][\IApiInterface::SESSION_PASSWORD];
        } else {
            throw new RequestParsingException(IApiOutputter::HTTP_BAD_REQUEST,
                "Field '".\IApiInterface::SESSION_PASSWORD."' not found in body");
        }

        if(isset($requestParams['body'][\IApiInterface::SESSION_NEW_PASSWORD])) {
            $this->newPassword = $requestParams['body'][\IApiInterface::SESSION_NEW_PASSWORD];
        } else {
            throw new RequestParsingException(IApiOutputter::HTTP_BAD_REQUEST,
                "Field '".\IApiInterface::SESSION_NEW_PASSWORD."' not found in body");
        }
    }

    /**
     * Executes the transaction, has no return value
     */
    public function execute() {
        GatewayFactory::getInstance()->startTransaction(true);
        GatewayFactory::getInstance()->getSessionsGateway()
            ->changePassword($this->token, $this->oldPassword, $this->newPassword);
        $this->result = [];
        $this->status = IApiOutputter::HTTP_OK;
        GatewayFactory::getInstance()->commit();
    }
}