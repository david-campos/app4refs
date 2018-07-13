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
    /** @var integer */
    private $pos;

    /**
     * Category constructor.
     * @param string $code
     * @param string $name
     * @param ItemType $itemType
     * @param null|string $link
     * @param int $pos
     */
    public function __construct($code, $name, ItemType $itemType, $link, $pos) {
        $this->code = $code;
        $this->name = $name;
        $this->itemType = $itemType;
        $this->link = $link;
        $this->pos = $pos;
    }

    /**
     * Maps the category to an associative array
     * @return mixed
     */
    public function toMap() {
        return [
            IApiInterface::CATEGORY_CODE => $this->code,
            IApiInterface::CATEGORY_POSITION => $this->pos,
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
     * @return int
     */
    public function getPos(): int {
        return $this->pos;
    }

    /**
     * @param int $pos
     */
    public function setPos(int $pos) {
        $this->pos = $pos;
    }

    /**
     * @return string
     */
    public function getCode(): string {
        return $this->code;
    }
}