<?php

use formats\FormatsFactory;

/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class ControllerFacade {
    /** @var ControllerFacade */
    private static $instance = null;

    public static function getInstance() {
        if(static::$instance === null) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    /**
     * Processes the incoming request, executing the right transaction and giving the answer to the client
     * @param HttpMethod $httpMethod the http method used for the request
     * @param string $url the requested url
     * @param array $getParams the params sent with the url
     * @param string $requestBody the request body
     */
    public function processRequest($httpMethod, $url, $getParams, $requestBody) {
        $formatIn = $this->getInputFormat($getParams);
        $parser = FormatsFactory::getInstance()->getParserForFormat($formatIn);
        $formatOut = $this->getOutputFormat($getParams);
        $outputter = FormatsFactory::getInstance()->getOutputterForFormat($formatOut);

        $parsedBody = $parser->parse($requestBody);
        $transaction = $this->createTransaction($httpMethod, $url, $getParams, $parsedBody);
        $transaction->execute();
        $outputter->output($transaction->getStatus(), $transaction->getResult());
    }

    /**
     * ControllerFacade constructor, private because of singleton
     */
    private function __construct() {}

    /**
     * Gets the input format for the current request, checking the sent params.
     * If the input format param is an string, the string will be returned,
     * if it is an array, the first element will be taken. If it doesn't exist
     * or it has not one of the previously stated types, the default value
     * is returned.
     *
     * @see \IApiInterface
     *
     * @param array $params the params received in the request
     * @return string
     */
    private function getInputFormat($params) {
        $selected = IApiInterface::INPUT_FORMAT_DEFAULT;
        if(array_key_exists(IApiInterface::INPUT_FORMAT_PARAM, $params)) {
            $inParam = $params[IApiInterface::INPUT_FORMAT_PARAM];
            if(is_string($inParam)) {
                $selected = $inParam;
            } else if(is_array($inParam) && is_string($inParam[0])) {
                $selected = $inParam[0];
            }
        }
        return $selected;
    }

    /**
     * Gets the output format for the current request, checking the sent params.
     * If the output format param is an string, the string will be returned,
     * if it is an array, the first element will be taken. If it doesn't exist
     * or it has not one of the previously stated types, the default value
     * is returned.
     *
     * @see \IApiInterface
     *
     * @param array $params the params received in the request
     * @return string
     */
    private function getOutputFormat($params) {
        $selected = IApiInterface::OUTPUT_FORMAT_DEFAULT;
        if(array_key_exists(IApiInterface::OUTPUT_FORMAT_PARAM, $params)) {
            $outParam = $params[IApiInterface::OUTPUT_FORMAT_PARAM];
            if(is_string($outParam)) {
                $selected = $outParam;
            } else if(is_array($outParam) && is_string($outParam[0])) {
                $selected = $outParam[0];
            }
        }
        return $selected;
    }

    /**
     * Creates a transaction for an http request given some information about it
     * @param int $httpMethod the http method used for the request
     * @param string $url the url requested, as you would expect it from the server global REQUEST_URI
     * @param array $getParams params sent with the request in the url (GET params)
     * @param array $requestParsedBody body of the request, already parsed by an IApiBodyParser into an associative array
     * @return \transactions\ITransaction
     */
    private function createTransaction($httpMethod, $url, $getParams, $requestParsedBody): transactions\ITransaction {
        
    }
}