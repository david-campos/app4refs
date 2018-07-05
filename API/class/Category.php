<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

class Category {
    /** @var string */
    private $code;
    /** @var string */
    private $name;
    /** @var ItemType */
    private $itemType;
    /** @var string|null */
    private $link;

    /**
     * Category constructor.
     * @param string $code
     * @param string $name
     * @param ItemType $itemType
     * @param null|string $link
     */
    public function __construct($code, $name, ItemType $itemType, $link) {
        $this->code = $code;
        $this->name = $name;
        $this->itemType = $itemType;
        $this->link = $link;
    }

    /**
     * Maps the category to an associative array
     * @return mixed
     */
    public function toMap() {
        return [
            IApiInterface::CATEGORY_CODE => $this->code,
            IApiInterface::CATEGORY_NAME => $this->name,
            IApiInterface::CATEGORY_ITEM_TYPE => $this->itemType->val(),
            IApiInterface::CATEGORY_LINK => $this->link
        ];
    }

    /**
     * @return string
     */
    public function getName(): string {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name) {
        $this->name = $name;
    }

    /**
     * @return ItemType
     */
    public function getItemType(): ItemType {
        return $this->itemType;
    }

    /**
     * @param ItemType $itemType
     */
    public function setItemType(ItemType $itemType) {
        $this->itemType = $itemType;
    }

    /**
     * @return null|string
     */
    public function getLink() {
        return $this->link;
    }

    /**
     * @param null|string $link
     */
    public function setLink($link) {
        $this->link = $link;
    }

    /**
     * @return string
     */
    public function getCode(): string {
        return $this->code;
    }
}