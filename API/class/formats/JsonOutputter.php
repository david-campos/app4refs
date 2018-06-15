<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

/**
 * Class JsonOutputter, outputs an associative array to the user and sets
 * the appropiate http status
 * @package formats
 */
class JsonOutputter implements IApiOutputter {
    /**
     * Outputs the specified array with the given format to the php response
     * and sets the response http status code.
     * @param int $httpStatusCode
     * @param array|null $array the output. Notice that if this values is an empty array, no content will
     * be sent. If, instead, it is null, the indicated httpStatusCode is sent.
     */
    public function output($httpStatusCode, $array) {
        if($array !== null) {
            if(count($array) > 0) {
                // Impresión
                $json = json_encode($array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                if ($json === false) {
                    // Avoid echo of an empty string (invalid JSON)
                    $json = json_encode(array("jsonError", json_last_error_msg()));
                    if ($json === false) {
                        $json = '{"jsonError": "unknown"}';
                    }
                    $httpStatusCode = IApiOutputter::HTTP_INTERNAL_SERVER_ERROR;
                }
                if ($json !== '') {
                    http_response_code($httpStatusCode);
                    header('Content-Type: application/json; charset=UTF-8');
                    echo $json;
                    return;
                }
            }
            // Nothing sent then
            http_response_code(IApiOutputter::HTTP_NO_CONTENT);
        } else {
            // If array is null, we respect the given status code
            http_response_code($httpStatusCode);
        }
    }
}