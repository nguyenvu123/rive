<?php if (! defined('APP_PATH')) die ('Bad requested!');

//adding a body class to a specific page template
add_filter( 'body_class', 'custom_class' );
function custom_class( $classes ) {
    $classes[] = 'abc';
    return $classes;
}

//Add active class to wp_nav_menu
function special_nav_class($classes, $item)
{
    if ( in_array('current-menu-item', $classes) )
    {
        $classes[] = 'is-active';
    }
    return $classes;
}
add_filter('nav_menu_css_class' , 'special_nav_class' , 10 , 2);