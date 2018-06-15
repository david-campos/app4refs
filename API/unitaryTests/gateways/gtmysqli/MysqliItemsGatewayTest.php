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
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, 'en'],
            [2, 'name2', 'addr2', 'link2', null, 'icon2', 0, null, null, 'es']];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT item_id,`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,lang_code FROM items WHERE category_code=?'=>$items,
            'SELECT category_code FROM categories WHERE category_code=?'=>[['category_code']]],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $items = $gateway->getItemsForCategory("category");
        $this->assertCount(2, $items);
        $this->assertInstanceOf(Item::class, $items[0]);
        $this->assertInstanceOf(Item::class, $items[1]);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to get items for a category
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetItemsForCategoryThrowsExceptionOnExecuteFail() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, 'en'],
            [2, 'name2', 'addr2', 'link2', null, 'icon2', 0, null, null, 'es']];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT item_id,`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,lang_code FROM items WHERE category_code=?'=>$items,
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
            ['name', 'addr', 'link', null, 'icon', 1, null, null, 'category', 'en']];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,category_code,lang_code FROM items WHERE item_id=? LIMIT 1'=>$items],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $item = $gateway->findItem(1);
        $this->assertInstanceOf(Item::class, $item);
        $expected = new Item(1, $items[0][0], $items[0][1], $items[0][2], $items[0][3], $items[0][4],
            $items[0][5], $items[0][6], $items[0][7], $items[0][8], $items[0][9],$gateway);
        $this->assertEquals($expected, $item);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to find an item
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testFindItemThrowsExceptionOnExecuteFail() {
        $items = [
            [1, 'name', 'addr', 'link', null, 'icon', 1, null, null, 'en']];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,category_code,lang_code FROM items WHERE item_id=? LIMIT 1'=>$items],
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
            ['name', 'addr', 'link', null, 'icon', 1, null, null, 'category', 'en']];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,category_code,lang_code FROM items WHERE item_id=? LIMIT 1'=>$items,
            'INSERT INTO items(`name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,lang_code,category_code) VALUES (?,?,?,?,?,?,?,?,?,?)'=>[[]]],
            true, true
        );
        $gateway = new MysqliItemsGateway($mysqliMock);
        $item = $gateway->newItem('otherName', 'otherAddr', 'otherLink', 'id', 'otherIcon',
            0, 1.1, 2.2, 'otherCategory', 'es');
        $this->assertInstanceOf(Item::class, $item);
        // insert_id is always 1 for the mysqli mock
        $expected = new Item(1, $items[0][0], $items[0][1], $items[0][2], $items[0][3], $items[0][4],
            $items[0][5], $items[0][6], $items[0][7], $items[0][8], $items[0][9],$gateway);
        $this->assertEquals($expected, $item, 'The returned item should countain information from the database, rather than the passed one.');
    }

    /**
     * Test that we receive a DatabaseItemNotFoundException when no items matchs the given id to findItem
     * @expectedException exceptions\DatabaseItemNotFoundException
     */
    public function testFindItemThrowsExceptionOnFetchFail() {
        $items = [[1, 'name', 'addr', 'link', null, 'icon', 1, null, null, 'en']]; // Needed as mock binding uses this number of items to check
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT `name`,address,web_link,place_id,icon_uri,is_free,coord_lat,coord_lon,category_code,lang_code FROM items WHERE item_id=? LIMIT 1'=>$items],
            true, false // <- NOTICE THE false!
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
            "whatever", true, null, null, "whatever",
            null, $gateway));
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
            "whatever", true, null, null, "whatever",
            null, $gateway));
    }

    /**
     * Tests we can save successfully items
     */
    public function testSaveItemSuccessful() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
                'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,lang_code=?,category_code=? WHERE item_id=?' => [[]]],
            true, false);
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->saveItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, "whatever",
            null, $gateway));
    }

    /**
     * Tests we receive an internal database exception when we can't execute
     * @expectedException \exceptions\DatabaseInternalException
     */
    public function testSaveItemThrowsExceptionOnFailing() {
        $mysqliMock = $this->buildMockToExpectQueries(
            ['UPDATE items SET `name`=?,address=?,web_link=?,place_id=?,'.
            'icon_uri=?,is_free=?,coord_lat=?,coord_lon=?,lang_code=?,category_code=? WHERE item_id=?' => [[]]],
            false, false);
        $gateway = new MysqliItemsGateway($mysqliMock);
        $gateway->saveItem(new Item(
            1, "whatever", "whatever", null, null,
            "whatever", true, null, null, "whatever",
            null, $gateway));
    }


}
