<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use PHPUnit\Framework\TestCase;
include_once "../code/FakeEnum.php";
include_once "../code/ItemType.php";

class ItemTypeTest extends TestCase {
    // Simply check they are all different in value between them
    public function testDifferentDaysHaveDifferentValues() {
        for($i=0; $i < 5; $i++) {
            for($j=0; $j < 5; $j++) {
                // If it is the same idx continue
                if($i === $j) {
                    continue;
                }

                $this->assertNotEquals(
                    $this->itemType($i)->val(),
                    $this->itemType($j)->val(),
                    "Two ItemType with the same value");
            }
        }
    }

    private function itemType(int $idx): ItemType {
        switch($idx) {
            case 0:
                return ItemType::HELP();
            case 1:
                return ItemType::INFO();
            case 2:
                return ItemType::LEISURE();
            case 3:
                return ItemType::LINK();
            default:
                return ItemType::SERVICE();
        }
    }
}
