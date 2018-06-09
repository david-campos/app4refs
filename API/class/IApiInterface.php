<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Interface IApiInterface, this interface provides constants to keep the interface
 * of the api together in one file
 */
interface IApiInterface {
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

    
}