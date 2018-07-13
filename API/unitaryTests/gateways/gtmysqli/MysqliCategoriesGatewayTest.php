<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../../testing_config.php');
use gateways\gtmysqli\MysqliCategoriesGateway;

class MysqliCategoriesGatewayTest extends \gateways\gtmysqli\MysqliGatewayTestBase  {
    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query for get category item type
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetCategoriesForItemTypeThrowsExceptionOnExecuteFail() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT category_code,`name`,item_type,link,`position` FROM categories WHERE item_type=? ORDER BY `position`'=>[['a_code']]],
            false, // << NOTICE ME!
            true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $gateway->getCategoriesForItemType(ItemType::INFO());
    }

    /**
     * Test that we can get the categories for a given item type successfully
     */
    public function testGetCategoriesForItemTypeSuccesful() {
        $results = [
            ['code1','Code1Category','link',null,1],
            ['code2','Code2Category','help','https://ihavealink.com/',2],
            ['code3','Code3Category','leisure',null,3]];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT category_code,`name`,item_type,link,`position` FROM categories WHERE item_type=? ORDER BY `position`'=>$results],
            true, true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $testResult = $gateway->getCategoriesForItemType(ItemType::INFO());
        $expectedResult = [];
        foreach($results as $expected) {
            $expectedResult[] = new Category($expected[0], $expected[1], \ItemType::FOR_STR($expected[2]), $expected[3], $expected[4]);
        }
        $this->assertEquals($expectedResult, $testResult);
    }
}
