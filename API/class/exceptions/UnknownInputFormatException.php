<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Class UnknownInputFormatException is thrown when the requested format
 * for the input is not known.
 *
 * @see \formats\FormatsFactory
 *
 * @package exceptions
 */
class UnknownInputFormatException extends PrintableException {
    public function __construct($status, $format, $code = 0) {
        parent::__construct($status, "Unknown format for input: '$format'", $code);
    }
}