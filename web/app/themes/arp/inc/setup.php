<?php if ( ! defined('APP_PATH')) die ('Bad requested!');

/**
 * Enqueue scripts and styles.
 **/
function setup_scripts() {
    // Styles
    wp_enqueue_style('main-style', ASSETS_PATH.'css/main.css', array(), null);

    // Scripts
    wp_enqueue_script('main-script', ASSETS_PATH.'js/main.js', array('jquery'), null, true);

    /* array with elements to localize in scripts */
    $script_localization = array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'home_url' => get_home_url()
    );
    wp_localize_script('main-script', 'script_loc', $script_localization);
}
add_action( 'wp_enqueue_scripts', 'setup_scripts' );

/**
 * Default setup.
 **/
function default_setup(){
    register_nav_menus( array(
        'default_main_menu'     => __('Main Menu', DOMAIN)
    ) );
    register_nav_menus( array(
        'default_header_menu'   => __('Header Menu', DOMAIN)
    ) );

    add_theme_support( 'post-thumbnails' );
    add_post_type_support( 'page', 'excerpt' );
}
add_action('init', 'default_setup');