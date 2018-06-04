<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

interface IApiBodyParser {
    /**
     * Parses the given request body and returns an array with the parsed data
     * @param string $bodyString
     * @return array
     */
    public function parse($bodyString);
}