<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

namespace gateways\gtmysqli;

include_once dirname(__FILE__).'/MysqliStmtMock.php';

use mysqli;
use MysqliStmtMock;
use PHPUnit\Framework\TestCase;

class MysqliGatewayTestBase extends TestCase{
    /**
     * Gets a mock for mysqli :P
     * @param $queries
     * @param $canExecute
     * @param $canFetch
     * @return mysqli
     */
    protected function buildMockToExpectQueries($queries, $canExecute, $canFetch) {
        $mysqli = $this->getMockBuilder(mysqli::class)
            ->setMethods(array('prepare'))
            ->getMock();
        $mysqli->expects($this->any())
            ->method('prepare')
            ->will($this->returnCallback(function ($query) use ($queries, $canExecute, $canFetch) {
                $this->assertTrue(isset($queries[$query]), 'The required query is not an expected one ('.$query.')');
                return $this->buildStmtMock($canExecute, $canFetch, $queries[$query]);
            }));
        $mysqli->insert_id = 1;
        return $mysqli;
    }

    private function buildStmtMock($canExecute, $canFetch, $resultValues) {
        $mockStmt = new MysqliStmtMock($this, $canExecute, $canFetch, $resultValues);
        return $mockStmt;
    }
}