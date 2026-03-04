"use-strict";

import { RandomRange, Vector2, SetSeed, TimeSeed } from "./Math.js";


/**
 * Holds a point inside the wave, used for remembering lineWidth
 *
 * @class WavePoint
 * @typedef {WavePoint}
 * @extends {Vector2}
 */
class WavePoint extends Vector2 {
	lineWidth = 0;

	constructor(x = 0, y = 0, lineWidth) {
		super(x, y);
		this.lineWidth = lineWidth;
	}

	ToObject() {
		return { lineWidth: this.lineWidth, pos: super.ToObject() };
	}
}

/**
 * A class used for holding a point list and bezier curving the points you give it
 *
 * @class WaveStruct
 * @typedef {WaveStruct}
 */
class WaveStruct{
	constructor(givenPoints, resolution = 100) {
		this.controlPoints = givenPoints;
		this.points = [];

		if (!givenPoints || givenPoints.length < 2) return;

		for (let i = 0; i <= resolution; i++) {
			const t = i / resolution;
			this.points.push(this.#BezierPoint(t));
		}
	}

	#BezierPoint(t) {
		const n = this.controlPoints.length - 1;
		let x = 0;
		let y = 0;
		let lw = 0;

		for (let i = 0; i <= n; i++) {
			const bin = this.#Binomial(n, i);
			const weight = bin * Math.pow(1 - t, n - i) * Math.pow(t, i);

			x += weight * this.controlPoints[i].x;
			y += weight * this.controlPoints[i].y;
			lw += weight * this.controlPoints[i].lineWidth;
		}

		return new WavePoint(x, y, lw);
	}

	#Binomial(n, k) {
		return this.#Factorial(n) / (this.#Factorial(k) * this.#Factorial(n - k));
	}

	#Factorial(n) {
		let result = 1;
		for (let i = 2; i <= n; i++) {
			result *= i;
		}
		return result;
	}
}

/**
 * Wave html class, used for drawing a wave onto a canvas
 *
 * @export
 * @class Wave
 * @typedef {Wave}
 * @extends {HTMLElement}
 */
export class Wave extends HTMLElement {
	constructor() {
		super();

		this.seed = TimeSeed();
		SetSeed(this.seed);
		this.waveStyle = RandomRange(-1, 1) > 0;
		this.phaseOffset = RandomRange(0, Math.PI * RandomRange(0, 4));
		this.flowDir = Math.round(RandomRange(-1, 1));

		this._ro = new ResizeObserver(entries => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				this.OnResize(width, height);
			}
		});
	}

	connectedCallback() {
		this._ro.observe(this);

		const amount = this.getAttribute("height");
		this.height = parseInt(amount); // assuming pixels

		if (!isNaN(this.height)) {
			this.style.height = this.height + "px";
		}

		this.canvas = document.createElement("canvas");
		this.canvas.innerText = "Wave element failed to load"
		this.appendChild(this.canvas);

		if (!this.canvas.getContext) {
			// canvas-unsupported code here
			this.removeChild(this.canvas)
		} else {
			const ctx = this.canvas.getContext("2d");
			this.Draw(ctx);
		}
	}

	disconnectedCallback() {
		this._ro.disconnect();
	}

	OnResize(width, height) {
		this.width = width;
		this.height = height;

		// console.log(width, height);
		this.canvas.height = height;
		this.canvas.width = width;
		if (this.canvas.getContext) {
			const ctx = this.canvas.getContext("2d");
			this.Draw(ctx);
		}
	}

	Draw(ctx) {
		ctx.fillStyle = "rgb(200 0 0)";
		ctx.fillRect(0, 0, this.width, this.height);

		let amount = 5; // TODO generate this
		SetSeed(this.seed);
		let points = this.GeneratePoints(amount, 50, 200);

		if (!this.ValidatePoints(points)){
			let wave = new WaveStruct(points);
			this.DrawWave(ctx, wave);
		}
	}

	DrawWave(ctx, wave) {
		ctx.beginPath();
		ctx.moveTo(wave.points[0].x, wave.points[0].y);

		for (let i = 1; i < wave.points.length; i++) {
			ctx.lineTo(wave.points[i].x, wave.points[i].y - wave.points[i].lineWidth)
		}
		for (let i = wave.points.length - 1; i >= 0; i--) {
			ctx.lineTo(wave.points[i].x, wave.points[i].y + wave.points[i].lineWidth)
		}

		ctx.closePath();

		const grad = ctx.createLinearGradient(0,0,this.width,0);
		grad.addColorStop(0, "lightblue"); // TODO generate this
		grad.addColorStop(1, "darkblue");
		ctx.fillStyle = grad;
		ctx.fill();
	}

	DrawCircle(ctx, a, size, color = "rgb(200 200 200)") {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(a.x, a.y, size, 0, 2 * Math.PI);
		ctx.fill();
	}

	GeneratePoints(amount, variationX, variationY) {
		const center = this.height / 2;
		const lineMinWidth = this.PercentOfHeight(2); // TODO take this from element values
		const lineMaxWidth = this.PercentOfHeight(10);
		const lineBaseWidth = this.PercentOfHeight(30);
		const flowDir = this.flowDir;
		const beginAndEndOffset = 100;

		let array = new Array((amount * 3) + 2);

		let lw = RandomRange(lineMinWidth, lineMaxWidth);
		let variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, 0);
		array[0] = new WavePoint(-beginAndEndOffset, center, lw + lineBaseWidth * variation);

		for (let i = 1; i < array.length - 1; i++) {
			lw = RandomRange(lineMinWidth, lineMaxWidth);
			
			let x = this.width / array.length * i;
			x += RandomRange(-variationX, variationX);

			variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, i);
			let y = this.GenerateYPosition(center, variation, array.length, (1 - variation) * variationY);
			y = this.ClampYWithinBounds(y, lw * 2);
			array[i] = new WavePoint(x, y, lw + lineBaseWidth * variation);
		}

		lw = RandomRange(lineMinWidth, lineMaxWidth);
		variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, 0);
		array[array.length - 1] = new WavePoint(this.width + beginAndEndOffset, center, array[array.length - 2].lineWidth + lw + lineBaseWidth * variation);

		return array;
	}

	GetTValueBasedOnDirFlow(amount, flowDir, i){
		if (flowDir == 1){
			return (1 / amount) * i;
		}else{
			return ((1 / amount) * i) - 1;
		}
	}

	GenerateYPosition(center, t, frequency, amplitude) {
		if (this.waveStyle){
			return center + Math.sin((frequency * t) + this.phaseOffset) * amplitude;
		}else{
			return center + Math.cos((frequency * t) + this.phaseOffset) * amplitude;
		}
	}

	ClampYWithinBounds(y, lw) {
		const min = lw;
		const max = this.height - lw;

		if (y < min) return min;
		if (y > max) return max;

		return y;
	}

	ValidatePoints(array) {
		for (let i = 0; i < array.length; i++) {
			const element = array[i];
			if (isNaN(element.x) || isNaN(element.y))
				return true;
		}
		return false;
	}

	PercentOfHeight(val) {
		return this.height * (val / 100)
	}
}

customElements.define("wave-element", Wave);