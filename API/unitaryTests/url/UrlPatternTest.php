<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../testing_config.php');

use url\UrlPattern;
use PHPUnit\Framework\TestCase;

class UrlPatternTest extends TestCase {
    /** @var \url\TransactionMap */
    private $mockTransactionMap;

    const EMPTY_REQUEST_PARAMS = ['get'=>[],'body'=>[]];

    protected function setUp() {
        $this->mockTransactionMap = $this->getMockBuilder(\url\TransactionMap::class)
            ->setMethods(['put','rem','get','size','managesMethod'])
            ->getMock();
        $this->mockTransactionMap
            ->expects($this->any())
            ->method('get')
            ->willReturn(FakeTransaction::class);
        $this->mockTransactionMap
            ->expects($this->any())
            ->method('managesMethod')
            ->willReturn(true);
    }

    /**
     * Test construction and final and initial bars to be irrelevant
     */
    public function testFinalAndInitialBarsToBeIrrelevant() {
        $regexp = '/^\/?foo\/bar\/?$/';
        $urlPattern = new UrlPattern('/foo/bar', $this->mockTransactionMap);
        $this->assertEquals($regexp, $urlPattern->getRegExp());
        $urlPattern = new UrlPattern('foo/bar/', $this->mockTransactionMap);
        $this->assertEquals($regexp, $urlPattern->getRegExp());
        $urlPattern = new UrlPattern('///foo/bar', $this->mockTransactionMap);
        $this->assertEquals($regexp, $urlPattern->getRegExp());
        $urlPattern = new UrlPattern('foo/bar///', $this->mockTransactionMap);
        $this->assertEquals($regexp, $urlPattern->getRegExp());
        $urlPattern = new UrlPattern('///foo/bar///', $this->mockTransactionMap);
        $this->assertEquals($regexp, $urlPattern->getRegExp());
    }

    /**
     * Test all the possible types of params to generate the right regular expression
     */
    public function testRegExpConstructionParamsWithAllTypes() {
        foreach(UrlPattern::TYPES as $type=>$typeExpr) {
            $urlPattern = new UrlPattern('/foo/:id<'.$type.'>', $this->mockTransactionMap);
            $this->assertEquals('/^\/?foo\/(' . $typeExpr . ')\/?$/', $urlPattern->getRegExp());
        }
    }

    /**
     * Test a right reg exp construction with a param with sufix
     */
    public function testRegExpConstructionParamWithSufix() {
        $urlPattern = new UrlPattern('/foo/:id<int>/bar', $this->mockTransactionMap);
        $this->assertEquals('/^\/?foo\/([0-9]+)\/bar\/?$/', $urlPattern->getRegExp());
    }

    /**
     * Test the regular expression construction when there are more than one params
     */
    public function testRegExpConstructionSeveralParams() {
        $urlPattern = new UrlPattern('/foo/:id1<int>/bar/:id2<hex>', $this->mockTransactionMap);
        $this->assertEquals('/^\/?foo\/([0-9]+)\/bar\/([0-9A-Fa-f]+)\/?$/', $urlPattern->getRegExp());
    }

    /**
     * Test static prefix when no params are given
     */
    public function testStaticPrefixWhenNoParams() {
        $urlPattern = new UrlPattern('/foo/bar', $this->mockTransactionMap);
        $this->assertEquals('foo/bar', $urlPattern->getStaticPrefix());
    }

    /**
     * Test static prefix when one param is given
     */
    public function testStaticPrefixWithOneParam() {
        $urlPattern = new UrlPattern('/foo/:id<str>/bar', $this->mockTransactionMap);
        $this->assertEquals('foo/', $urlPattern->getStaticPrefix());
    }

    /**
     * Test static prefix when several params are given
     */
    public function testStaticPrefixWhenSeveralParams() {
        $urlPattern = new UrlPattern('/foo/:id<str>/bar/:je<int>', $this->mockTransactionMap);
        $this->assertEquals('foo/', $urlPattern->getStaticPrefix());
    }

    /**
     * Tests all kind of param names are accepted and saved correctly
     */
    public function testParamNames() {
        $names = ['a', 'id', 'id0', '0Level'];
        foreach($names as $name) {
            $urlPattern = new UrlPattern('/foo/:' . $name . '<int>/bar', $this->mockTransactionMap);
            $this->assertEquals('foo/', $urlPattern->getStaticPrefix());
            $this->assertEquals('/^\/?foo\/([0-9]+)\/bar\/?$/', $urlPattern->getRegExp());
            $this->assertCount(1, $urlPattern->getParamNames());
            $this->assertEquals($name, $urlPattern->getParamNames()[0]);
        }
    }

