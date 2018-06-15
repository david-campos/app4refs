<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use PHPUnit\Runner\Exception;

/**
 * An exception InvalidUrlPatternException is thrown when some url pattern passed to the
 * constructor of an UrlPattern is an invalid pattern.
 * @package exceptions
 */
class InvalidUrlPatternException extends Exception {
    /**
     * InvalidUrlPatternException constructor.
     * @param string $url the invalid url pattern
     * @param string $cause cause of the pattern to be invalid (if known)
     */
    public function __construct($url, $cause='unknown') {
        parent::__construct('The specified pattern ('.$url.') is not a valid URL pattern. Cause: '.$cause.'.');
    }
}