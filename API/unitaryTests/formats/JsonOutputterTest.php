<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../testing_config.php');

use formats\IApiOutputter;
use formats\JsonOutputter;
use PHPUnit\Framework\TestCase;

class JsonOutputterTest extends TestCase {
    /** @var JsonOutputter */
    private $outputter;

    protected function setUp() {
        $this->outputter = new JsonOutputter();
    }

    /**
     * Tests some output with UTF8 to check the answer is correct
     * @runInSeparateProcess
     */
    public function testBasicOutput() {
        $array = [
            'text'=>'δῶς μοι πᾶ στῶ καὶ τὰν γᾶν κινάσω', // utf8 test too
            'author'=>'Archimedes',
            'born'=>['year'=>287, 'month'=>'unknown', 'day'=>'unknown'],
            'topics' => ['lever', 'stand', 'move'],
            'a-float' => 5.34e-8
        ];
        $jsonString =
            '{"text":"'.$array['text'].'",'.
            '"author":"'.$array['author'].'",'.
            '"born":{"year":'.$array['born']['year'].',"month":"'.$array['born']['month'].'","day":"'.$array['born']['day'].'"},'.
            '"topics":["'.$array['topics'][0].'","'.$array['topics'][1].'","'.$array['topics'][2].'"],'.
            '"a-float":5.34e-8}';
        $this->expectOutputString($jsonString);
        $this->outputter->output(IApiOutputter::HTTP_OK, $array);
        $this->assertEquals(IApiOutputter::HTTP_OK, http_response_code());
    }

    /**
     * Tests the output of an empty array produces a non-content status
     * @runInSeparateProcess
     */
    public function testNoContent() {
        $this->outputter->output(IApiOutputter::HTTP_OK, []);
        $this->assertEquals(IApiOutputter::HTTP_NO_CONTENT, http_response_code());
    }
}
