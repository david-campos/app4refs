<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Thrown when some value inside the body is not valid.
 * @package exceptions
 */
class InvalidValueInBodyException extends PrintableException {
    public function __construct($message, $code = 0) {
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST, $message, $code);
    }

}