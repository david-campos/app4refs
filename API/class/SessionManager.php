<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use exceptions\InvalidTokenException;
use exceptions\UnauthorizedException;
use gateways\GatewayFactory;

/**
 * Manages session tokens
 */
class SessionManager {
    private function __construct() {
        $this->token = null;
    }
    private function __clone() {}

    private static $instance = null;

    /**
     * Gets the singleton instance for this class
     * @return SessionManager
     */
    public static function getInstance() {
        if(static::$instance === null) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    /**
     * @var Token When the token is obtained for the current
     * request, it is saved here so future calls to check the token
     * in the same request do not require database connection.
     */
    private $token;

    /**
     * Checks for the existence of a valid token. If there is no
     * valid token it throws an exception.
     * ['get' => ['token'=>the token], 'body'=>[]].
     * When several tokens provided, the header token has preference.
     * Sucesive calls to this method return the same token, no database connection
     * required since the object stores the value.
     * @param array $requestParams the request params after all the processing
     * @throws InvalidTokenException When an invalid token is passed (incorrect format,
     *              or not in the database)
     * @throws UnauthorizedException When there is no token
     * @return Token The token object in case everything was correct
     */
    public function requireToken($requestParams) {
        if($this->token === null) {
            $token = $this->getToken($requestParams);
            if ($token === null) {
                throw new UnauthorizedException('No token found', UnauthorizedException::AUTHORISATION_BEARER);
            }
            $this->token = GatewayFactory::getInstance()->getSessionsGateway()->checkToken($token);
        }
        return $this->token;
    }

    /**
     * Tries to obtain the token if it is in the headers or in the request
     * params. The token can only be in the 'get' part of the request params.
     * To place it in the params, the request params should have the following structure:
     * ['get' => ['token'=>the token], 'body'=>[]].
     * When several tokens provided, the header token has preference.
     * @param array $requestParams the request params after all the processing
     * @return string|null The token, if passed, or null if it couldn't be found
     * @throws InvalidTokenException When an invalid token is passed
     */
    public function getToken($requestParams) {
        $authorization = $this->getAuthorizationHeader();
        if (!empty($authorization)) {
            if (preg_match('/Bearer\s([0-9A-Fa-f]+)/', $authorization, $matches)) {
                return $matches[1];
            } else {
                throw new InvalidTokenException();
            }
        }
        if (isset($requestParams['get'][IApiInterface::TOKEN_PARAM])) {
            if (preg_match('/[0-9A-Fa-f]+/', $requestParams['get'][IApiInterface::TOKEN_PARAM])) {
                return $requestParams['get'][IApiInterface::TOKEN_PARAM];
            } else {
                throw new InvalidTokenException();
            }
        }
        return null;
    }

    /**
     * Gets the user and password of the basic authentication from the headers of the request
     * or from the BODY of the request (given the request params)
     * @param array $requestParams the request params after all the processing
     * @return array
     */
    public function getUserAndPassword($requestParams) {
        if (isset($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
            return [$_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']];
        } else {
            $authorization = $this->getAuthorizationHeader();
            if (!empty($authorization)) {
                if (preg_match('/Basic\s([0-9A-Fa-f=]+)/', $authorization, $matches)) {
                    return  explode(':', base64_decode($matches[1]));
                }
            }
            if (isset(
                $requestParams['body'][IApiInterface::SESSION_USER],
                $requestParams['body'][IApiInterface::SESSION_PASSWORD])) {
                return [
                    $requestParams['body'][IApiInterface::SESSION_USER],
                    $requestParams['body'][IApiInterface::SESSION_PASSWORD]];
            }
        }
        return [null,null];
    }

    private function getAuthorizationHeader(){
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            // Server-side fix for bug in old Android versions
            // (a nice side-effect of this fix means we don't care
            // about capitalization for Authorization)
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }
}