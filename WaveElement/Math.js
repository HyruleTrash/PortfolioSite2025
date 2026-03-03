"use-strict";

export function RandomRange(min, max) {
  return Math.random() * (max - min) + min;
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