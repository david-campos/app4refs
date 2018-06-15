<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace url;
use exceptions\UnknownResourceUriException;
use HttpMethod;
use transactions\CreateItemTransaction;
use transactions\DeleteItemTransaction;
use transactions\GetCategoriesTransaction;
use transactions\GetItemsTransaction;
use transactions\ITransaction;

/**
 * Class UrlMatcher, it takes a request and matchs for the right UrlPattern to get the
 * correct transaction.
 * This is a singleton class
 * @package url
 */
class UrlMatcher {
    /** @var UrlMatcher singleton pattern*/
    private static $instance = null;

    /**
     * Gets the singleton instance for this class
     * @return UrlMatcher
     */
    public static function getInstance() {
        if(static::$instance === null) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    /** @var [UrlPattern] */
    private $urls;

    /**
     * Given a method, an url and some request params, returns the right transaction
     * constructed if it matches some of the registered patterns. It throws an exception
     * if no url matches the pattern.
     * @param HttpMethod $httpMethod the http method to get the transaction for
     * @param string $url the url to check agains the pattern, it is expected to be relative to the host (should not include the host)
     * @param array $requestParams array with the parsed body and the get params (may be used by the transaction constructor)
     * @return null|ITransaction
     * @throws UnknownResourceUriException if the given url and method do not match any of the registered url patterns
     */
    public function match($httpMethod, $url, $requestParams) {
        /** @var UrlPattern $pattern */
        foreach($this->urls as $pattern) {
            $transaction = $pattern->match($httpMethod, $url, $requestParams);
            if($transaction !== null) {
                return $transaction;
            }
        }
        throw new UnknownResourceUriException(404, "The URL ('$url') and method provided do not lead to any valid resource.");
    }

    /**
     * UrlMatcher constructor, private because of singleton pattern.
     * Here we register all the url patterns we want to use.
     */
    private function __construct() {
        // As they are very few, we can prepare them here. For more complex
        // structure of urls maybe we will need to implement some kind of
        // loading from a file or whatever (pay attention to performance as
        // this will be loaded for every single request!)
        $tmCategories = new TransactionMap();
        $tmCategories->put(HttpMethod::GET(), GetCategoriesTransaction::class);
        $tmCategoryItems = new TransactionMap();
        $tmCategoryItems->put(HttpMethod::GET(), GetItemsTransaction::class);
        $tmItems = new TransactionMap();
        $tmItems->put(HttpMethod::POST(), CreateItemTransaction::class);
        $tmItem = new TransactionMap();
        $tmItem->put(HttpMethod::DELETE(), DeleteItemTransaction::class);
        //$tmItem->put(HttpMethod::PUT(), UpdateItemTransaction::class);
        $this->urls = [
            new UrlPattern('/item-types/:itemType<str>/categories/', $tmCategories),
            new UrlPattern('/categories/:categoryCode<str>/items/', $tmCategoryItems),
            new UrlPattern('/items/:itemId<int>', $tmItem),
            new UrlPattern('/items/', $tmItems),
        ];
    }
}