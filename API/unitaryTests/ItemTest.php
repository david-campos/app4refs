<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

use PHPUnit\Framework\TestCase;

class ItemTest extends TestCase {
    private $fakeGateway;

    protected function setUp() {
        $this->fakeGateway = $this->getMockBuilder(\gateways\IItemsGateway::class)
            ->setMethods(['saveItem','removeItem','findItem','getItemsForCategory','newItem'])->getMock();
    }

    /**
     * We construct an item with realistic, valid values and check it preserves its data
     */
    public function testItemConstruction() {
        $data = [
            'id'=>1,
            'name'=>'Solidarity4All',
            'addr'=>'Akadimias 74, Athens 106 78, Greece',
            'web'=>'www.solidarity4all.gr',
            'plId'=>'ChIJHY6tsDC9oRQR4Jz2kwclWrQ',
            'ico'=>'solidarity4all.png',
            'free'=>true,
            'lat'=>37.983587,
            'lon'=>23.732831900000065,
            'phone'=>'+34988765432',
            'cfa'=>true,
            'cat'=>'cat_food',
            'lg'=>'en'
        ];
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'],$data['free'],
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],
            $data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals($data['id'], $item->getItemId());
        $this->assertEquals($data['name'], $item->getName());
        $this->assertEquals($data['addr'], $item->getAddress());
        $this->assertEquals($data['web'], $item->getWebLink());
        $this->assertEquals($data['plId'], $item->getPlaceId());
        $this->assertEquals($data['ico'], $item->getIconUri());
        $this->assertEquals($data['free'], $item->isFree());
        $this->assertEquals($data['lat'], $item->getCoordLat());
        $this->assertEquals($data['lon'], $item->getCoordLon());
        $this->assertEquals($data['phone'], $item->getPhone());
        $this->assertEquals($data['cfa'], $item->shouldCallForAppointment());
        $this->assertEquals($data['cat'], $item->getCategoryCode());
        $this->assertEquals($data['lg'], $item->getLanguageCodes());
    }

    /**
     * Tests that we can specify 0 and 1 instead of true or false in the construction of the
     * item
     */
    public function testIsFreeAcceptsNumericValues() {
        $data = [
            'id'=>1,
            'name'=>'Solidarity4All',
            'addr'=>'Akadimias 74, Athens 106 78, Greece',
            'web'=>'www.solidarity4all.gr',
            'plId'=>'ChIJHY6tsDC9oRQR4Jz2kwclWrQ',
            'ico'=>'solidarity4all.png',
            'lat'=>37.983587,
            'lon'=>23.732831900000065,
            'phone'=>'+34988765432',
            'cfa'=>true,
            'cat'=>'cat_food',
            'lg'=>'en'
        ];
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'], 1, // notice
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],$data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals(true, $item->isFree());
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'], 0, // notice
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],$data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals(false, $item->isFree());
    }

    /**
     * We check that the item web link can be set to null on construction
     */
    public function testWebLinkCanBeNull() {
        $data = [
            'id' => 1,
            'name' => 'Solidarity4All',
            'addr' => 'Akadimias 74, Athens 106 78, Greece',
            'web' => null, // NOTICE! <--
            'plId' => 'ChIJHY6tsDC9oRQR4Jz2kwclWrQ',
            'ico' => 'solidarity4all.png',
            'free' => true,
            'lat' => 37.983587,
            'lon' => 23.732831900000065,
            'phone'=>'+34988765432',
            'cfa'=>true,
            'cat' => 'cat_food',
            'lg' => 'en'
        ];
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'],$data['free'],
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],
            $data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals($data['id'], $item->getItemId());
        $this->assertEquals($data['name'], $item->getName());
        $this->assertEquals($data['addr'], $item->getAddress());
        $this->assertEquals($data['web'], $item->getWebLink());
        $this->assertEquals($data['plId'], $item->getPlaceId());
        $this->assertEquals($data['ico'], $item->getIconUri());
        $this->assertEquals($data['free'], $item->isFree());
        $this->assertEquals($data['lat'], $item->getCoordLat());
        $this->assertEquals($data['lon'], $item->getCoordLon());
        $this->assertEquals($data['phone'], $item->getPhone());
        $this->assertEquals($data['cfa'], $item->shouldCallForAppointment());
        $this->assertEquals($data['cat'], $item->getCategoryCode());
        $this->assertEquals($data['lg'], $item->getLanguageCodes());
    }

    /**
     * We check that the place Id can be null on construction
     */
    public function testPlaceIdCanBeNull() {
        $data = [
            'id'=>1,
            'name'=>'Solidarity4All',
            'addr'=>'Akadimias 74, Athens 106 78, Greece',
            'web'=>'www.solidarity4all.gr',
            'plId'=>null, //NOTICE! <--
            'ico'=>'solidarity4all.png',
            'free'=>true,
            'lat'=>37.983587,
            'lon'=>23.732831900000065,
            'phone'=>'+34988765432',
            'cfa'=>true,
            'cat'=>'cat_food',
            'lg'=>'en'
        ];
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'],$data['free'],
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],
            $data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals($data['id'], $item->getItemId());
        $this->assertEquals($data['name'], $item->getName());
        $this->assertEquals($data['addr'], $item->getAddress());
        $this->assertEquals($data['web'], $item->getWebLink());
        $this->assertEquals($data['plId'], $item->getPlaceId());
        $this->assertEquals($data['ico'], $item->getIconUri());
        $this->assertEquals($data['free'], $item->isFree());
        $this->assertEquals($data['lat'], $item->getCoordLat());
        $this->assertEquals($data['lon'], $item->getCoordLon());
        $this->assertEquals($data['phone'], $item->getPhone());
        $this->assertEquals($data['cfa'], $item->shouldCallForAppointment());
        $this->assertEquals($data['cat'], $item->getCategoryCode());
        $this->assertEquals($data['lg'], $item->getLanguageCodes());
    }

    /**
     * We test we can set the coordinates to null on creation
     */
    public function testCoordsCanBeNull() {
        $data = [
            'id'=>1,
            'name'=>'Solidarity4All',
            'addr'=>'Akadimias 74, Athens 106 78, Greece',
            'web'=>'www.solidarity4all.gr',
            'plId'=>'ChIJHY6tsDC9oRQR4Jz2kwclWrQ',
            'ico'=>'solidarity4all.png',
            'free'=>true,
            'lat'=>null,
            'lon'=>null,
            'phone'=>'+34988765432',
            'cfa'=>true,
            'cat'=>'cat_food',
            'lg'=>'en'
        ];
        $item = new Item($data['id'], $data['name'], $data['addr'],
            $data['web'],$data['plId'],$data['ico'],$data['free'],
            $data['lat'],$data['lon'],$data['phone'],$data['cfa'],
            $data['cat'],$data['lg'], $this->fakeGateway);
        $this->assertEquals($data['id'], $item->getItemId());
        $this->assertEquals($data['name'], $item->getName());
        $this->assertEquals($data['addr'], $item->getAddress());
        $this->assertEquals($data['web'], $item->getWebLink());
        $this->assertEquals($data['plId'], $item->getPlaceId());
        $this->assertEquals($data['ico'], $item->getIconUri());
        $this->assertEquals($data['free'], $item->isFree());
        $this->assertEquals($data['lat'], $item->getCoordLat());
        $this->assertEquals($data['lon'], $item->getCoordLon());
        $this->assertEquals($data['phone'], $item->getPhone());
        $this->assertEquals($data['cfa'], $item->shouldCallForAppointment());
        $this->assertEquals($data['cat'], $item->getCategoryCode());
        $this->assertEquals($data['lg'], $item->getLanguageCodes());
    }
}
