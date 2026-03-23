<?php

require_once LS_PATH . 'Inc/WaveElement.php';

function shortcodes_init()
{
    add_shortcode('wave_effect', 'ls_create_wave_effect');
}