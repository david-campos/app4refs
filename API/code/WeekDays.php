<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class WeekDays, an enum of the days of the week
 */
class WeekDays extends FakeEnum {
    protected function __construct($value) {
        parent::__construct($value);
    }

    public static function MONDAY() {
        return new self('mon');
    }
    public static function TUESDAY() {
        return new self('tue');
    }
    public static function WEDNESDAY() {
        return new self('wed');
    }
    public static function THURSDAY() {
        return new self('thu');
    }
    public static function FRIDAY() {
        return new self('fri');
    }
    public static function SATURDAY() {
        return new self('sat');
    }
    public static function SUNDAY() {
        return new self('sun');
    }
}