<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;


use exceptions\DatabaseInternalException;
use exceptions\ExpiredTokenException;
use exceptions\IncorrectPasswordException;
use exceptions\InvalidTokenException;
use exceptions\OpenSslRandomPseudoBytesNotStrongException;
use exceptions\PrintableException;
use exceptions\UnauthorizedException;
use exceptions\UserNotFoundException;
use formats\IApiOutputter;
use gateways\ISessionsGateway;
use Token;

/**
 * @see ISessionsGateway
 * @package gateways\gtmysqli
 */
class MysqliSessionsGateway implements ISessionsGateway {
    const SQL_LOGIN_GET_SALT = 'SELECT password,salt FROM users WHERE username = ?';
    const SQL_LOGIN_INSERT_TOKEN = 'INSERT INTO tokens(access_token, expires, `user`) VALUES(?,?,?)';
    const SQL_DELETE_EXPIRED_TOKENS = 'DELETE FROM tokens WHERE expires < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))';

    const SQL_CHECK_TOKEN = 'SELECT `user`,expires FROM tokens WHERE access_token = ?';
    const SQL_DELETE_TOKEN = 'DELETE FROM tokens WHERE access_token = ?';

    /** @var \mysqli */
    private $mysqli;

    /**
     * MysqliItemsGateway constructor.
     * @param \mysqli $mysqli
     */
    public function __construct(\mysqli $mysqli) {
        $this->mysqli = $mysqli;
    }

    /**
     * Logs the user into the system, creating a token which it will return
     * @param string $userName
     * @param string $password
     * @return \Token
     * @throws DatabaseInternalException
     * @throws IncorrectPasswordException
     * @throws UserNotFoundException
     */
    function login(string $userName, string $password): \Token {
        // Check the password (exceptions will be thrown)
        $this->checkPassword($userName, $password);
        return $this->createToken($userName);
    }


    /**
     * @param string $token the token string
     * @return Token
     * @throws DatabaseInternalException
     * @throws ExpiredTokenException
     * @throws InvalidTokenException
     */
    function checkToken(string $token): \Token {
        $userName = null;
        $expiration = null;
        $stmt = $this->mysqli->prepare(static::SQL_CHECK_TOKEN);
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $token);
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($userName, $expiration);
            if(!$stmt->fetch()) {
                throw new InvalidTokenException();
            }
        } finally {
            $stmt->close();
        }
        // Check if it is expired
        if(strtotime($expiration) < time()) {
            $this->delete($token);
            throw new ExpiredTokenException();
        }
        return new Token($token, $expiration, $userName);
    }

    /**
     * @param string $token
     * @throws DatabaseInternalException
     */
    function delete(string $token) {
        $stmt = $this->mysqli->prepare(static::SQL_DELETE_TOKEN);
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $token);
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Checks if the user name and password are correct
     * @param string $userName
     * @param string $password
     * @throws DatabaseInternalException if there is some internal error with the query or connection
     * @throws IncorrectPasswordException if the password was incorrect
     * @throws UserNotFoundException if the user cannot be found in the database
     */
    function checkPassword(string $userName, string $password) {
        $stmt = $this->mysqli->prepare(static::SQL_LOGIN_GET_SALT);
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('s', $userName);
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
            $stmt->bind_result($dbPass, $salt);
            if(!$stmt->fetch()) {
                throw new UserNotFoundException(
                    IApiOutputter::HTTP_NOT_FOUND, "No user with name '$userName' found.");
            }
            $hashedPass = hash('sha512', $password.$salt);
            if($hashedPass !== $dbPass) {
                throw new IncorrectPasswordException();
            }
        } finally {
            $stmt->close();
        }
    }

    /**
     * Creates a new token for the user and inserts it
     * into the database.
     * @param string $userName
     * @return Token
     * @throws DatabaseInternalException
     */
    function createToken(string $userName) {
        $randomPseudoBytes = bin2hex(openssl_random_pseudo_bytes(32,  $strong));
        if( !$strong ) {
            throw new OpenSslRandomPseudoBytesNotStrongException();
        }
        $token = hash('sha256', uniqid(rand(), true).$randomPseudoBytes);

        $expiration = date("Y-m-d H:i:s",
            strtotime('+'.\IApiInterface::TOKEN_DURATION.' seconds'));

        $this->deleteOldTokens();

        $stmt = $this->mysqli->prepare(static::SQL_LOGIN_INSERT_TOKEN);
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            $stmt->bind_param('sss', $token, $expiration, $userName);
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
        return new Token($token, $expiration, $userName);
    }

    function deleteOldTokens() {
        $stmt = $this->mysqli->prepare(static::SQL_DELETE_EXPIRED_TOKENS);
        if($stmt === false) {
            throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
        }
        try {
            if(!$stmt->execute()) {
                throw new DatabaseInternalException($this->mysqli->error, $this->mysqli->errno);
            }
        } finally {
            $stmt->close();
        }
    }
}