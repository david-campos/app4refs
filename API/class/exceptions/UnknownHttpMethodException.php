<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Class UnknownHttpMethodException is thrown when the http method we are
 * trying to create from a string is not one of the known methods.
 *
 * @see \HttpMethod
 *
 * @package exceptions
 */
class UnknownHttpMethodException extends PrintableException {}