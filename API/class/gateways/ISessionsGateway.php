<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways;

use exceptions\ExpiredTokenException;
use exceptions\IncorrectPasswordException;
use exceptions\InvalidTokenException;
use exceptions\UserNotFoundException;

/**
 * Interface to access the database to manage the sessions,
 * i.e. all the stuff relative to login and tokens.
 * @package gateways
 */
interface ISessionsGateway {
    /**
     * Logs the user into the system, creating a token which it will return
     * @param string $userName
     * @param string $password
     * @return \Token
     * @throws IncorrectPasswordException if the password is incorrect
     * @throws UserNotFoundException if the user does not exist
     */
    function login(string $userName, string $password): \Token;

    /**
     * Checks the if the given token string is valid and returns
     * the correspondent token object. The check also deletes
     * the tokens expired more than 7 days ago.
     * @param string $token the token string
     * @return \Token
     * @throws InvalidTokenException if the token is invalid
     * @throws ExpiredTokenException if the token has expired
     */
    function checkToken(string $token): \Token;

    /**
     * Deletes the token from the database making it not valid anymore
     * @param string $token
     */
    function delete(string $token);

    /**
     * Changes the password for the user associated to the given token
     * @param \Token $token - The token which authorised the user
     * @param string $oldPassword - The current password for the user
     * @param string $newPassword - The new password for the user
     */
    function changePassword(\Token $token, string $oldPassword, string $newPassword);
}