-- App4Refs: Insertion script for the database
--   This script should insert in the already created database
--   some inital information like categories and languages
-- Author: David Campos R. <david.campos.r96@gmail.com>

/******************************************************************************
 * LANGUAGES
 ******************************************************************************/
-- Languages are intented to use the ISO 639-1 Language Codes
-- More info on https://www.iso.org/iso-639-language-codes.html
INSERT INTO `languages`(`lang_code`)
	VALUES ('en');
INSERT INTO `languages`(`lang_code`)
	VALUES ('el');

/******************************************************************************
 * CATEGORIES
 ******************************************************************************/
-- INFO
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('info_legal','Legal', 'info');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('info_assis','Assistance', 'info');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('info_embas','Embassies', 'info');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('info_offpl','OfficialPlaces', 'info');
-- SERVICES
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_wifi_','WIFI', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_food_','Food', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_cloth','Clothing', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_shelt','Shelters', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_showe','Showers', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_healt','Health', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_legal','Legal', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_embas','Embassies', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_shops','Shops', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_lgbt_','LGBT', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_famil','Family', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_child','Children', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_women','Women', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_disab','Disability', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_ngos_','NGOs', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_protr','ProTraining', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_lantr','LangTraining', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_smcrd','SimCards', 'service');
-- LEISURE
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('leis_cultu','Cultural', 'leisure');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('leis_educa','Educational', 'leisure');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('leis_parks','Parks', 'leisure');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('leis_sport','Sports', 'leisure');
-- LINKS
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_educa','Education', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_refug','RefugeeInfo', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_commu','Communities', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_healt','Health', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_haird','Hairdresser', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_parks','Parks', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_churc','Churches', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_banks','Banks', 'link');
-- HELP
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('help_help_','Help', 'help');