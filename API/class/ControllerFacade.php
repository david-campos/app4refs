<?php

use formats\FormatsFactory;
use url\UrlMatcher;

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
     * Processes the incoming request, executing the right transaction and giving the answer to the client.
     * This method catches and outputs all the printable exceptions the process may throw.
     * @param HttpMethod $httpMethod the http method used for the request
     * @param string $url the requested url
     * @param array $getParams the params sent with the url
     * @param string $requestBody the request body
     */
    public function processRequest($httpMethod, $url, $getParams, $requestBody) {
        try {
            $formatOut = $this->getOutputFormat($getParams);
            $outputter = FormatsFactory::getInstance()->getOutputterForFormat($formatOut);
            $formatIn = $this->getInputFormat($getParams);
            $parser = FormatsFactory::getInstance()->getParserForFormat($formatIn);

            $parsedBody = $parser->parse($requestBody);
            $requestParams = ['body' => $parsedBody, 'get' => $getParams];
            $url = $this->processUrl($url);
            $transaction = UrlMatcher::getInstance()->match($httpMethod, $url, $requestParams);
            $transaction->execute();
            $outputter->output($transaction->getStatus(), $transaction->getResult());
        } catch (\exceptions\PrintableException $exception) {
            $outputter = new \formats\JsonOutputter();
            $outputter->output($exception->getStatus(), ['error'=>$exception->getMessage()]);
        }
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
     * @param string $url checks if the URL contains the base URI of the API
     * and removes this prefix to have the real URL for the comparison
     * @return string|bool FALSE if there is some error, otherwise the URL without the API base URI
     */
    private function processUrl($url) {
        if($url === "") return $url;
        // Check to remove starting base uri
        if(substr($url, 0, strlen(IApiInterface::API_BASE_URI)) === IApiInterface::API_BASE_URI) {
           return substr($url, strlen(IApiInterface::API_BASE_URI));
        }
        if(substr($url,0, 1 + strlen(IApiInterface::API_BASE_URI)) === '/' . IApiInterface::API_BASE_URI) {
            return substr($url, strlen(IApiInterface::API_BASE_URI)+1);
        }
        return $url;
    }
}