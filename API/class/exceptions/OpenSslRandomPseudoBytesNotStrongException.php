<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use PHPUnit\Runner\Exception;

/**
 * Thrown when the function openssl_random_pseudo_bytes is not strong enough.
 * @see openssl_random_pseudo_bytes()
 * @package exceptions
 */
class OpenSslRandomPseudoBytesNotStrongException extends Exception {
    /**
     * OpenSslRandomPseudoBytesNotStrongException constructor.
     */
    public function __construct() {
        parent::__construct('The OpenSSL random pseudobytes are not strong enough. Update the SSL.');
    }
}