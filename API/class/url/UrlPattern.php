<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace url;
use exceptions\InvalidUrlPatternException;
use HttpMethod;
use transactions\ITransaction;

/**
 * Class UrlPattern, it specifies a pattern that may match some URL
 * and parse it to obtain the attributes within it and return the result.
 *
 * It is important to notice it can match the URL to different transactions
 * depending on the http method.
 */
class UrlPattern {
    /** @var string */
    private $regExp;
    /** @var string */
    private $staticPrefix;
    /** @var TransactionMap */
    private $transactions;
    /** @var [string] */
    private $paramNames;

    /** @var [string ] Provides the regular expressions for the given id types, notice the regExp will be sensitive case*/
    const TYPES = [
        'str'=>'[A-Za-z0-9_\-]+',
        'int'=>'[0-9]+',
        'flt'=>'(?:\+|\-)?[0-9]+(?:\.[0-9]+)?',
        'hex'=>'[0-9A-Fa-f]+'
    ];

    /**
     * UrlPattern constructor.
     * @param string $urlPattern an string representing the URL pattern. The URL pattern should
     *        written like a normal URI relative to the host (foo/var for http://host.com/foo/var ). Different parameters
     *        can be specified in the url using ':' at the start, for example: /foo/var/:id would
     *        set the url to accept anything after foo/var and save it as the param :id. To specify
     *        a type for the param use &lt;type&gt;, accepted types are the following: str (alphanumeric string with _ and -),
     *        int (unsigned int, only digits), flt (float), hex (hexadecimal string). An example of a
     *        valid urlPattern using all of this would be:
     *        "foo/:id<int>/bar/". The name of a parameter can only contain alphanumeric characters. The final
     *        bar will be accepted optionally, no matter the pattern introduced (it doesn't matter if we introduce
     *        "foo/:id<int>/bar" or "foo/:id<int>/bar/", "foo/65/bar/" and "foo/65/bar" will be both accepted always).
     *        All the params must have a type.
     * @param TransactionMap $transactions a transaction map with all the accepted transactions
     */
    public function __construct($urlPattern, $transactions) {
        $this->parsePattern($urlPattern);
        $this->transactions = $transactions;
    }

    /**
     * Given a method, an url and some request params, returns the right transaction
     * constructed if this is the correct pattern.
     * @param HttpMethod $httpMethod the http method to get the transaction for
     * @param string $url the url to check agains the pattern, it is expected to be relative to the host (should not include the host)
     * @param array $requestParams array with the parsed body and the get params (may be used by the transaction constructor)
     * @return ITransaction|null
     */
    public function match($httpMethod, $url, $requestParams) {
        // Check we can manage the method first (as it is the fastest thing to do)
        if(!$this->transactions->managesMethod($httpMethod)) {
            return null;
        }
        $url = trim($url, " \t\n\r\0\x0B/");
        // Check the prefix before the regexp as the second is more expensive
        if(substr($url, 0, strlen($this->staticPrefix)) !== $this->staticPrefix) {
            return null;
        }
        // Check regexp now
        if(preg_match($this->regExp, $url, $params) === 1) {
            $selectedParams = [];
            foreach($this->paramNames as $idx => $name) {
                $selectedParams[$name] = $params[$idx+1];
            }
            // Mix params with get
            $requestParams['get'] = array_merge($requestParams['get'], $selectedParams);
            $transactionClass = $this->transactions->get($httpMethod);

            // Return the required transaction
            return new $transactionClass($requestParams);
        }
        // If reg exp doesn't match return null
        return null;
    }

    /**
     * Parses the given pattern to obtain the staticPrefix (prefix till the first param), the param names
     * and the regExp (regular expresion)
     * @see UrlPattern::__construct
     * @param string $urlPattern an url pattern to parse. Check the format in the constructor of UrlPattern
     */
    private function parsePattern($urlPattern) {
        // Trim deleting also starting / and ending /
        $urlPattern = trim($urlPattern, " \t\n\r\0\x0B/");
        $this->paramNames = [];
        $params = [];
        $paramStrs = explode(':', $urlPattern);
        $this->staticPrefix = array_shift($paramStrs);
        foreach($paramStrs as $i=>$unparsedParam) {
            // param pattern recognition :name<type>sufix
            if(preg_match('/^([A-Z0-9]+)\<([A-Z]+)\>(.*)$/i', $unparsedParam, $matches) !== 1) {
                $idx = $i+1;
                throw new InvalidUrlPatternException($urlPattern, "invalid param $idx");
            }
            $name = $matches[1];
            $type = $matches[2];
            $sufix = $matches[3];
            if(array_key_exists($type, static::TYPES)) {
                $regExp = static::TYPES[$type];
            } else {
                $idx = $i+1;
                throw new InvalidUrlPatternException($urlPattern, "invalid type '$type' in param $idx");
            }
            $sufix = preg_quote($sufix, '/');
            // Add the param name and save the param in the array
            $params[] = '('.$regExp . ')'. $sufix; // We need the parenthesis to select the param later
            $this->paramNames[] = $name;
        }
        // Notice each of the $params is already prepared to put it in the regular expression
        $this->regExp =
            '/^\\/?' .
            preg_quote($this->staticPrefix, '/') .
            join('', $params).
            '\\/?$/';
    }

    /**
     * Useful for debug and testing
     * @return string
     */
    public function getRegExp(): string {
        return $this->regExp;
    }

    /**
     * Useful for debug and testing
     * @return string
     */
    public function getStaticPrefix(): string {
        return $this->staticPrefix;
    }

    /**
     * Useful for debug and testing
     * @return [string]
     */
    public function getParamNames() {
        return $this->paramNames;
    }
}