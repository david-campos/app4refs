<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

use exceptions\UnknownInputFormatException;
use exceptions\UnknownOutputFormatException;

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
        if(strtolower(trim($format)) === \IApiInterface::FORMATS_JSON) {
            return new JsonBodyParser();
        }

        throw new UnknownInputFormatException(IApiOutputter::HTTP_BAD_REQUEST, $format);
    }

    /**
     * Gets an outputter for the given format
     * @param string $format some format
     * @return IApiOutputter
     * @throws UnknownOutputFormatException
     */
    public function getOutputterForFormat($format) {
        if(strtolower(trim($format)) === \IApiInterface::FORMATS_JSON) {
            return new JsonOutputter();
        }

        throw new UnknownOutputFormatException(IApiOutputter::HTTP_BAD_REQUEST, $format);
    }

    /**
     * FormatsFactory constructor, private for singleton
     */
    private function __construct() {}
}