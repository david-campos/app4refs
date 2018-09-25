<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Thrown when trying to validate an expired token
 * @package exceptions
 */
class ExpiredTokenException extends UnauthorizedException {
    /**
     * InvalidTokenException constructor.
     */
    public function __construct() {
        parent::__construct('The given token has expired.', static::AUTHORISATION_BASIC);
    }
}