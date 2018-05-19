<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use exceptions\UnknownTypeStrException;

/**
 * Item types
 */
class ItemType extends FakeEnum {
    protected function __construct($value) {
        parent::__construct($value);
    }

    public static function SERVICE() {
        return new self('service');
    }
    public static function LEISURE() {
        return new self('leisure');
    }
    public static function LINK() {
        return new self('link');
    }
    public static function HELP() {
        return new self('help');
    }
    public static function INFO() {
        return new self('info');
    }

    /**
     * Creates the right item type for the given string, the strings in this class should
     * coincide with the ones in the database, so we can pass them directly into here
     * @param $string string The string to check
     * @return ItemType the item type with the given string as value
     * @throws UnknownTypeStrException if the given type does not match any of the types known by the current
     * implementation of this class.
     */
    public static function FOR_STR($string) {
        if(in_array($string, array('service', 'leisure', 'link', 'help', 'info'))) {
            return new self($string);
        } else {
            throw new UnknownTypeStrException("Tried to create unknown item type '$string'.");
        }
    }
}