-- App4Refs: Creation script for the database
--   This script should create in the database all the tables required
--   for the back-end of the application to work.
-- 
-- Author: David Campos R. <david.campos.r96@gmail.com>

/* ControlPanelUsers
 *   This table will store information about the users
 *   of the control panel, so they can log in.
 */
 CREATE TABLE IF NOT EXISTS `control_panel_users` (
    `id`    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(100) UNIQUE NOT NULL,
    `salt`  CHAR(128) NOT NULL,
    `pass`  CHAR(128) NOT NULL,
    
    PRIMARY KEY (`id`)
 )
 COMMENT "Control panel users and their (hashed) passwords";
 
 /* Items
  *   This table will store information about the
  *   diferent items which appear in the lists of
  *   the application: Services, Leisure, Links, etc.
  */
CREATE TABLE IF NOT EXISTS `items` (
    `id`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`    VARCHAR(255) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
	`web_link` VARCHAR(255),
	`place_id` VARCHAR(255),
	`icon_uri` VARCHAR(255) NOT NULL,
	
	PRIMARY KEY(`id`)
)
COMMENT "Items to display in the application lists (services, leisure, links...)";

/* Opening hours
 *   This table will store information about the opening
 *   hours of the items. Each entry is a new opening
 *   period, i.e. from sunday 17:30 till monday 01:30.
 */
 CREATE TABLE IF NOT EXISTS `opening_hours` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
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
	
	`item_id` INT UNSIGNED NOT NULL,
	
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	
	PRIMARY KEY (`item_id`, `id`)
 )
 COMMENT "Opening hours periods for the items";