    /**
     * Tests we receive an exception when a param name is not valid
     * @expectedException \exceptions\InvalidUrlPatternException
     */
    public function testInvalidParamNameThrowsException() {
        new UrlPattern('/foo/:a-param/', $this->mockTransactionMap);
    }

    /**
     * Tests we receive an exception when introducing parameters with no type
     * @expectedException \exceptions\InvalidUrlPatternException
     */
    public function testParamWithoutTypeThrowsException() {
        new UrlPattern('/foo/:notype/', $this->mockTransactionMap);
    }

    /**
     * Tests it matches urls with no params correctly
     */
    public function testNoParamMatching() {
        $urlPattern = new UrlPattern('/foo/bar', $this->mockTransactionMap);
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/bar/', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/foo/', static::EMPTY_REQUEST_PARAMS));
    }

    /**
     * Tests that int param type matchs the correct values and rejects the invalid ones
     */
    public function testIntParamMatching() {
        $urlPattern = new UrlPattern('/foo/:id<int>/a', $this->mockTransactionMap);
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/9/a', static::EMPTY_REQUEST_PARAMS));

        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/10/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/0/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/fa/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/+1/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/-3/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo//a', static::EMPTY_REQUEST_PARAMS));
    }

    /**
     * Tests that str param type matchs the correct values and rejects the invalid ones
     */
    public function testStrParamMatching() {
        $urlPattern = new UrlPattern('/foo/:id<str>/a', $this->mockTransactionMap);
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/patata/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/BarBar/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/bar_bar/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/bar-bar/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/a3/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'foo/165646/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/+3/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/<script>/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo//a', static::EMPTY_REQUEST_PARAMS));
    }

    /**
     * Tests that hex param type matchs the correct values and rejects the invalid ones
     */
    public function testHexParamMatching() {
        $urlPattern = new UrlPattern('/bar/:id<hex>/a', $this->mockTransactionMap);
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/567890/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/ffffff/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/1a2b3c4d/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/e/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/ABCDEF/a', static::EMPTY_REQUEST_PARAMS));

        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/steve/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/_F0/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/#F0/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/+3/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/<script>/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar//a', static::EMPTY_REQUEST_PARAMS));

    }

    /**
     * Tests that flt param type matchs the correct values and rejects the invalid ones
     */
    public function testFltParamMatching() {
        $urlPattern = new UrlPattern('/bar/:id<flt>/a', $this->mockTransactionMap);
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/0.1/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/+1.2/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/-2.3/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertInstanceOf(
            FakeTransaction::class,
            $urlPattern->match(HttpMethod::GET(), 'bar/3/a', static::EMPTY_REQUEST_PARAMS));

        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/./a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/.2/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/-.2/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/+.2/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/2./a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/steve/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/;)/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar/<script>/a', static::EMPTY_REQUEST_PARAMS));
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'bar//a', static::EMPTY_REQUEST_PARAMS));
    }

    /**
     * Tests the UrlPattern saves correctly the params given in the url
     */
    public function testParamSaving() {
        $urlPattern = new UrlPattern('/bar/:int<int>/:flt<flt>/:str<str>/:hex<hex>/a', $this->mockTransactionMap);
        $get = [
            'int' => '59',
            'flt' => '+1.5',
            'str' => 'steve_maquina-top',
            'hex' => '0f0f0f'
        ];
        $url = 'bar/'.$get['int'].'/'.$get['flt'].'/'.$get['str'].'/'.$get['hex'].'/a';
        $match = $urlPattern->match(HttpMethod::GET(), $url, static::EMPTY_REQUEST_PARAMS);
        $result = $match->getResult();
        $this->assertEquals($get, $result['get']);
    }

    /**
     * Tests the url matchs exacts and fails on repetitions
     */
    public function testRepetitionFails() {
        $urlPattern = new UrlPattern('/foo/bar', $this->mockTransactionMap);
        $this->assertNull(
            $urlPattern->match(HttpMethod::GET(), 'foo/barfoo/bar', static::EMPTY_REQUEST_PARAMS));
    }
}
