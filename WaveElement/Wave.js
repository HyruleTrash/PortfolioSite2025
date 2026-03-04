"use strict";

import { RandomRange, Vector2, SetSeed, TimeSeed } from "./Math.js";
import { WavePoint } from "./WavePoint.js";
import { WaveStruct } from "./WaveStruct.js";

/**
 * Wave html class, used for drawing a wave onto a canvas
 *
 * @export
 * @class Wave
 * @typedef {Wave}
 * @extends {HTMLElement}
 */
export class Wave extends HTMLElement {
	static idCounter = 0;

	constructor() {
		super();

		this.identifier = Wave.idCounter;
		this.seed = TimeSeed() ^ this.identifier;
		SetSeed(this.seed);
		Wave.idCounter++;

		this.waveStyle = RandomRange(-1, 1) > 0;
		this.phaseOffset = RandomRange(0, 100) / 100;
		this.flowDir = Math.round(RandomRange(-1, 1));
		this.direction = new Vector2(
			RandomRange(-1, 1),
			RandomRange(-1, 1),
		).Normalize();
		this.yScale = 0.5; // vertical squash amount
		this.shearStrength = RandomRange(10, 100);

		this.amountOfWaves = 3;
		this.lineMinWidth = 2;
		this.lineMaxWidth = 10;
		this.lineBaseWidth = 40;

		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				this.OnResize(width, height);
			}
		});

		this.visibilityObserver = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.VisibilityChanged();
				}
			}
		});

		this._CheckMutations = (mutationList) => {
			let relevant = false;
			for (const mutation of mutationList) {
				if (mutation.type !== "attributes") {
					continue;
				}
				switch (mutation.attributeName) {
					case "height": {
						let foundHeight = this.getAttribute("height");
						this.height = parseInt(foundHeight); // assuming pixels

						if (!isNaN(this.height)) {
							this.style.height = this.height + "px";
						}
						relevant = true;
						break;
					}
					case "amount": {
						const amountOfWaves = this.getAttribute("amount");
						this.amountOfWaves = parseInt(amountOfWaves);
						if (isNaN(this.amountOfWaves)) {
							this.amountOfWaves = 3;
						}
						relevant = true;
						break;
					}
					case "lineminwidth": {
						const lineMinWidth = this.getAttribute("lineminwidth");
						this.lineMinWidth = parseInt(lineMinWidth); // assuming value between 0, and 100
						if (isNaN(this.lineMinWidth)) {
							this.lineMinWidth = 2;
						}
						relevant = true;
						break;
					}
					case "linemaxwidth": {
						const lineMaxWidth = this.getAttribute("linemaxwidth");
						this.lineMaxWidth = parseInt(lineMaxWidth); // assuming value between 0, and 100
						if (isNaN(this.lineMaxWidth)) {
							this.lineMaxWidth = 10;
						}
						relevant = true;
						break;
					}
					case "linebasewidth": {
						const lineBaseWidth =
							this.getAttribute("linebasewidth");
						this.lineBaseWidth = parseInt(lineBaseWidth); // assuming value between 0, and 100
						if (isNaN(this.lineBaseWidth)) {
							this.lineBaseWidth = 40;
						}
						relevant = true;
						break;
					}
					case "firstcolor":
					case "lastcolor": {
						relevant = true;
						break;
					}

					default:
						break;
				}
			}
			if (relevant == true) {
				this.CheckCanvas();
			}
		};
		this._mutationObserver = new MutationObserver(this._CheckMutations);
	}

	connectedCallback() {
		this.resizeObserver.observe(this);
		this.visibilityObserver.observe(this, { trackVisibility: true });
		this._mutationObserver.observe(this, { attributes: true });

		this.canvas = document.createElement("canvas");
		this.canvas.innerText = "Wave element failed to load";
		this.appendChild(this.canvas);

		// check mutations to initialise default values or existing values
		this._CheckMutations([
			{ type: "attributes", attributeName: "height" },
			{ type: "attributes", attributeName: "amount" },
			{ type: "attributes", attributeName: "lineminwidth" },
			{ type: "attributes", attributeName: "linemaxwidth" },
			{ type: "attributes", attributeName: "linebasewidth" },
		]);

		this.CheckCanvas();
	}

	CheckCanvas() {
		this.visible = this.checkVisibility();
		if (this.canvas.getContext) {
			const ctx = this.canvas.getContext("2d");
			this.Draw(ctx);
		} else {
			// canvas-unsupported code here
			this.removeChild(this.canvas);
		}
	}

	disconnectedCallback() {
		this.resizeObserver.disconnect();
		this.visibilityObserver.disconnect();
		this._mutationObserver.disconnect();
	}

	OnResize(width, height) {
		this.width = width;
		this.height = height;
		this.canvas.height = height;
		this.canvas.width = width;
		this.CheckCanvas();
	}

	VisibilityChanged() {
		this.CheckCanvas();
	}

	Draw(ctx) {
		if (this.visible == false) {
			return;
		}
		ctx.clearRect(0, 0, this.width, this.height);

		let amount = this.amountOfWaves;
		SetSeed(this.seed);
		let points = this.GeneratePoints(amount, 50, 200);

		if (!this.ValidatePoints(points)) {
			let wave = new WaveStruct(points, this.height);
			this.DrawWave(ctx, wave);
		}
	}

	DrawWave(ctx, wave) {
		ctx.beginPath();
		ctx.moveTo(wave.points[0].x, wave.points[0].y);

		for (let i = 1; i < wave.points.length; i++) {
			ctx.lineTo(
				wave.points[i].x,
				wave.points[i].y - wave.points[i].lineWidth,
			);
		}
		for (let i = wave.points.length - 1; i >= 0; i--) {
			ctx.lineTo(
				wave.points[i].x,
				wave.points[i].y + wave.points[i].lineWidth,
			);
		}

		ctx.closePath();

		const center = new Vector2(this.width / 2, this.height / 2);
		const offset = new Vector2(
			this.direction.x * this.width,
			this.direction.y * this.height,
		);
		const grad = ctx.createLinearGradient(
			center.x - offset.x,
			center.y - offset.y,
			center.x + offset.x,
			center.y + offset.y,
		);

		grad.addColorStop(0, this.getAttribute("firstcolor"));
		grad.addColorStop(1, this.getAttribute("lastcolor"));
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
		const centerY = this.height / 2;
		const centerX = this.width / 2;
		const lineMinWidth = this.PercentOfHeight(this.lineMinWidth);
		const lineMaxWidth = this.PercentOfHeight(this.lineMaxWidth);
		const lineBaseWidth = this.PercentOfHeight(this.lineBaseWidth);
		const flowDir = this.flowDir;
		const beginAndEndOffset = 200;

		let array = new Array(amount * 3 + 2);

		//#region Generating points and line weights
		let lw = RandomRange(lineMinWidth, lineMaxWidth);
		let variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, 0);
		let usedLw = lw + lineBaseWidth * variation;
		if (flowDir != 1) {
			usedLw += lineMaxWidth;
		}
		array[0] = new WavePoint(-beginAndEndOffset, centerY, usedLw);

		for (let i = 1; i < array.length - 1; i++) {
			lw = RandomRange(lineMinWidth, lineMaxWidth);

			let x = (this.width / array.length) * i;
			x += RandomRange(-variationX, variationX);

			variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, i);
			let y = this.GenerateYPosition(
				centerY,
				variation,
				array.length,
				(1 - variation) * variationY,
			);
			y = this.ClampYWithinBounds(y, lw);
			array[i] = new WavePoint(x, y, lw + lineBaseWidth * variation);
		}

		lw = RandomRange(lineMinWidth, lineMaxWidth);
		variation = this.GetTValueBasedOnDirFlow(array.length, flowDir, 0);
		usedLw = lw + lineBaseWidth * variation;
		if (flowDir == 1) {
			usedLw += array[array.length - 2].lineWidth;
		}

		array[array.length - 1] = new WavePoint(
			this.width + beginAndEndOffset,
			centerY,
			usedLw,
		);
		//#endregion

		for (let i = 0; i < array.length; i++) {
			let point = array[i];

			// ---- 1. Vertical scaling (around center) ----
			point.y = centerY + (point.y - centerY) * this.yScale;

			// ---- 2. Shear along Y following direction ----
			const normalizedX = (point.x - centerX) / centerX;
			const shearOffset =
				normalizedX * this.direction.y * this.shearStrength;

			point.y += shearOffset;

			point.y = this.ClampYWithinBounds(point.y, point.lineWidth);

			array[i] = point;
		}

		return array;
	}

	GetTValueBasedOnDirFlow(amount, flowDir, i) {
		if (flowDir == 1) {
			return (1 / amount) * i;
		} else {
			return (1 / amount) * (amount - i);
		}
	}

	GenerateYPosition(center, t, frequency, amplitude) {
		if (this.waveStyle) {
			return (
				center + Math.sin(frequency * t + this.phaseOffset) * amplitude
			);
		} else {
			return (
				center + Math.cos(frequency * t + this.phaseOffset) * amplitude
			);
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
			if (isNaN(element.x) || isNaN(element.y)) return true;
		}
		return false;
	}

	PercentOfHeight(val) {
		return this.height * (val / 100);
	}
}

customElements.define("wave-element", Wave);
