<?php

use exceptions\UnknownHttpMethodException;
use formats\IApiOutputter;

/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class HttpMethod extends FakeEnum {
    protected function __construct($value) {
        parent::__construct($value);
    }

    public static function GET() {
        return new self('get');
    }
    public static function POST() {
        return new self('post');
    }
    public static function PUT() {
        return new self('put');
    }
    public static function DELETE() {
        return new self('delete');
    }

    public static function fromStr($string) {
        switch(strtoupper($string)) {
            case 'GET': return new self('get');
            case 'POST': return new self('post');
            case 'PUT': return new self('put');
            case 'DELETE': return new self('delete');
        }
        throw new UnknownHttpMethodException(IApiOutputter::HTTP_BAD_REQUEST, "Unknown http method '$string'");
    }
}