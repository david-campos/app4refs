<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Thrown when the requested URI does not match any of the registered patterns. It is a
 * printable exception.
 * @package exceptions
 */
class UnknownResourceUriException extends PrintableException {}