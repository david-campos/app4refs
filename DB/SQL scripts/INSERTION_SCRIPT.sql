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
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('info_legal','Legal', 'info', 1);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('info_assis','Assistance', 'info', 2);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('info_offpl','OfficialPlaces', 'info', 3);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('info_embas','Embassies', 'info', 4);
-- SERVICES
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_wifi_','WIFI', 'service', 1);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_food_','Food', 'service', 2);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_cloth','Clothing', 'service', 3);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_shelt','Shelters', 'service', 4);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_showe','Showers', 'service', 5);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_healt','Health', 'service', 6);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_legal','Legal', 'service', 7);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_embas','Embassies', 'service', 8);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_ctrfd','CountriesFood', 'service', 9);
-- INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
-- 	VALUES ('srvc_shops','Shops', 'service', 9);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_lgbt_','LGBT', 'service', 10);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_famil','Family', 'service', 11);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_child','Children', 'service', 12);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_women','Women', 'service', 13);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_disab','Disability', 'service', 14);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_ngos_','NGOs', 'service', 15);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_lantr','LangTraining', 'service', 16);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_protr','ProTraining', 'service', 17);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_smcrd','SimCards', 'service', 18);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('srvc_trans','Transport', 'service', 19, 'https://www.google.es/maps');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('srvc_laund','Laundry', 'service', 20);

-- LEISURE
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('leis_cultu','Cultural', 'leisure', 1);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('leis_educa','Educational', 'leisure', 2);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('leis_parks','Parks', 'leisure', 3);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('leis_sport','Sports', 'leisure', 4);

-- LINKS
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('link_educa','Education', 'link', 1);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('link_refug','RefugeeInfo', 'link', 2);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('link_haird','Hairdresser', 'link', 3);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('link_healt','Health', 'link', 4);
-- INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
--   VALUES ('link_commu','Communities', 'link', 5);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
	VALUES ('link_parks','Parks', 'link', 5);
-- INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
-- 	VALUES ('link_churc','Churches', 'link', 5);
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`)
    VALUES ('link_banks','Banks', 'link', 6);

-- HELP
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_banka','BankAccount', 'help', 1, 'http://www.piraeusbank.gr/en/personal-banking/proionta/katatheseis/personal-banking');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_ssnum','SocSecNumber', 'help', 2, 'https://www.amka.gr/aparaitita.html');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_kateh','Register', 'help', 3, 'http://asylo.gov.gr/en/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_healt','Health', 'help', 4, 'http://medinfo.gr/index.php');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_food_','Food', 'help', 5, 'https://sosrefugiados.org/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_showe','Showers', 'help', 7, 'http://www.katafigio-agapis.gr');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_women','Women', 'help', 6, 'https://www.facebook.com/Melissanetworkgreece33/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_disab','Disability', 'help', 8, 'http://www.esamea.gr/');
INSERT INTO `categories`(`category_code`, `name`, `item_type`, `position`, `link`)
	VALUES ('help_lgbt_','LGBT+', 'help', 9, 'http://www.colouryouth.gr/en/');