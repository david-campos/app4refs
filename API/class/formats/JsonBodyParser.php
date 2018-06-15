<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

use exceptions\RequestParsingException;

/**
 * Class JsonBodyParser, parses a JSON body string to an associative array
 * @package formats
 */
class JsonBodyParser implements IApiBodyParser {
    /**
     * Parses the given request body as a JSON and returns an array with the parsed data
     * @param string $bodyString the body of the http request
     * @throws RequestParsingException if it is not possible to parse the body as a JSON
     * @return array associative array for the received json string
     */
    public function parse($bodyString) {
        if($bodyString === '') {
            return [];
        }

        $array = json_decode($bodyString, true);
        if($array === null) {
            // json_last_error_msg()
            throw new RequestParsingException(401, 'Unable to parse body as JSON.');
        }
        return $array;
    }
}