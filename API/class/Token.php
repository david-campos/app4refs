<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * The tokens manage the sessions, they contain the proper token string,
 * but also information about the expiration and the user.
 */
class Token {
    /** @var string */
    private $token;
    /** @var string */
    private $expires;
    /** @var string */
    private $userName;

    /**
     * Token constructor.
     * @param string $token the real token string
     * @param string $expires the expiration date
     * @param string $userName the user name
     */
    public function __construct(string $token, string $expires, string $userName) {
        $this->token = $token;
        $this->expires = $expires;
        $this->userName = $userName;
    }

    /**
     * Maps the token to an associative array so it can
     * be printed by the outputter
     */
    public function toMap() {
        return [
            IApiInterface::TOKEN_TOKEN => $this->token,
            IApiInterface::TOKEN_EXPIRES => $this->expires,
            IApiInterface::TOKEN_USER_NAME => $this->userName
        ];
    }

    /**
     * @return string
     */
    public function getToken(): string {
        return $this->token;
    }

    /**
     * @return string
     */
    public function getExpires(): string {
        return $this->expires;
    }

    /**
     * @return string
     */
    public function getUserName(): string {
        return $this->userName;
    }
}