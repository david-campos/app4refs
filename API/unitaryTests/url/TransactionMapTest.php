<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../testing_config.php');

use PHPUnit\Framework\TestCase;
use url\TransactionMap;

class TransactionMapTest extends TestCase {
    /** @var TransactionMap */
    private $map;

    protected function setUp() {
        $this->map = new TransactionMap();
    }

    /**
     * Tests the TransactionMap to be empty just after creation.
     */
    public function testEmptyOnCreation() {
        $this->assertEquals(0, $this->map->size());
    }

    /**
     * We add a couple of valid transactions to the map and test they are returned adequatelly
     */
    public function testAddingGettingValidTransactions() {
        $transactionMock0 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $transactionMock1 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $this->map->put(HttpMethod::GET(), $transactionMock0);
        $this->map->put(HttpMethod::DELETE(), $transactionMock1);
        $this->assertEquals(2, $this->map->size(), 'There should be two transactions added.');
        $this->assertEquals($transactionMock1, $this->map->get(HttpMethod::DELETE()));
        $this->assertEquals($transactionMock0, $this->map->get(HttpMethod::GET()));
    }

    /**
     * We want to test an exception is thrown when we try to add an invalid transaction
     * @expectedException exceptions\InvalidTransactionException
     */
    public function testAddingInvalidTransaction() {
        $noTransaction = self::class;
        $this->map->put(HttpMethod::GET(), $noTransaction);
    }

    /**
     * We check that when we put two transactions associated to the same method,
     * the second one overwrites the first one.
     */
    public function testOverwriteTransaction() {
        $transactionMock0 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $transactionMock1 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $this->map->put(HttpMethod::GET(), $transactionMock0);
        $this->map->put(HttpMethod::GET(), $transactionMock1);
        $this->assertEquals(1, $this->map->size(), 'There should be one transaction added.');
        $this->assertEquals($transactionMock1, $this->map->get(HttpMethod::GET()));
    }

    /**
     * Tests that, when an unset method is given, null is returned
     */
    public function testNullWhenGettingForUnsetMethod() {
        $this->assertNull($this->map->get(HttpMethod::GET()));
        $this->assertNull($this->map->get(HttpMethod::POST()));
        $this->assertNull($this->map->get(HttpMethod::DELETE()));
        $this->assertNull($this->map->get(HttpMethod::PUT()));
    }

    /**
     * We test we can delete the transaction associated to a method
     * from the map.
     */
    public function testDeleteTransaction() {
        $transactionMock0 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $transactionMock1 = $this->getMockBuilder(\transactions\ITransaction::class)->getMock();
        $this->map->put(HttpMethod::GET(), $transactionMock0);
        $this->map->put(HttpMethod::DELETE(), $transactionMock1);
        $this->assertEquals(2, $this->map->size(), 'There should be two transactions added.');
        $this->map->rem(HttpMethod::GET());
        $this->assertEquals(1, $this->map->size(), 'There should be only one transaction left.');
        $this->assertNull($this->map->get(HttpMethod::GET()));
        $this->assertEquals($transactionMock1, $this->map->get(HttpMethod::DELETE()), 'Remove has removed the other transaction too');
    }
}
