<?php if (!defined('APP_PATH')) die ('Bad requested!');

/**
 * ACF Functions
 **/
//Create option page
if( function_exists('acf_add_options_page') ) {

    acf_add_options_page(array(
        'page_title' 	=> __('General Settings', DOMAIN),
        'menu_title'	=> __('Theme options', DOMAIN),
        'menu_slug' 	=> 'epeda-theme-settings',
        'capability'	=> 'manage_options',
        'redirect'		=> false
    ));
    
}

//load_json
function my_acf_json_load_point($paths)
{
    // remove original path (optional)
    unset($paths[0]);

    // append path
    $paths[] = get_stylesheet_directory() . '/acf-json';

    // return
    return $paths;
}
add_filter('acf/settings/load_json', 'my_acf_json_load_point');