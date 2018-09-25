<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Exception thrown when the password for the user is incorrect
 * @package exceptions
 */
class IncorrectPasswordException extends UnauthorizedException {
    /**
     * IncorrectPasswordException constructor.
     */
    public function __construct() {
        parent::__construct('Incorrect password', static::AUTHORISATION_BASIC);
    }
}