<?php
/**
 * Created by PhpStorm.
 * User: ADMIN
 * Date: 10/16/2018
 * Time: 2:46 PM
 */
?>


<nav class="menu-main">
	<?php
		wp_nav_menu([
		    'menu'              => 'blog-menu',
		    'theme_location'    => 'default_main_menu',
		    'menu_class'        => 'main-menu',
		    'container'         => 'ul',
		    'container_class'   => 'main-menu',
		    'container_id'      => '',
		]);
	?>
    <ul class="social">
        <li><a href="#"><i class="icomoon icon-facebook"></i></a></li>
        <li><a href="#"><i class="icomoon icon-instagram"></i></a></li>
    </ul>
</nav>