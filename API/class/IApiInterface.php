<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Interface IApiInterface, this interface provides constants to keep the interface
 * of the api together in one file
 */
interface IApiInterface {
    /** @var string API base URI, this URI will be removed at the start of $_SERVER['REQUEST_URI'] to correct the URIs
     * before matching. */
    const API_BASE_URI = 'api_v1';
    /** @var string Directory where all the icons for the items are saved (end it with /) */
    const ITEM_ICONS_DIR = 'C:/USC/4 Cuarto curso/TFG/app4refs/PWA/dist/ico/items/';

    /** @var string key of the get param to set the input format */
    const INPUT_FORMAT_PARAM = 'in';
    /** @var string key of the get param to set the output format */
    const OUTPUT_FORMAT_PARAM = 'out';
    /** @var string value to indicate json format */
    const FORMATS_JSON = 'json';
    /** @var string default input format for the requests */
    const INPUT_FORMAT_DEFAULT = IApiInterface::FORMATS_JSON;
    /** @var string default output format for the answers */
    const OUTPUT_FORMAT_DEFAULT = IApiInterface::FORMATS_JSON;
    /** @var string value we must set the period id to if we want to create a new one */
    const PERIOD_ID_CREATE_NEW_VALUE = 'new';
    /** @var integer Token duration in seconds. After this amount of time the token expires */
    const TOKEN_DURATION = 24*60*60;
    /** @var string Key of the get param for the token */
    const TOKEN_PARAM = 'token';

    // ITEM INTERFACE (texts for the items to output and input values)
    const ITEM_ID = 'itemId';
    const ITEM_NAME = 'name';
    const ITEM_ADDR = 'address';
    const ITEM_LINK = 'webLink';
    const ITEM_PLACE = 'placeId';
    const ITEM_ICON = 'iconUri';
    const ITEM_IS_FREE = 'isFree';
    const ITEM_COORD_LAT = 'coordLat';
    const ITEM_COORD_LON = 'coordLon';
    const ITEM_PHONE = 'phone';
    const ITEM_CALL_FOR_APPOINTMENT = 'callForAppointment';
    const ITEM_CATEGORY_CODE = 'categoryCode';
    const ITEM_LANGUAGE_CODES = 'languageCodes';
    const ITEM_OPENING_HOURS = 'openingHours';
    const ITEM_ORDER_PREFERENCE = 'orderPreference';

    // PERIOD INTERFACE (text for the periods/opening hours to output and input values)
    const PERIOD_ID = 'periodId';
    const PERIOD_START_DAY = 'startDay';
    const PERIOD_START_HOUR = 'startHour';
    const PERIOD_START_MINUTES = 'startMinutes';
    const PERIOD_END_DAY = 'endDay';
    const PERIOD_END_HOUR = 'endHour';
    const PERIOD_END_MINUTES = 'endMinutes';

    // CATEGORY INTERFACE
    const CATEGORY_CODE = 'code';
    const CATEGORY_NAME = 'name';
    const CATEGORY_ITEM_TYPE = 'itemType';
    const CATEGORY_LINK = 'link';
    const CATEGORY_POSITION = 'position';

    // TOKEN INTERFACE
    const TOKEN_TOKEN = 'token';
    const TOKEN_EXPIRES = 'expires';
    const TOKEN_USER_NAME = 'user';

    // SESSION INTERFACE
    const SESSION_PASSWORD = 'password';
    const SESSION_USER = 'user';
    const SESSION_NEW_PASSWORD = 'newPassword';
}