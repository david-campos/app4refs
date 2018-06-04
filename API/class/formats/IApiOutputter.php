<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

interface IApiOutputter {
    /**
     * Outputs the specified array with the given format to the php response
     * and sets the response http status code
     * @param int $httpStatusCode
     * @param array $array
     */
    public function output($httpStatusCode, $array);
}