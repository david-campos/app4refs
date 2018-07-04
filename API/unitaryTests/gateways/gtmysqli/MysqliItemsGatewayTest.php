<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../../testing_config.php');
use gateways\gtmysqli\MysqliItemsGateway;

class MysqliItemsGatewayTest extends \gateways\gtmysqli\MysqliGatewayTestBase {
    /**
     * Test we can obtain items for a category successfully.
     */
    public function testGetItemsForCategorySuccessful() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0, 'category'],
            [2, 'name2', 'addr2', 'link2', null, 'icon2', 0, null, null, '+34987654321', 1, 'category']];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE category_code=?'=>$items,
            'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']],
            'SELECT category_code FROM categories WHERE category_code=?'=>[['category_code']]],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $itemsRes = $gateway->getItemsForCategory("category");
        $this->assertCount(2, $itemsRes);
        $item0 = new Item($items[0][0], $items[0][1], $items[0][2], $items[0][3], $items[0][4], $items[0][5],
            $items[0][6], $items[0][7], $items[0][8], $items[0][9], $items[0][10], 'category', ['es', 'en'], $gateway);
        $this->assertEquals($item0, $itemsRes[0]);
        $item1 = new Item($items[1][0], $items[1][1], $items[1][2], $items[1][3], $items[1][4], $items[1][5],
            $items[1][6], $items[1][7], $items[1][8], $items[1][9], $items[1][10], 'category', ['es', 'en'], $gateway);
        $this->assertEquals($item1, $itemsRes[1]);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to get items for a category
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetItemsForCategoryThrowsExceptionOnExecuteFail() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0],
            [2, 'name2', 'addr2', 'link2', null, 'icon2', 0, null, null, null, 0]];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE category_code=?'=>$items,
                'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']],
                'SELECT category_code FROM categories WHERE category_code=?'=>[['category_code']]],
            false, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->getItemsForCategory("category");
    }

    /**
     * Test we can find an item successfully.
     */
    public function testFindItemSuccessful() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0, 'category']];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE item_id=? LIMIT 1'=>$items,
                'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']]],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $item = $gateway->findItem(1);
        $this->assertInstanceOf(Item::class, $item);
        $expected = new Item(1, $items[0][1], $items[0][2], $items[0][3], $items[0][4], $items[0][5],
            $items[0][6], $items[0][7], $items[0][8], $items[0][9], $items[0][10], $items[0][11], ['es','en'], $gateway);
        $this->assertEquals($expected, $item);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to find an item
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testFindItemThrowsExceptionOnExecuteFail() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0, 'category']];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE item_id=? LIMIT 1'=>$items,
                'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']]],
            false, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->findItem(1);
    }

    /**
     * Test we can create an item successfully and we obtain back an item with the data from the database
     * rather than the passed data
     */
    public function testCreateItemSuccessful() {
        // For finding, not to create
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0, 'category']];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE item_id=? LIMIT 1'=>$items,
                'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']],
                'INSERT INTO items(`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,phone,call_for_appointment,category_code) VALUES (?,?,?,?,?,?,?,?,?,?,?)'=>[[]],
                'INSERT INTO item_languages(item_id, lang_code) VALUES(?,?)'=>[[]]],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $item = $gateway->newItem('otherName', 'otherAddr', 'otherLink', 'id', 'otherIcon',
            0, 1.1, 2.2, 'otherPhone', 1, 'otherCategory', ['es','en']);
        $this->assertInstanceOf(Item::class, $item);
        // insert_id is always 1 for the mysqli mock
        $expected = new Item($items[0][0], $items[0][1], $items[0][2], $items[0][3], $items[0][4], $items[0][5],
            $items[0][6], $items[0][7], $items[0][8], $items[0][9], $items[0][10], $items[0][11], ['es','en'], $gateway);
        $this->assertEquals($expected, $item, 'The returned item should countain information from the database, rather than the passed one.');
    }

    /**
     * Test that we receive a DatabaseItemNotFoundException when no items matchs the given id to findItem
     * @expectedException exceptions\DatabaseItemNotFoundException
     */
    public function testFindItemThrowsExceptionOnFetchFail() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, null, 0, 'category']];
        $mysqliMock = $this->buildMockToExpectQueries(
            [MysqliItemsGateway::ITEM_SELECT . 'WHERE item_id=? LIMIT 1'=>$items,
                'SELECT lang_code FROM item_languages WHERE item_id = ?'=>[['es'],['en']]],
            true, false
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->findItem(1);
    }

    /**
     * Test we can delete items successfully.
     */
    public function testRemoveItemSuccessful() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['DELETE FROM items WHERE item_id=? LIMIT 1'=>[[]]],
            true, false
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->removeItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, null, false,
            "whatever", null, $gateway));
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to delete an item
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testRemoveItemThrowsExceptionOnExecuteFail() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['DELETE FROM items WHERE item_id=? LIMIT 1'=>[[]]],
            false, false
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->removeItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, null, false, "whatever",
            null, $gateway));
    }

    /**
     * Tests we can save successfully items
     */
    public function testSaveItemSuccessful() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
                'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,phone=?,call_for_appointment=?,'.
                'category_code=? WHERE item_id=?' => [[]],
                'DELETE FROM item_languages WHERE item_id=?'=>[[]],
                'INSERT INTO item_languages(item_id, lang_code) VALUES(?,?)' =>[[]]],
            true, false);
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->saveItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, null, false,
            "whatever", [], $gateway));
    }

    /**
     * Tests we receive an internal database exception when we can't execute
     * @expectedException \exceptions\DatabaseInternalException
     */
    public function testSaveItemThrowsExceptionOnFailing() {
        $mysqliMock = $this->buildMockToExpectQueries(
        ['UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
        'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,phone=?,call_for_appointment=?,'.
        'category_code=? WHERE item_id=?' => [[]],
            'DELETE FROM item_languages WHERE item_id=?'=>[[]],
            'INSERT INTO item_languages(item_id, lang_code) VALUES(?,?)' =>[[]]],
        false, false);
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->saveItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, null, false,
            "whatever", [], $gateway));
    }
}
