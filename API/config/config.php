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
spl_autoload_register(function ($class) {
    $paths = explode(PATH_SEPARATOR, get_include_path());
    foreach($paths as $includePath) {
        $file = $includePath . DIRECTORY_SEPARATOR
            . str_replace('\\', DIRECTORY_SEPARATOR, $class)
            . '.php';
        if (file_exists($file)) {
            require $file;
            return true;
        }
    }
    return false;
});