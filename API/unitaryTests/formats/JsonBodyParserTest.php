<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../testing_config.php');
use formats\JsonBodyParser;
use PHPUnit\Framework\TestCase;

class JsonBodyParserTest extends TestCase {
    /** @var  JsonBodyParser */
    protected $parser;

    protected function setUp() {
        $this->parser = new JsonBodyParser();
    }

    /**
     * Test we can parse empty arrays and empty objects
     */
    public function testParseEmpty() {
        $array = $this->parser->parse('{}');
        $this->assertEquals([], $array, 'Parse {} should return an empty array');
        $array = $this->parser->parse('[]');
        $this->assertEquals([], $array, 'Parse [] should return an empty array');
    }

    /**
     * Test that parser throws exception on incorrect JSON
     * @expectedException exceptions\RequestParsingException
     */
    public function testParseIncorrectJson() {
        $this->parser->parse('A fool thinks himself to be wise, but a wise man knows himself to be a fool.');
    }

    /**
     * Tests some correct json to be parsed correctly
     */
    public function testCorrectJsonParsing() {
        $expected = [
            'text'=>'A fool thinks himself to be wise, but a wise man knows himself to be a fool.',
            'author'=>'Shakespeare, William',
            'born'=>['year'=>1564, 'month'=>'April', 'day'=>23],
            'topics' => ['Fool', 'Wise', 'Knowledge'],
            'a-float' => 5.34e-8
        ];
        $jsonString =
            '{"text": "'.$expected['text'].'", '.
            '"author":"'.$expected['author'].'", '.
            '"born":{"year": '.$expected['born']['year'].', "month": "'.$expected['born']['month'].'", "day": '.$expected['born']['day'].'}, '.
            '"topics": ["'.$expected['topics'][0].'", "'.$expected['topics'][1].'", "'.$expected['topics'][2].'"], '.
            '"a-float": '.$expected['a-float'].'}';
        $array = $this->parser->parse($jsonString);
        $this->assertEquals($expected, $array, 'Parsing Shakespeare quotes is hard.');
    }
}
