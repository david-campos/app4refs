<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

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
}