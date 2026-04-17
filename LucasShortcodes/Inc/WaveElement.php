<?php
if (! defined('ABSPATH')) exit;
require_once LS_PATH . 'Inc/HelperFunctions.php';

function ls_create_wave_effect($atts)
{
    // Required colors
    $firstColor = parseRGBA($atts["first_color"]);
    $lastColor = parseRGBA($atts["last_color"]);

    if ($firstColor == null || $lastColor == null)
        return "<span>[wave_effect] Invalid color</span>";

    // Height
    $height = isset($atts['height']) ? $atts['height'] : '100px';
    if (!preg_match('/^\d+(?:\.\d+)?(?:px|vh|rem|em|\%)$/', $height)) {
        return "<span>[wave_effect] Invalid height format</span>";
    }

    // Amount of waves
    $amount = isset($atts['amount']) ? $atts['amount'] : 3;
    if (!validityCheckNumber($amount)) {
        return "<span>[wave_effect] Invalid amount format</span>";
    }

    // Line widths
    $lineMin = isset($atts['lineminwidth']) ? $atts['lineminwidth'] : 2;
    if (!validityCheckNumber($lineMin)) {
        return "<span>[wave_effect] Invalid lineminwidth format</span>";
    }

    $lineMax = isset($atts['linemaxwidth']) ? $atts['linemaxwidth'] : 10;
    if (!validityCheckNumber($lineMax)) {
        return "<span>[wave_effect] Invalid linemaxwidth format</span>";
    }

    $lineBase = isset($atts['linebasewidth']) ? $atts['linebasewidth'] : 40;
    if (!validityCheckNumber($lineBase)) {
        return "<span>[wave_effect] Invalid linebasewidth format</span>";
    }

    // Type (static or moving)
    $type = isset($atts['type']) ? strtolower($atts['type']) : 'static';
    $tag = ($type === "moving") ? "moving-wave-element" : "wave-element";

    // Speed (only relevant for moving)
    $speedAttr = "";
    if ($type === "moving") {
        $speed = isset($atts['speed']) ? $atts['speed'] : 1;
        if (!validityCheckNumber($speed)) {
            return "<span>[wave_effect] Invalid speed format</span>";
        }
        $speedAttr = "speed='{$speed}'";
    }

    // Boolean attributes (default false)
    $hasTop = isset($atts['hastop']) ? filter_var($atts['hastop'], FILTER_VALIDATE_BOOLEAN) : false;
    $hasBottom = isset($atts['hasbottom']) ? filter_var($atts['hasbottom'], FILTER_VALIDATE_BOOLEAN) : false;
    $hasTopAttr = $hasTop ? "hastop='true'" : "hastop='false'";
    $hasBottomAttr = $hasBottom ? "hasbottom='true'" : "hasbottom='false'";

    // Build attributes
    $firstColorHtml = "firstcolor='rgba({$firstColor['red']},{$firstColor['green']},{$firstColor['blue']},{$firstColor['alpha']})'";
    $lastColorHtml = "lastcolor='rgba({$lastColor['red']},{$lastColor['green']},{$lastColor['blue']},{$lastColor['alpha']})'";

    $amountHtml = "amount='{$amount}'";
    $lineMinHtml = "lineminwidth='{$lineMin}'";
    $lineMaxHtml = "linemaxwidth='{$lineMax}'";
    $lineBaseHtml = "linebasewidth='{$lineBase}'";

    // Output
    return "<{$tag} 
        style='height: {$height}' 
        {$firstColorHtml} 
        {$lastColorHtml} 
        {$amountHtml} 
        {$lineMinHtml} 
        {$lineMaxHtml} 
        {$lineBaseHtml} 
        {$speedAttr}
        {$hasTopAttr}
        {$hasBottomAttr}
    ></{$tag}>";
}
