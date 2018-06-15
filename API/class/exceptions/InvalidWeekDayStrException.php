<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use PHPUnit\Runner\Exception;

/**
 * Class InvalidWeekDayStrException is an exception thrown when we try to create a
 * WeekDay from an invalid string.
 * @package exceptions
 */
class InvalidWeekDayStrException extends Exception {}