<?php
function shortcodes_init(){
	add_shortcode( 'bg_wave_effect', 'add_bg_wave_effect' );
}

function add_bg_wave_effect( $atts ){
	$startColor = parseRGBA($atts["start_color"]);
	$endColor = parseRGBA($atts["end_color"]);
	if ($startColor == null || $endColor == null)
		return "<span>[bg_wave_effect]</span>";
	$height = $atts["height"];
	
	$output = "<wave-svg-element style='height: {$height}'";
	$startColorHtml = "start_color='{$startColor['red']},{$startColor['green']},{$startColor['blue']},{$startColor['alpha']}'";
	$endColorHtml = "end_color='{$endColor['red']},{$endColor['green']},{$endColor['blue']},{$endColor['alpha']}'";
	
	return "{$output} {$startColorHtml} {$endColorHtml} />";
}
?>