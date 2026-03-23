"use strict";

import { Wave } from "./Wave.js";

/**
 * Moving version of wave, takes in a speed value to offset the wavephase
 *
 * @export
 * @class MovingWave
 * @typedef {MovingWave}
 * @extends {Wave}
 */
export class MovingWave extends Wave {
	constructor() {
		super();
		this.lastTime = 1;
		this.Loop = this.Loop.bind(this);
		
		this.speed = 1;
		this.CheckMutations = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type !== "attributes") {
					continue;
				}
				if (mutation.attributeName == "speed") {
					this.speed = this.getAttribute("speed");
					if (isNaN(this.speed)) {
						this.speed = 1;
					}
				}
			}
		};
		this.mutationObserver = new MutationObserver(this.CheckMutations);
	}

	Loop(currentTime) {
		// currentTime is in milliseconds
		const deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
		this.lastTime = currentTime;

		this.Update(deltaTime);

		// console.log(this.phaseOffset);

		this.CheckCanvas();
		requestAnimationFrame(this.Loop);
	}

	Update(dt) {
		if (this.visable == false) {
			return;
		}

		this.phaseOffset += dt * this.speed;
	}

	connectedCallback() {
		super.connectedCallback();

		this.CheckMutations([
			{ type: "attributes", attributeName: "speed" },
		]);
		requestAnimationFrame(this.Loop);
	}
}

customElements.define("moving-wave-element", MovingWave);