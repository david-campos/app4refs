-- App4Refs: Insertion script for the database
--   This script should insert in the already created database
--   some inital information like categories and languages
-- Author: David Campos R. <david.campos.r96@gmail.com>

/******************************************************************************
 * LANGUAGES
 ******************************************************************************/
-- Languages are intented to use the ISO 639-1 Language Codes
-- More info on https://www.iso.org/iso-639-language-codes.html
INSERT INTO `languages`(`lang_code`, `icon_uri`)
	VALUES ('en','en.png');
INSERT INTO `languages`(`lang_code`, `icon_uri`)
	VALUES ('el','el.png');

/******************************************************************************
 * CATEGORIES
 ******************************************************************************/
-- INFO
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('info_legal','Legal');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('info_assis','Assistance');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('info_embas','Embassies');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('info_offpl','OfficialPlaces');
-- SERVICES
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_wifi_','WIFI');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_food_','Food');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_cloth','Clothing');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_shelt','Shelters');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_showe','Showers');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_healt','Health');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_legal','Legal');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_embas','Embassies');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_shops','Shops');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_lgbt_','LGBT');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_famil','Family');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_child','Children');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_women','Women');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_disab','Disability');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_ngos_','NGOs');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_protr','ProTraining');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_lantr','LangTraining');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('srvc_smcrd','SimCards');
-- LEISURE
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('leis_cultu','Cultural');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('leis_educa','Educational');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('leis_parks','Parks');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('leis_sport','Sports');
-- LINKS
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_educa','Education');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_refug','RefugeeInfo');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_commu','Communities');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_healt','Health');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_haird','Hairdresser');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_parks','Parks');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_churc','Churches');
INSERT INTO `categories`(`category_code`, `name`)
	VALUES ('link_banks','Banks');
-- HELP
-- It has no categories