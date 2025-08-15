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

	$waveSize = $atts['wave_size'];
    // Validate waveSize format
    if (!validityCheckNumber($waveSize)) {
        return "<span>[bg_wave_effect] Invalid wave_size format</span>";
    }

	$minWaves = $atts['min_waves'];
    // Validate min_waves format
    if (!validityCheckNumber($waveSize)) {
        return "<span>[bg_wave_effect] Invalid min_waves format</span>";
    }
	$maxWaves = $atts['max_waves'];
    // Validate max_waves format
    if (!validityCheckNumber($waveSize)) {
        return "<span>[bg_wave_effect] Invalid max_waves format</span>";
    }

	$gradientDir = parseVector2($atts['gradient_direction']);
	
	$output = "<wave-svg-element style='height: {$height}'";
	$startColorHtml = "start_color='{$startColor['red']},{$startColor['green']},{$startColor['blue']},{$startColor['alpha']}'";
	$endColorHtml = "end_color='{$endColor['red']},{$endColor['green']},{$endColor['blue']},{$endColor['alpha']}'";
	$minMaxWavesHtml = "min_waves='{$minWaves}' max_waves='{$maxWaves}'";
	$gradientDirHtml = "gradient_direction='{$gradientDir['x']},{$gradientDir['y']}'";
	$waveSizeHtml = "wave_size='{$waveSize}'";
	
	return "{$output} {$startColorHtml} {$endColorHtml} {$waveSizeHtml} {$gradientDirHtml} {$minMaxWavesHtml}/>";
}
?>