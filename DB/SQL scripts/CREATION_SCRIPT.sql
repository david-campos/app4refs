-- App4Refs: Creation script for the database
--   This script should create in the database all the tables required
--   for the back-end of the application to work.
-- 
-- Author: David Campos R. <david.campos.r96@gmail.com>
--
-- Signaled errors sql states:
--   45000: An inserted or updated category has a non-null link value and associated items
--   45001: An inserted or updated item is associated to a category with a non-null link
--   45002: An inserted or updated period has some invalid hour value
--   45003: An inserted or updated period has some invalid minutes value
--   45004: An inserted or updated item has call_for_appointment as TRUE but a NULL phone
--   45005: An inserted or updated item has a NULL address but call_for_appointment is false
 
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
    
    /**
     * We cannot use CHECK cause it is ignored (triggers are used instead)
     */
	
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
    
    /**
     * We cannot use CHECK cause it is ignored (triggers are used instead)
     */
	
	FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)
COMMENT "Opening hours periods for the items";

/* Users
 *   This table will store information about the users
 *   for the control panel, which can modify the items
 *   in the database. Passwords should be saved hashed
 *   and salts added to avoid attacks by entropy analysis.
 */
CREATE TABLE IF NOT EXISTS `users` (
    `username` VARCHAR(80) NOT NULL,
    `password` CHAR(128) NOT NULL,
    `salt` CHAR(128) NOT NULL,
    
    PRIMARY KEY (`username`)
)
COMMENT "Users stored in the database, they work by now as OAuth clients would do, more or less";

/* Tokens
 *   Thes table stores the tokens which give temporary
 *   access to the logged users. This is simmilar to
 *   a session storage. It is userful to have this to
 *   ease extending the database to support OAuth 2.0.
 */
CREATE TABLE IF NOT EXISTS `tokens` (
    `access_token` CHAR(64) NOT NULL,
    `expires` TIMESTAMP NOT NULL,
    
    `user` VARCHAR(80) NOT NULL,
    
    PRIMARY KEY (`access_token`),
    
    FOREIGN KEY (`user`) REFERENCES `users`(`username`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
COMMENT "Tokens stored in the database which give temporary access for the users";
 
DELIMITER $$
/**
 * If the link given is not null and the category code has some associated item
 * signals an SQL error.
 */
CREATE PROCEDURE check_not_link_and_items(IN cat_link VARCHAR(255), IN cat_code CHAR(10))
BEGIN
    DECLARE items INTEGER;
    IF cat_link IS NOT NULL THEN
        SET items = (SELECT COUNT(*) FROM items WHERE category_code = cat_code);
        IF items > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A category with items cannot have a non-null link value';
        END IF;
    END IF;
END$$

/**
 * If the link for the given category code is not null signals an SQL error.
 */
CREATE PROCEDURE check_not_link(IN cat_code CHAR(10))
BEGIN
    DECLARE my_link VARCHAR(255);
    SELECT `link` INTO my_link FROM categories WHERE category_code = cat_code;
    INSERT INTO log_table(message) VALUES(cat_code);
    IF my_link IS NOT NULL THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'A category with a non-null link value cannot have items';
    END IF;
END$$
/**
 * Signals an SQL error if the given unsigned integer is not a valid hour (more than 23)
 */
CREATE PROCEDURE check_valid_hour(IN the_hour INTEGER UNSIGNED)
BEGIN
    IF the_hour > 23 THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'The given hour is not a valid one (greater than 23)';
    END IF;
END$$
/**
 * Signals an SQL error if the given minutes are more than 59
 */
CREATE PROCEDURE check_valid_minutes(IN the_minutes INTEGER UNSIGNED)
BEGIN
    IF the_minutes > 59 THEN
        SIGNAL SQLSTATE '45003'
        SET MESSAGE_TEXT = 'The given minutes are not a valid amount (more than 59)';
    END IF;
END$$
/*CONSTRAINT CHK_addr CHECK (NOT (`address` IS NULL AND NOT `call_for_appointment`)),*/
/**
 * Signals an SQL error if the given cfa is true and phone is null
 */
CREATE PROCEDURE check_cfa_and_phone(IN cfa TINYINT(1), IN phone VARCHAR(100))
BEGIN
    IF cfa AND phone IS NULL THEN
        SIGNAL SQLSTATE '45004'
        SET MESSAGE_TEXT = 'Call for appointment is true, but the phone is null';
    END IF;
END$$
/**
 * Signals an SQL error if address is null and cfa is false
 */
CREATE PROCEDURE check_address_or_cfa(IN address VARCHAR(255), IN cfa TINYINT(1))
BEGIN
    IF address IS NULL AND NOT cfa THEN
        SIGNAL SQLSTATE '45005'
        SET MESSAGE_TEXT = 'The given address is null, but call for appointment is false.';
    END IF;
END$$

 
/**
 * Check that the categories with a link do not have associated items which
 * would remain innaccessible
 */
CREATE TRIGGER cat_link_check1 BEFORE UPDATE ON categories
    FOR EACH ROW BEGIN CALL check_not_link_and_items(NEW.link, NEW.category_code); END$$
CREATE TRIGGER cat_link_check2 BEFORE INSERT ON categories
    FOR EACH ROW BEGIN CALL check_not_link_and_items(NEW.link, NEW.category_code); END$$
/**
 * Check that the associated category does not have a link that would
 * cause the item to remain innaccesible.
 * Check that call_for_appointment set to true => phone not null
 * Check that address set to null => call_for_appointment
 */
CREATE TRIGGER item_cat_check1 BEFORE UPDATE ON items
    FOR EACH ROW BEGIN
        CALL check_cfa_and_phone(NEW.call_for_appointment, NEW.phone);
        CALL check_address_or_cfa(NEW.address, NEW.call_for_appointment);
        CALL check_not_link(NEW.category_code);
    END$$
CREATE TRIGGER item_cat_check2 BEFORE INSERT ON items
    FOR EACH ROW BEGIN
        CALL check_cfa_and_phone(NEW.call_for_appointment, NEW.phone);
        CALL check_address_or_cfa(NEW.address, NEW.call_for_appointment);
        CALL check_not_link(NEW.category_code);
    END$$
/**
 * Check hours and minutes for the inserted and updated periods
 * to be in the right range
 */
CREATE TRIGGER hours_mins_check1 BEFORE UPDATE ON opening_hours
    FOR EACH ROW
    BEGIN
        CALL check_valid_hour(NEW.start_hour);
        CALL check_valid_hour(NEW.end_hour);
        CALL check_valid_minutes(NEW.start_minutes);
        CALL check_valid_minutes(NEW.end_minutes);
    END$$
CREATE TRIGGER hours_mins_check2 BEFORE INSERT ON opening_hours
    FOR EACH ROW
    BEGIN
        CALL check_valid_hour(NEW.start_hour);
        CALL check_valid_hour(NEW.end_hour);
        CALL check_valid_minutes(NEW.start_minutes);
        CALL check_valid_minutes(NEW.end_minutes);
    END$$
DELIMITER ;