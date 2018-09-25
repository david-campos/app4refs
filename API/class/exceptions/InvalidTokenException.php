<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Thrown when trying to validate an invalid token.
 * @package exceptions
 */
class InvalidTokenException extends PrintableException {
    /**
     * InvalidTokenException constructor.
     */
    public function __construct() {
        parent::__construct(IApiOutputter::HTTP_UNAUTHORIZED, 'The given token is not valid.');
    }
}