"use-strict";

export function RandomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export class Vector2 {
	x = 0;
	y = 0;
    dir = null;
    lineWidth = null;

	constructor(x = 0, y = 0, direction = null, lineWidth = null){
		this.x = x;
		this.y = y;
        this.dir = direction;
        this.lineWidth = lineWidth;
	}

	ToArray(){
		return [this.ToObject()];
	}

    ToObject(){
        return {x: this.x, y: this.y, direction: this.dir == null ? undefined : this.dir.toObject(), lineWidth: this.lineWidth};
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
        let result = new Vector2(this.x, this.y);
        result.x += other.x;
        result.y += other.y;
        return result;
    }

    Multiply(other){
        let result = new Vector2(this.x, this.y);
        result.x *= other;
        result.y *= other;
        return result;
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
}