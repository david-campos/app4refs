<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

/**
 * Thrown when some parameters that were required could not be found in the body of the request
 * @package exceptions
 */
class ParamsNotFoundInBodyException extends PrintableException {
    /**
     * ParamsNotFoundInBodyException constructor.
     * @param string[] $notFoundParams params which haven't been found
     * @param null|string $parentParam param inside which we expected to find the indicated params,
     * if null it is ommited from the message
     */
    public function __construct($notFoundParams, $parentParam=null) {
        $message = "Couldn't find the following params in the request body";
        if($parentParam !== null) {
            $message .= " inside the param '$parentParam'";
        }
        $message .= ': ' . join(', ', $notFoundParams);
        parent::__construct(IApiOutputter::HTTP_BAD_REQUEST, $message);
    }
}