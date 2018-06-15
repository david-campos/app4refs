<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

require_once(dirname(__FILE__).'/../../testing_config.php');

use gateways\gtmysqli\MysqliPeriodsGateway;

class MysqliPeriodsGatewayTest extends \gateways\gtmysqli\MysqliGatewayTestBase {
    /**
     * Test we can obtain the opening hours for an item successfully.
     */
    public function testGetPeriodsForItemSuccessful() {
        $periods = [
            [1, 'mon', 16, 5, 'tue', 20, 0],
            [2, 'mon', 16, 5, 'tue', 20, 0]
            ];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT period_id,start_day,start_hour,start_minutes,end_day,end_hour,end_minutes FROM opening_hours WHERE item_id=?'=>$periods],
            true, true
        );
        $gateway = new MysqliPeriodsGateway($mysqliMock);
        $periodsRes = $gateway->getPeriodsForItem(1);
        $expected1 = new Period($periods[0][0], WeekDays::forStr($periods[0][1]), $periods[0][2], $periods[0][3],
            \WeekDays::forStr($periods[0][4]), $periods[0][5], $periods[0][6], 1, $gateway);
        $expected2 = new Period($periods[1][0], WeekDays::forStr($periods[1][1]), $periods[1][2], $periods[1][3],
            \WeekDays::forStr($periods[1][4]), $periods[1][5], $periods[1][6], 1, $gateway);
        $this->assertCount(2, $periodsRes);
        $this->assertEquals($expected1, $periodsRes[0]);
        $this->assertEquals($expected2, $periodsRes[1]);
    }

    /**
     * Test that we receive a DatabaseInternalException when we can't execute the query to get the opening hours of an item
     * @expectedException exceptions\DatabaseInternalException
     */
    public function testGetPeriodsForItemThrowsExceptionOnExecuteFail() {
        $periods = [
            [1, 'mon', 16, 5, 'tue', 20, 0],
            [2, 'mon', 16, 5, 'tue', 20, 0]
        ];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT period_id,start_day,start_hour,start_minutes,end_day,end_hour,end_minutes FROM opening_hours WHERE item_id=?'=>$periods],
            false, true
        );
        $gateway = new MysqliPeriodsGateway($mysqliMock);
        $gateway->getPeriodsForItem(1);
    }

    /**
     * Test we can create a period successfully and we obtain back a period with the data from the database
     * rather than the passed data
     */
    public function testCreatePeriodSuccessful() {
        // For finding, not to create
        $periods = [
            ['mon', 16, 5, 'tue', 20, 0, 1]
        ];
        $mysqliMock = $this->buildMockToExpectQueries(
            ['SELECT start_day,start_hour,start_minutes,end_day,end_hour,end_minutes,item_id FROM opening_hours WHERE period_id=?'=>$periods,
                'INSERT INTO opening_hours(start_day,start_hour,start_minute,end_day,end_hour,end_minutes,item_id) VALUES (?,?,?,?,?,?,?)'=>[[]]],
            true, true
        );
        $gateway = new MysqliPeriodsGateway($mysqliMock);
        $period = $gateway->newPeriod(\WeekDays::SUNDAY(), 0,2, \WeekDays::SUNDAY(), 2, 6, 2);
        $this->assertInstanceOf(Period::class, $period);
        // insert_id is always 1 for the mysqli mock
        $expected = new Period(1, \WeekDays::forStr($periods[0][0]), $periods[0][1], $periods[0][2],
            \WeekDays::forStr($periods[0][3]), $periods[0][4], $periods[0][5], $periods[0][6], $gateway);
        $this->assertEquals($expected, $period, 'The returned period should countain information from the database, rather than the passed one.');
    }
}
