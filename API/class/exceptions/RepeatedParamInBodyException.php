<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;


use formats\IApiOutputter;

/**
 * Thrown when we find a repeated param while parsing the body.
 * @package exceptions
 */
class RepeatedParamInBodyException extends PrintableException {
    public function __construct($param, $code = 0) {
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST,
            "Repeated param '$param' found in request body.",
            $code);
    }
}