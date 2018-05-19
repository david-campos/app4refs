<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../../testing_config.php');
include dirname(__FILE__).'/MysqliStmtMock.php';
use gateways\gtmysqli\MysqliCategoriesGateway;
use PHPUnit\Framework\TestCase;

class MysqliCategoriesGatewayTest extends TestCase {

    /**
     * Test we can obtain the category name successfully.
     */
    public function testGetCategoryNameSuccessful() {
        $name = 'a_name';
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name` FROM categories WHERE category_code=? LIMIT 1'=>[[$name]]],
            true, true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $testName = $gateway->getCategoryName("category");
        $this->assertEquals($name, $testName);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query for get category name
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetCategoryNameThrowsExceptionOnExecuteFail() {
        $name = 'a_name';
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name` FROM categories WHERE category_code=? LIMIT 1'=>[[$name]]],
            false, // << NOTICE ME!
            true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $gateway->getCategoryName("category");
    }

    /**
     * Test that we receive a DatabaseCategoryNotFoundException when we can't fetch (no rows)
     * @expectedException exceptions\DatabaseCategoryNotFoundException
     */
    public function testGetCategoryNameThrowsExceptionOnFetchFail() {
        $name = 'a_name';
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name` FROM categories WHERE category_code=? LIMIT 1'=>[[$name]]],
            true,
            false // << NOTICE ME!
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $gateway->getCategoryName("category");
    }

    /**
     * Test we can obtain the category item type successfully.
     */
    public function testGetCategoryItemTypeSuccessful() {
        $type = 'leisure';
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `item_type` FROM categories WHERE category_code=? LIMIT 1'=>[[$type]]],
            true, true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $testItemType = $gateway->getCategoryItemType('category');
        $this->assertEquals(ItemType::FOR_STR($type), $testItemType);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query for get category item type
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetCategoryItemTypeThrowsExceptionOnExecuteFail() {
        $type = 'leisure';
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `item_type` FROM categories WHERE category_code=? LIMIT 1'=>[[$type]]],
            false, // << NOTICE ME!
            true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $gateway->getCategoryItemType("category");
    }

    /**
     * Test that we receive a DatabaseCategoryNotFoundException when we can't fetch (no rows)
     * @expectedException exceptions\DatabaseCategoryNotFoundException
     */
    public function testGetCategoryItemTypeThrowsExceptionOnFetchFail() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `item_type` FROM categories WHERE category_code=? LIMIT 1'=>[['leisure']]],
            true,
            false // << NOTICE ME!
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $gateway->getCategoryItemType("category");
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query for get category item type
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetCategoriesForItemTypeThrowsExceptionOnExecuteFail() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT category_code FROM categories WHERE item_type=?'=>[['a_code']]],
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
        $codes = ['code1','code2','code3'];
        $results = array_map(function($val){return [$val];}, $codes);
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT category_code FROM categories WHERE item_type=?'=>$results],
            true, true
        );
        $gateway = new MysqliCategoriesGateway($mysqliMock);
        $testResult = $gateway->getCategoriesForItemType(ItemType::INFO());
        $this->assertEquals($codes, $testResult);
    }

    private function buildMockToExpectQueries($queries, $canExecute, $canFetch) {
        $mysqli = $this->getMockBuilder(mysqli::class)
            ->setMethods(array('prepare'))
            ->getMock();
        $mysqli->expects($this->any())
            ->method('prepare')
            ->will($this->returnCallback(function ($query) use ($queries, $canExecute, $canFetch) {
                $this->assertTrue(isset($queries[$query]), 'The required query is not an expected one ('.$query.')');
                return $this->buildStmtMock($canExecute, $canFetch, $queries[$query]);
            }));
        return $mysqli;
    }

    private function buildStmtMock($canExecute, $canFetch, $resultValues) {
        $mockStmt = new MysqliStmtMock($this, $canExecute, $canFetch, $resultValues);
        return $mockStmt;
    }
}
