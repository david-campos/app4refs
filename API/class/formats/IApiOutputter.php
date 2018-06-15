<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace formats;

/**
 * Interface to output the data of the API to the client, it provides
 * some constants for the common HTTP status codes to simplify the task.
 * @package formats
 */
interface IApiOutputter {
    /**
     * Outputs the specified array with the given format to the php response
     * and sets the response http status code
     * @param int $httpStatusCode
     * @param array|null $array the output
     */
    public function output($httpStatusCode, $array);

    /**
     * @var int Status code for http: success-ok
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_OK = 200;
    /**
     * @var int Status code for http: success-created
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_CREATED = 201;
    /**
     * @var int Status code for http: success-accepted
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_ACCEPTED = 202;
    /**
     * @var int Status code for http: success-no content
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_NO_CONTENT = 204;
    /**
     * @var int Status code for http: redirection-not modified
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_NOT_MODIFIED = 304;
    /**
     * @var int Status code for http: client error - bad request
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_BAD_REQUEST = 400;
    /**
     * @var int Status code for http: client error - unauthorized
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_UNAUTHORIZED = 401;
    /**
     * @var int Status code for http: client error - forbidden
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_FORBIDDEN = 403;
    /**
     * @var int Status code for http: client error - not found
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_NOT_FOUND = 404;
    /**
     * @var int Status code for http: client error - method not allowed
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_METHOD_NOT_ALLOWED = 405;
    /**
     * @var int Status code for http: client error - gone
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_GONE = 410;
    /**
     * @var int Status code for http: client error - too many requests
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_TOO_MANY_REQUESTS = 429;
    /**
     * @var int Status code for http: server error - internal server error
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_INTERNAL_SERVER_ERROR = 500;
    /**
     * @var int Status code for http: server error - not implemented
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
     */
    const HTTP_NOT_IMPLEMENTED = 501;
}