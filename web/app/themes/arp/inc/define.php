<?php if (! defined('APP_PATH')) die ('Bad requested!');

define('ASSETS_PATH', get_template_directory_uri().'/assets/');
define('DOMAIN', 'pan_arp');
define('LAZY_IMAGE', get_template_directory_uri().'/assets/images/placeholder.gif');
define('ACF_SUPPORT', function_exists('get_field'));
/**
 * Themes Option.
**/
define('ATHENA_LOGO', ACF_SUPPORT ? get_field('fidesio_logo', 'option') : false);