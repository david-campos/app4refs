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
	VALUES ('srvc_ctrfd','CountriesFood', 'service');
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
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_trans','Transport', 'service');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('srvc_laund','Laundry', 'service');

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
--INSERT INTO `categories`(`category_code`, `name`, `item_type`)
--	VALUES ('link_commu','Communities', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_healt','Health', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_haird','Hairdresser', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
	VALUES ('link_parks','Parks', 'link');
-- INSERT INTO `categories`(`category_code`, `name`, `item_type`)
-- 	VALUES ('link_churc','Churches', 'link');
INSERT INTO `categories`(`category_code`, `name`, `item_type`)
VALUES ('link_banks','Banks', 'link');

-- HELP
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_banka','BankAccount', 'help', 'http://www.piraeusbank.gr/en/personal-banking/proionta/katatheseis/personal-banking');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_ssnum','SocSecNumber', 'help', 'https://www.amka.gr/aparaitita.html');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_kateh','Register', 'help', 'http://asylo.gov.gr/en/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_healt','Health', 'help', 'http://medinfo.gr/index.php');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_food_','Food', 'help', 'https://sosrefugiados.org/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_showe','Showers', 'help', 'http://www.katafigio-agapis.gr');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_women','Women', 'help', 'https://www.facebook.com/Melissanetworkgreece33/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_disab','Disability', 'help', 'http://www.esamea.gr/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `link`)
	VALUES ('help_lgbt_','LGBT+', 'help', 'http://www.colouryouth.gr/en/');