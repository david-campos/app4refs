-- App4Refs: Creation script for the database
--   This script should create in the database all the tables required
--   for the back-end of the application to work.
-- 
-- Author: David Campos R. <david.campos.r96@gmail.com>
 
 /* Categories
  *   This table will store information about the categories
  *   the items can belong to.
  */
 CREATE TABLE IF NOT EXISTS `categories` (
	`category_code` CHAR(10) NOT NULL,
	`name`          VARCHAR(100) NOT NULL,
    `link`          VARCHAR(255) DEFAULT NULL, -- NULLABLE
	`item_type`     ENUM(
		'service', 'leisure', 'link', 'help', 'info')
		NOT NULL,
    `position`      INT(2) UNSIGNED NOT NULL,
    
    INDEX `cat_position_idx` (`position`), -- To speed up ordering
    
	PRIMARY KEY (`category_code`)
 )
 COMMENT "Categories for the items displayed in the application";
 
 /* Languages
  *	  Languages in which the items are offered to the people
  */
 CREATE TABLE IF NOT EXISTS `languages` (
	`lang_code` CHAR(2) NOT NULL,
	
	PRIMARY KEY(`lang_code`)
 );
 
 /* Items
  *   This table will store information about the
  *   diferent items which appear in the lists of
  *   the application: Services, Leisure, Links, etc.
  */
CREATE TABLE IF NOT EXISTS `items` (
    `item_id`  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`     VARCHAR(255) NOT NULL,
	`address`  VARCHAR(255), -- NULLABLE
	`web_link` VARCHAR(255), -- NULLABLE
	`place_id` VARCHAR(255), -- NULLABLE
	`icon_uri` VARCHAR(255) NOT NULL,
	`is_free`  TINYINT(1) NOT NULL,
	`coord_lat` DECIMAL(8, 6), -- NULLABLE
	`coord_lon` DECIMAL(9, 6), -- NULLABLE
    `phone`    VARCHAR(100), -- NULLABLE
    `call_for_appointment` TINYINT(1) NOT NULL,
    `order_preference` ENUM('first', 'second', 'third', 'rest') NOT NULL DEFAULT 'rest',
	
	`category_code` CHAR(10) NOT NULL,
    
	FOREIGN KEY (`category_code`) REFERENCES `categories`(`category_code`)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
    
    INDEX `item_order_idx` (`order_preference`), -- To speed up ordering
        
    CONSTRAINT CHK_cfap CHECK (NOT (`call_for_appointment` AND `phone` IS NULL)),
    CONSTRAINT CHK_addr CHECK (NOT (`address` IS NULL AND NOT `call_for_appointment`)),
	
	PRIMARY KEY(`item_id`)
)
COMMENT "Items to display in the application lists (services, leisure, links...)";

/**
 * Item languages
 *  This table will store the relation between items and
 *  languages, as one language can be associated to several
 *  items and an item can be associated to several languages.
 */
CREATE TABLE IF NOT EXISTS `item_languages` (
    `item_id`   INT UNSIGNED,
	`lang_code` CHAR(2),
    
    FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY (`lang_code`) REFERENCES `languages`(`lang_code`)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
    
    PRIMARY KEY(`item_id`, `lang_code`)
)
COMMENT "Relationship between items and the languages they are offered in";

/* Opening hours
 *   This table will store information about the opening
 *   hours of the items. Each entry is a new opening
 *   period, i.e. from sunday 17:30 till monday 01:30.
 */
 CREATE TABLE IF NOT EXISTS `opening_hours` (
	`period_id`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`start_day`     ENUM(
		'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
		NOT NULL,
	`end_day`       ENUM(
		'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
		NOT NULL,
	`start_hour`    TINYINT UNSIGNED NOT NULL,
	`start_minutes` TINYINT UNSIGNED NOT NULL,
	`end_hour`      TINYINT UNSIGNED NOT NULL,
	`end_minutes`   TINYINT UNSIGNED NOT NULL,
	
	`item_id`       INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (`period_id`),
    
    CONSTRAINT CHK_shour CHECK (`start_hour` < 24),
    CONSTRAINT CHK_ehour CHECK (`end_hour` < 24),
    CONSTRAINT CHK_smins CHECK (`start_minutes` < 60),
    CONSTRAINT CHK_emins CHECK (`end_minutes` < 60),
	
	FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
 )
 COMMENT "Opening hours periods for the items";