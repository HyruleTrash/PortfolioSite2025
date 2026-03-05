"use strict";

import { Vector2 } from "./Math.js";

/**
 * Holds a point inside the wave, used for remembering lineWidth
 *
 * @class WavePoint
 * @typedef {WavePoint}
 * @extends {Vector2}
 */
// eslint-disable-next-line no-unused-vars
export class WavePoint extends Vector2 {
	lineWidth = 0;

	constructor(x = 0, y = 0, lineWidth) {
		super(x, y);
		this.lineWidth = lineWidth;
	}

	ToObject() {
		return { lineWidth: this.lineWidth, pos: super.ToObject() };
	}
}