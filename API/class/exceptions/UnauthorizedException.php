<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace exceptions;

use formats\IApiOutputter;

class UnauthorizedException extends PrintableException {
    /** @var string Authorisation type basic */
    const AUTHORISATION_BASIC = 'Basic';
    /** @var string Authorisation type bearer */
    const AUTHORISATION_BEARER = 'Bearer';
    /** @var string Authorisation type modified basic */
    const AUTHORISATION_BASIC_MODIFIED = 'BasicAlike';

    /** @var string The authorisation type */
    private $type;
    /** @var string The realm for the WWW-Authenticate */
    private $realm;
    /**
     * UnauthorizedException constructor.
     * @param int $message A message to display in the body
     * @param string $type The type of authorisation required for the WWW-Authenticate
     * @param string $realm The realm for the WWW-Authenticate
     */
    public function __construct($message, $type, $realm=null) {
        parent::__construct(IApiOutputter::HTTP_UNAUTHORIZED, $message);
        $this->type = $type;
        $this->realm = $realm;
    }

    public function getStatus(): int {
        $header = 'WWW-Authenticate: '.$this->type;
        if($this->realm) {
            $header .=
                ' realm="'
                .htmlspecialchars($this->realm, ENT_QUOTES, 'UTF-8')
                .'"';
        }
        header($header);
        return parent::getStatus();
    }


}