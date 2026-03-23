<?php

/**
 * Plugin Name:       Lucas Shortcodes
 * Plugin URI:        https://github.com/HyruleTrash/PortfolioSite2025
 * Description:       Adds shortcodes for custom elements
 * Version:           1.0.0
 * Author:            Lucas Hoogerbrugge
 * Author URI:        https://lucashoogerbrugge.nl/
 * License:           All rights reserved
 */

/*
 * COPYRIGHT NOTICE
 * Copyright (c) 2026 Lucas Hoogerbrugge. All rights reserved.
 * This software and associated documentation files may not be copied, 
 * modified, merged, published, distributed, sublicensed, or sold 
 * without the express written permission of the author.
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 1. DEFINE CONSTANTS
 * Useful for paths and URLs later on. (LS standsfor the plugin name)
 */
define('LS_PATH', plugin_dir_path(__FILE__));
define('LS_URL', plugin_dir_url(__FILE__));

/**
 * 2. ACTIVATION & DEACTIVATION HOOKS
 * Run code when the plugin is turned on or off.
 */
register_activation_hook(__FILE__, 'ls_activate');
function ls_activate()
{
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, 'ls_deactivate');
function ls_deactivate()
{
    flush_rewrite_rules();
}

/**
 * 3. THE "CHUCK YOUR CODE HERE" SECTION
 */

require_once LS_PATH . 'Inc/Shortcodes.php';

add_filter('script_loader_tag', 'ls_make_script_a_module', 10, 3);

function ls_make_script_a_module($tag, $handle, $src)
{
    // Only apply to our specific script handle
    if ('ls-js-lib' !== $handle) {
        return $tag;
    }

    // Change the <script> tag to include type="module"
    $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';

    return $tag;
}

add_action('init', 'ls_init_function');
function ls_init_function()
{
    shortcodes_init();
}

// Example: Adding a CSS file to the front-end
add_action('wp_enqueue_scripts', 'ls_enqueue_assets');
function ls_enqueue_assets()
{
    wp_enqueue_script(
        'ls-js-lib',            // Handle for the script
        LS_URL . '/Js/Lib.js',  // Path to script
        array('jquery'),        // Dependencies
        '1.0',                  // Version
        true                    // Load in footer
    );
    wp_enqueue_style(
        'ls-style',                 // Handle for the script
        LS_URL . '/Css/Lib.css',    // Path to script
    );
}

/**
 * 4. ADMIN MENUS (Optional)
 * Create a settings page in the dashboard.
 */
// add_action('admin_menu', 'ls_add_admin_menu');
// function ls_add_admin_menu()
// {
//     add_options_page(
//         'Plugin Settings',
//         'My Plugin',
//         'manage_options',
//         'my-custom-plugin',
//         'ls_settings_page_html'
//     );
// }

// function ls_settings_page_html()
// {
//     echo '<div class="wrap"><h1>Plugin Settings</h1><p>Welcome to your plugin page.</p></div>';
// }