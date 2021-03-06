<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use PHPUnit\Framework\TestCase;
require_once(dirname(__FILE__).'/testing_config.php');

class WeekDaysTest extends TestCase {
    // Simply check they are all different in value between them
    public function testDifferentDaysHaveDifferentValues() {
        for($i=0; $i < 7; $i++) {
            for($j=0; $j < 7; $j++) {
                // If it is the same day continue
                if($i === $j) {
                    continue;
                }

                $this->assertNotEquals(
                    $this->day($i)->val(),
                    $this->day($j)->val(),
                    "Two WeekDays with the same value.");
            }
        }
    }

    /**
     * Tests that WeekDay throws an exception when we try to create a weekday with
     * an invalid value.
     * @expectedException \exceptions\InvalidWeekDayStrException
     */
    public function testWeekDaysThrowsExceptionOnInvalidStr() {
        WeekDays::forStr('invalid str');
    }

    private function day(int $day): WeekDays {
        switch($day) {
            case 0:
                return WeekDays::MONDAY();
            case 1:
                return WeekDays::TUESDAY();
            case 2:
                return WeekDays::WEDNESDAY();
            case 3:
                return WeekDays::THURSDAY();
            case 4:
                return WeekDays::FRIDAY();
            case 5:
                return WeekDays::SATURDAY();
            default:
                return WeekDays::SUNDAY();
        }
    }
}
