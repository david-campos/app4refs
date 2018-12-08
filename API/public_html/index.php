<?php

// The config file configures the autoloaders for the classes
require('../config/config.php');

try {
    $controller = ControllerFacade::getInstance();
    $controller->processRequest(
        HttpMethod::fromStr($_SERVER['REQUEST_METHOD']),
        urldecode(explode('?', $_SERVER['REQUEST_URI'], 2)[0]),
        $_GET,
        file_get_contents('php://input'));
} catch (Exception $exception) {
    // Silently log any exception to error log and output server error
    error_log(
        "Exception [".$exception->getCode()."] in request: " . $exception->getMessage().
        " in file ". $exception->getFile().
        ", line ". $exception->getLine().
        ";".PHP_EOL."Trace:" . $exception->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    die('{"error": "Internal server exception"}');
} catch (Error $error) {
    // Same with errors
    error_log(
        "Error [".$error->getCode()."] in request: " . $error->getMessage().
        " in file " . $error->getFile().
        ", line " . $error->getLine().
        ";".PHP_EOL."Trace: " . $error->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    die('{"error":"Internal server error"}');
}