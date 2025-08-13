<?php
function shortcodes_init(){
	add_shortcode( 'bg_wave_effect', 'add_bg_wave_effect' );
}

function add_bg_wave_effect( $atts ){
	$startColor = parseRGBA($atts["start_color"]);
	$endColor = parseRGBA($atts["end_color"]);

	// Validate colors
	if ($startColor == null || $endColor == null)
		return "<span>[bg_wave_effect] Invalid color</span>";

	$height = isset($atts['height']) ? $atts['height'] : '0px';
    
    // Validate height format
    if (!preg_match('/^\d+(?:\.\d+)?(?:px|vh|rem|em|\%)$/', $height)) {
        return "<span>[bg_wave_effect] Invalid height format</span>";
    }

	$waveSize = isset($atts['wave_size']) ? $atts['wave_size'] : '0';
	
    // Validate waveSize format
    if (!preg_match('/^\d+(?:\.\d+)?$/', $waveSize)) {
        return "<span>[bg_wave_effect] Invalid wave_size format</span>";
    }
	
	$output = "<wave-svg-element style='height: {$height}'";
	$startColorHtml = "start_color='{$startColor['red']},{$startColor['green']},{$startColor['blue']},{$startColor['alpha']}'";
	$endColorHtml = "end_color='{$endColor['red']},{$endColor['green']},{$endColor['blue']},{$endColor['alpha']}'";
	$waveSizeHtml = "wave_size='{$waveSize}'";
	
	return "{$output} {$startColorHtml} {$endColorHtml} {$waveSizeHtml}/>";
}
?>