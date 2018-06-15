<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;


use formats\IApiOutputter;

/**
 * Thrown when some parameter in the request was expected to be a list and it is not.
 * @package exceptions
 */
class ListExpectedException extends PrintableException {

    /**
     * ListExpectedException constructor.
     * @param string $param param which was expected to be a list
     * @param int $code error code
     */
    public function __construct($param, $code=0) {
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST, "Parameter '$param' expected to be a list.", $code);
    }
}