<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;


class UnknownInputFormatException extends PrintableException {
    public function __construct($status, $format, $code = 0) {
        parent::__construct($status, "Unknown forma: '$format'", $code);
    }
}