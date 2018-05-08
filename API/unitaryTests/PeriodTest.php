<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use PHPUnit\Framework\TestCase;
include_once "../code/gateways/IPeriodsGateway.php";
include_once "../code/Period.php";
include_once "../code/exceptions.php";
include_once "PeriodGatewayStub.php";

class PeriodTest extends TestCase {
    /**
     * Test the period constructor to make sure it is right
     */
    public function testPeriodConstruction() {
        $gwStub0 = new PeriodGatewayStub(0);
        $wd0 = WeekDays::MONDAY();
        $wdf = WeekDays::TUESDAY();
        $period = new Period(1, $wd0, 2,
            3, $wdf, 4, 5, 6,
            $gwStub0);
        $this->assertInstanceOf("Period", $period, "Constructor of period does not return the right class");
        $this->assertEquals(1, $period->getPeriodId(), "Error on the period id");
        $this->assertEquals($wd0->val(), $period->getStartDay()->val(), "Error on the period start day");
        $this->assertEquals(2, $period->getStartHour(), "Error on the period start hour");
        $this->assertEquals(3, $period->getStartMinutes(), "Error on the period start minutes");
        $this->assertEquals($wdf->val(), $period->getEndDay()->val(), "Error on the period end day");
        $this->assertEquals(4, $period->getEndHour(), "Error on the period end hour");
        $this->assertEquals(5, $period->getEndMinutes(), "Error on the period end minutes");
        $this->assertEquals(6, $period->getItemId(), "Error on the period item id");
    }

    /**
     * Test the period fails on setting a negative start hour
     * @expectedException InvalidHourException
     */
    public function testPeriodThrowsExceptionOnNegativeStartHour() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setStartHour(-1);
    }

    /**
     * Test the period fails on setting too big start hours
     * @expectedException InvalidHourException
     */
    public function testPeriodThrowsExceptionOnStartHourGreaterThan23() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setStartHour(24);
    }

    /**
     * Test the period fails on setting a negative end hour
     * @expectedException InvalidHourException
     */
    public function testPeriodThrowsExceptionOnNegativeEndHour() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setEndHour(-1);
    }

    /**
     * Test the period fails on setting too big end hours
     * @expectedException InvalidHourException
     */
    public function testPeriodThrowsExceptionOnEndHourGreaterThan23() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setEndHour(24);
    }

    /**
     * Test the period fails on setting a negative start minutes
     * @expectedException InvalidMinutesException
     */
    public function testPeriodThrowsExceptionOnNegativeStartMinutes() {
        $p = new Period(1, WeekDays::MONDAY(), 0, 1, WeekDays::MONDAY(),
            0,1,1, new PeriodGatewayStub(0));
        $p->setStartMinutes(-1);
    }

    /**
     * Test the period fails on setting too big start minutes
     * @expectedException InvalidMinutesException
     */
    public function testPeriodThrowsExceptionOnStartMinutesGreaterThan59() {
        $p = new Period(1, WeekDays::MONDAY(), 0, 2, WeekDays::MONDAY(),
            0,2,1, new PeriodGatewayStub(0));
        $p->setStartMinutes(60);
    }

    /**
     * Test the period fails on setting a negative end minutes
     * @expectedException InvalidMinutesException
     */
    public function testPeriodThrowsExceptionOnNegativeEndMinutes() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setEndMinutes(-1);
    }

    /**
     * Test the period fails on setting too big end minutes
     * @expectedException InvalidMinutesException
     */
    public function testPeriodThrowsExceptionOnEndMinutesGreaterThan59() {
        $p = new Period(1, WeekDays::MONDAY(), 1, 0, WeekDays::MONDAY(),
            1,0,1, new PeriodGatewayStub(0));
        $p->setEndMinutes(60);
    }
}
