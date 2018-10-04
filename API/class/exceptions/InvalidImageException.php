<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Class InvalidImageException, thrown when the image passed in some request
 * is not valid.
 * @package exceptions
 */
class InvalidImageException extends RequestParsingException {
    public function __construct($message, $code = 0) {
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST, $message, $code);
    }
}