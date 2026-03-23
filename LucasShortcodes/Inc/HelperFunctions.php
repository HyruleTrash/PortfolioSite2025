<?php
function parseRGBA($colorString): ?array
{
    // Check if string starts with 'rgba('
    if (!is_string($colorString) || !str_starts_with(strtolower($colorString), 'rgba(')) {
        return null;
    }

    // Remove rgba( and ) then split by comma
    $values = explode(',', substr($colorString, 5, -1));

    // Clean up whitespace and convert values
    $values = array_map(function ($value) {
        return floatval(trim($value));
    }, $values);

    // Validate values
    if (count($values) !== 4) {
        return null;
    }

    list($r, $g, $b, $a) = $values;

    // Ensure values are within valid ranges
    if (
        $r < 0 || $r > 255 ||
        $g < 0 || $g > 255 ||
        $b < 0 || $b > 255 ||
        $a < 0 || $a > 1
    ) {
        return null;
    }

    return [
        'red' => $r,
        'green' => $g,
        'blue' => $b,
        'alpha' => $a
    ];
}

function parseVector2(?string $coordinateString): ?array
{
    // Handle null input
    if ($coordinateString === null) {
        return null;
    }

    // Split the string by comma and clean whitespace
    $coordinates = array_map('trim', explode(',', strval($coordinateString)));

    // Validate we got exactly two coordinates
    if (count($coordinates) !== 2) {
        return null;
    }

    // Convert to floats and validate numbers
    $x = floatval($coordinates[0]);
    $y = floatval($coordinates[1]);

    // Check if conversion produced valid numbers
    if (!is_numeric($x) || !is_numeric($y)) {
        return null;
    }

    return ['x' => $x, 'y' => $y];
}

function validityCheckNumber($numberString): bool
{
    if (!isset($numberString) || !preg_match('/^\d+(?:\.\d+)?$/', $numberString))
        return false;
    return true;
}