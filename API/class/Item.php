<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class Item {
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
    /** @var string */
    private $categoryCode;
    /** @var string|null */
    private $languageCode;
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
     * @param string $categoryCode
     * @param string|null $languageCode
     * @param gateways\IItemsGateway $gateway
     */
    public function __construct($itemId, $name, $address, $webLink, $placeId, $iconUri, $isFree, $coordLat, $coordLon,
                                $categoryCode, $languageCode, $gateway) {
        $this->itemId = $itemId;
        $this->name = $name;
        $this->address = $address;
        $this->webLink = $webLink;
        $this->placeId = $placeId;
        $this->iconUri = $iconUri;
        $this->isFree = $isFree;
        $this->coordLat = $coordLat;
        $this->coordLon = $coordLon;
        $this->categoryCode = $categoryCode;
        $this->languageCode = $languageCode;
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
            IApiInterface::ITEM_NAME => $this->name,
            IApiInterface::ITEM_ADDR => $this->address,
            IApiInterface::ITEM_LINK => $this->webLink,
            IApiInterface::ITEM_PLACE => $this->placeId,
            IApiInterface::ITEM_ICON => $this->iconUri,
            IApiInterface::ITEM_IS_FREE => $this->isFree,
            IApiInterface::ITEM_COORD_LAT => $this->coordLat,
            IApiInterface::ITEM_COORD_LON => $this->coordLon,
            IApiInterface::ITEM_CATEGORY_CODE => $this->categoryCode,
            IApiInterface::ITEM_LANGUAGE_CODE => $this->languageCode
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
     * @return string
     */
    public function getCategoryCode(): string {
        return $this->categoryCode;
    }

    /**
     * @return null|string
     */
    public function getLanguageCode() {
        return $this->languageCode;
    }
}