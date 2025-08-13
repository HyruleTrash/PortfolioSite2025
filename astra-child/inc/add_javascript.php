<?php
function enqueue_custom_scripts() {
    wp_enqueue_script(
        'bg_wave_effect', // Handle for the script
        get_stylesheet_directory_uri() . '/js/bg_wave_effect.js', // Path to script
        array('jquery'), // Dependencies
        '1.0', // Version
        true // Load in footer
    );
}
?>