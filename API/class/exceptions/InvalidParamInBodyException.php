<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;


use formats\IApiOutputter;

/**
 * Thrown when an invalid param is found in the body request
 * @package exceptions
 */
class InvalidParamInBodyException extends PrintableException {
    public function __construct($param, $code = 0) {
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST,
            "Invalid param '$param' found in request body.",
            $code);
    }
}