<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class FakeEnum, to use instead of the enums of the design
 */
abstract class FakeEnum {
    private $value;

    /**
     * ItemTypes constructor.
     * @param $value
     */
    protected function __construct($value) {
        $this->value = $value;
    }

    public function val() {
        return $this->value;
    }

    public function __toString() {
        return $this->val();
    }
}