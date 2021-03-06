<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class Item {
    const ORDER_VALUES = ['first', 'second', 'third', 'rest'];

    /** @var int */
    private $itemId;
    /** @var string */
    private $name;
    /** @var string */
    private $address;
    /** @var string|null */
    private $webLink;
    /** @var string|null */
    private $placeId;
    /** @var string */
    private $iconUri;
    /** @var bool */
    private $isFree;
    /** @var double|null */
    private $coordLat;
    /** @var double|null */
    private $coordLon;
    /** @var string|null */
    private $phone;
    /** @var bool */
    private $callForAppointment;
    /** @var string */
    private $categoryCode;
    /** @var string[] */
    private $languageCodes;
    /** @var string Order preference, values 'first', 'second', 'third', 'rest'. */
    private $order;
    /** @var gateways\IItemsGateway */
    private $gateway;

    /**
     * Item constructor.
     * @param int $itemId
     * @param string $name
     * @param string $address
     * @param string|null $webLink
     * @param string|null $placeId
     * @param string $iconUri
     * @param bool $isFree
     * @param float|null $coordLat
     * @param float|null $coordLon
     * @param string|null $phone
     * @param bool $callForAppoint
     * @param string $categoryCode
     * @param string[] $languageCodes
     * @param string $order 'first', 'second', 'third', 'rest'
     * @param gateways\IItemsGateway $gateway
     */
    public function __construct($itemId, $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                                $phone, $callForAppoint, $categoryCode, $languageCodes, $order, $gateway) {
        $this->itemId = intval($itemId);
        $this->name = $name;
        $this->address = $address;
        $this->webLink = $webLink;
        $this->placeId = $placeId;
        $this->iconUri = $iconUri;
        $this->isFree = $isFree;
        $this->coordLat = $coordLat;
        $this->coordLon = $coordLon;
        $this->phone = $phone;
        $this->callForAppointment = $callForAppoint;
        $this->categoryCode = $categoryCode;
        $this->languageCodes = $languageCodes;
        $this->order = in_array($order, self::ORDER_VALUES) ? $order : 'rest';
        $this->gateway = $gateway;
    }


    /**
     * Maps the item to an array so it is printable to the user
     * @param bool $withOpeningHours if true, openin hours will be included in the array also. Notice this requires
     * a query to the database.
     * @return array
     */
    public function toMap($withOpeningHours=true) {
        $array = [
            IApiInterface::ITEM_ID => $this->itemId,
            IApiInterface::ITEM_ORDER_PREFERENCE => $this->order,
            IApiInterface::ITEM_NAME => $this->name,
            IApiInterface::ITEM_ADDR => $this->address,
            IApiInterface::ITEM_LINK => $this->webLink,
            IApiInterface::ITEM_PLACE => $this->placeId,
            IApiInterface::ITEM_ICON => $this->iconUri,
            IApiInterface::ITEM_IS_FREE => $this->isFree,
            IApiInterface::ITEM_COORD_LAT => $this->coordLat,
            IApiInterface::ITEM_COORD_LON => $this->coordLon,
            IApiInterface::ITEM_PHONE => $this->phone,
            IApiInterface::ITEM_CALL_FOR_APPOINTMENT => $this->callForAppointment,
            IApiInterface::ITEM_CATEGORY_CODE => $this->categoryCode,
            IApiInterface::ITEM_LANGUAGE_CODES => $this->languageCodes
        ];
        if($withOpeningHours) {
            $array[IApiInterface::ITEM_OPENING_HOURS] =
                array_map(function(Period $period){return $period->toMap();}, $this->getPeriods());
        }
        return $array;
    }

    public function saveItem() {
        $this->gateway->saveItem($this);
    }

    public function removeItem() {
        $this->gateway->removeItem($this);
    }

    /**
     * Gets the periods for this item.
     * @return Period[]
     */
    public function getPeriods() {
        return \gateways\GatewayFactory::getInstance()
            ->getPeriodsGateway()
            ->getPeriodsForItem($this->itemId);
    }

    /**
     * @return int
     */
    public function getItemId(): int {
        return $this->itemId;
    }

    /**
     * @return string
     */
    public function getName(): string {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getAddress(): string {
        return $this->address;
    }

    /**
     * @return null|string
     */
    public function getWebLink() {
        return $this->webLink;
    }

    /**
     * @return null|string
     */
    public function getPlaceId() {
        return $this->placeId;
    }

    /**
     * @return string
     */
    public function getIconUri(): string {
        return $this->iconUri;
    }

    /**
     * @return bool
     */
    public function isFree(): bool {
        return $this->isFree;
    }

    /**
     * @return float|null
     */
    public function getCoordLat() {
        return $this->coordLat;
    }

    /**
     * @return float|null
     */
    public function getCoordLon() {
        return $this->coordLon;
    }

    /**
     * @return null|string
     */
    public function getPhone() {
        return $this->phone;
    }

    /**
     * @return bool
     */
    public function shouldCallForAppointment(): bool {
        return $this->callForAppointment;
    }

    /**
     * @return string
     */
    public function getCategoryCode(): string {
        return $this->categoryCode;
    }

    /**
     * @return string[]
     */
    public function getLanguageCodes() {
        return $this->languageCodes;
    }

    /**
     * @return string
     */
    public function getOrder(): string {
        return $this->order;
    }

    /**
     * @param string $name
     */
    public function setName(string $name) {
        $this->name = $name;
    }

    /**
     * @param string $address
     */
    public function setAddress(string $address) {
        $this->address = $address;
    }

    /**
     * @param null|string $webLink
     */
    public function setWebLink($webLink) {
        $this->webLink = $webLink;
    }

    /**
     * @param null|string $placeId
     */
    public function setPlaceId($placeId) {
        $this->placeId = $placeId;
    }

    /**
     * @param string $iconUri
     */
    public function setIconUri(string $iconUri) {
        $this->iconUri = $iconUri;
    }

    /**
     * @param bool $isFree
     */
    public function setIsFree(bool $isFree) {
        $this->isFree = $isFree;
    }

    /**
     * @param float|null $coordLat
     */
    public function setCoordLat($coordLat) {
        $this->coordLat = $coordLat;
    }

    /**
     * @param float|null $coordLon
     */
    public function setCoordLon($coordLon) {
        $this->coordLon = $coordLon;
    }

    /**
     * @param null|string $phone
     */
    public function setPhone($phone) {
        $this->phone = $phone;
    }

    /**
     * @param bool $callForAppointment
     */
    public function setCallForAppointment(bool $callForAppointment) {
        $this->callForAppointment = $callForAppointment;
    }

    /**
     * @param string $categoryCode
     */
    public function setCategoryCode(string $categoryCode) {
        $this->categoryCode = $categoryCode;
    }

    /**
     * @param string $order Should be one of the values of self::ORDER_VALUES
     * @throws \exceptions\InvalidValueInBodyException if the value is not one of self::ORDER_VALUES
     */
    public function setOrder(string $order) {
        if(in_array($order, self::ORDER_VALUES)) {
            $this->order = $order;
        } else {
            throw new \exceptions\InvalidValueInBodyException(
                "Value '$order' found in body is not a valid value for '".
                IApiInterface::ITEM_ORDER_PREFERENCE.
                "'. Valid values are: ".implode(', ', self::ORDER_VALUES));
        }
    }

    /**
     * @param string[] $languageCodes
     */
    public function setLanguageCodes($languageCodes) {
        $this->languageCodes = $languageCodes;
    }
}