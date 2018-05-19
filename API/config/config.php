<?php
// Defines for directories
define('CLASS_DIR',  realpath(dirname(__FILE__).'/../class/'));
define('TEST_DIR',  realpath(dirname(__FILE__).'/../unitaryTests/'));

// Changes to the include path of autoload
set_include_path(get_include_path().PATH_SEPARATOR.CLASS_DIR);
// For unitary tests
if(defined('UNIT_TESTING')) {
    set_include_path(get_include_path().PATH_SEPARATOR.TEST_DIR);
}

// Extension
spl_autoload_extensions('.php');

// Register autoload
spl_autoload_register();