"use strict";

function createSeededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function TimeSeed() {
  // current time in ms
  let x = Date.now();

  // mix bits (xorshift-style avalanche)
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;

  return x >>> 0; // force unsigned 32-bit
}

var seededRandom = createSeededRandom(12345);

export function SetSeed(seed){
    seededRandom = createSeededRandom(seed);
}

export function RandomRange(min, max) {
  return seededRandom() * (max - min) + min;
}

export class Vector2 {
	x = 0;
	y = 0;

	constructor(a = 0, b = 0){
        if (a instanceof Vector2){
            this.x = a.x;
            this.y = a.y;
        }else{
            this.x = a;
            this.y = b;
        }
	}

	ToArray(){
		return [this.ToObject()];
	}

    ToObject(){
        return {x: this.x, y: this.y};
    }

    Normalize(){
        let magnitude = Math.sqrt(this.x*this.x + this.y*this.y);
        let result = new Vector2();
        if (magnitude > 0.00001) {  // Avoid division by zero
            result.x = this.x / magnitude;
            result.y = this.y / magnitude;
        }
        return result;
    }

    Add(other){
        let result = new Vector2(this);
        result.x += other.x;
        result.y += other.y;
        return result;
    }

    Multiply(a){
        let result = new Vector2(this);
        if (a instanceof Vector2){
            result.x *= a.x;
            result.y *= a.y;
        }else{
            result.x *= a;
            result.y *= a;
        }
        return result;
    }

    ToNegative(){
        let result = new Vector2(this);
        result.x = -result.x;
        result.y = -result.y;
        return result;
    }

    GetDist(other){
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    GetDirTowards(other){
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const magnitude = Math.sqrt(dx*dx + dy*dy);
        if (magnitude == 0)
            return new Vector2(0, 0);
        return new Vector2(dx/magnitude, dy/magnitude);
    }

    GetDiff(other){
        return new Vector2(other.x - this.x, other.y - this.y);
    }

    GetMag(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    toString(){
        return `[${this.x}, ${this.y}]`;
    }
}