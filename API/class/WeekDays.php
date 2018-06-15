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

    /**
     * Creates the fake enum value from a string
     * @param string $str should be a valid value
     * @return WeekDays
     */
    public static function forStr($str) {
        /** @var WeekDays[] $values */
        $values = [static::MONDAY(), static::TUESDAY(), static::WEDNESDAY(),
            static::THURSDAY(), static::FRIDAY(), static::SATURDAY(), static::SUNDAY()];
        foreach($values as $val) {
            if($val->val() === $str) {
                return $val;
            }
        }
        throw new \exceptions\InvalidWeekDayStrException("The str '$str' is not a valid WeekDay value.");
    }
}