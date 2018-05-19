<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

/**
 * Class PrintableException, all the exceptions of this class are safe to print
 * to the client by the API
 */
abstract class PrintableException extends \Exception {
    /** @var int */
    private $status;

    /**
     * PrintableException constructor.
     * @param int $status HTTP status to use when printing the exception
     * @param string $message Message to print when printing the exception
     * @param int $code exception class
     */
    public function __construct(int $status, string $message, int $code=0) {
        parent::__construct($message, $code);
        $this->status = $status;
    }

    /**
     * @return int
     */
    public function getStatus(): int {
        return $this->status;
    }

    /**
     * @param int $status
     */
    public function setStatus(int $status) {
        $this->status = $status;
    }
}