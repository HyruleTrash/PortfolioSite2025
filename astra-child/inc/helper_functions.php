<?php
function parseRGBA($colorString): ?array {
    // Check if string starts with 'rgba('
    if (!is_string($colorString) || !str_starts_with(strtolower($colorString), 'rgba(')) {
        return null;
    }

    // Remove rgba( and ) then split by comma
    $values = explode(',', substr($colorString, 5, -1));
    
    // Clean up whitespace and convert values
    $values = array_map(function($value) {
        return floatval(trim($value));
    }, $values);

    // Validate values
    if (count($values) !== 4) {
        return null;
    }
    
    list($r, $g, $b, $a) = $values;

    // Ensure values are within valid ranges
    if ($r < 0 || $r > 255 || 
        $g < 0 || $g > 255 || 
        $b < 0 || $b > 255 || 
        $a < 0 || $a > 1) {
        return null;
    }

    return [
        'red' => $r,
        'green' => $g,
        'blue' => $b,
        'alpha' => $a
    ];
}
?>