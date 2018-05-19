<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class FormatsFactory {
    /** @var FormatsFactory */
    static $instance = null;

    public static function getInstance() {
        if(static::$instance === null) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    /**
     * Gets a parser for the given format
     * @param string $format some format
     * @returns IApiBodyParser
     */
    public function getParserForFormat($format) {
        throw new Exception('not implemented yet');
    }

    /**
     * Gets an outputter for the given format
     * @param string $format some format
     * @returns IApiOutputter
     */
    public function getOutputterForFormat($format) {
        throw new Exception('not implemented yet');
    }

    /**
     * FormatsFactory constructor, private for singleton
     */
    private function __construct() {}
}