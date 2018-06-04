<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

use exceptions\UnknownInputFormatException;

class FormatsFactory {
    /** @var FormatsFactory */
    static $instance = null;

    /**
     * Gets the singleton instance of this factory
     * @return FormatsFactory
     */
    public static function getInstance() {
        if(static::$instance === null) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    /**
     * Gets a parser for the given format
     * @param string $format some format
     * @return IApiBodyParser
     * @throws UnknownInputFormatException
     */
    public function getParserForFormat($format) {
        if(strtolower(trim($format)) === 'json') {
            return new JsonBodyParser();
        }

        throw new UnknownInputFormatException(401, $format);
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