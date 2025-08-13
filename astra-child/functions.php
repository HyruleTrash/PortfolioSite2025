<?php

add_action( 'wp_enqueue_scripts', 'astra_child_style' );
				function astra_child_style() {
					wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
					wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style') );
				}

include get_theme_file_path('/inc/add_javascript.php');
add_action('wp_enqueue_scripts', 'enqueue_custom_scripts');

include get_theme_file_path('/inc/helper_functions.php');

include get_theme_file_path('/inc/add_shortcodes.php');
add_action('init', 'shortcodes_init');

?>