<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Class UnknownTypeStrException is thrown when we are trying to create a Type from a
 * string and this string does not correspond to any known type
 *
 * @see \ItemType
 *
 * @package exceptions
 */
class UnknownTypeStrException extends \Exception{}