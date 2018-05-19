<?php
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
     * @param HttpMethod $httpMethod the http method used for the request
     * @param string $url the requested url
     * @param array $getParams the params sent with the url
     * @param string $requestBody the request body
     */
    public function processRequest($httpMethod, $url, $getParams, $requestBody) {
    }

    /**
     * ControllerFacade constructor, private because of singleton
     */
    private function __construct() {}

    private function createTransaction($httpMethod, $url, $getParams, $requestBody): transactions\ITransaction {
    }
}