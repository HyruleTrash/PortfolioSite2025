"use-strict";

class Color {
	r = 0;
	g = 0;
	b = 0;
	a = 0;
	
	constructor(r, g, b, a){
		if (a => !isNaN(a) && a >= 0 && a <= 1)
			this.a = a;
		
		if (!this.isValidRgb([r,g,b]))
			return;
		
		this.r = r;
		this.g = g;
		this.b = b;
	}
	
	isValidRgb(values) {
	  	return values.every(val => !isNaN(val) && val >= 0 && val <= 255);
	}
}

class Vector2 {
	x = 0;
	y = 0;
    direction = {x: 0, y:0};

	constructor(x = 0, y = 0, direction = {x: 0, y: 0}){
		this.x = x;
		this.y = y;
        this.direction = direction;
	}

	toArray(){
		return [{x: this.x, y: this.y}];
	}

    normalize(){
        let magnitude = Math.sqrt(this.x*this.x + this.y*this.y);
        let result = new Vector2();
        if (magnitude > 0.00001) {  // Avoid division by zero
            result.x = this.x / magnitude;
            result.y = this.y / magnitude;
        }
        return result;
    }

    add(other){
        let result = new Vector2(this.x, this.y);
        result.x += other.x;
        result.y += other.y;
        return result;
    }

    muliply(other){
        let result = new Vector2(this.x, this.y);
        result.x *= other;
        result.y *= other;
        return result;
    }
}

class WaveElement extends HTMLElement {
	static observedAttributes = ["start_color", "end_color"];
    verticalPadding = 20;
    minPointDistance = 10;
    minPointAmount = 3;
    maxPointAmount = 5;
    waveSize;
    waveDirectionStrength = 50;
    waveOffsetStrength = 25;
	startColor;
	endColor;
	width = 0;
	height = 0;
	cornerPointsElements = Array(4);
    topPointsElements;
    bottomPointsElements;
    pathElement;

	constructor() {
		super();
		// Create shadow root for encapsulation
		const shadow = this.attachShadow({ mode: 'open' });

		// Retrieve start color
		this.startColor = this.parseRgba(this.getAttribute('start_color'));
		this.endColor = this.parseRgba(this.getAttribute('end_color'));

        // Retrieve wave size
        this.waveSize = this.parseNumber(this.getAttribute('wave_size'));
        this.verticalPadding += this.waveSize;
        this.verticalPadding += this.waveOffsetStrength;
		
		// Create SVG element
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute('width', '100%');
		this.svg.setAttribute('height', '100%');

        // Decouple from relative's
        this.style.width = this.offsetWidth + "px";
        this.style.height = this.offsetHeight + "px";
        this.style.left = this.clientLeft + "px";
        this.style.top = this.clientTop + "px";
        this.style.position = "absolute";

        // Generate random points along edges
        this.topPointsElements = Array(this.randomRange(this.minPointAmount, this.maxPointAmount));
        this.bottomPointsElements = Array(this.topPointsElements.length);

		// Add the wave to the shadow DOM
		shadow.appendChild(this.svg);

        // Create circles for points
        this.initializePoints();

        this.pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathElement.style.fill = 'none';
        this.pathElement.style.stroke = 'black';
        this.pathElement.style.strokeWidth = '1';
        this.svg.appendChild(this.pathElement);
		
		this.isAnimating = false;
	}

    initializePoints(){
        this.updateContentSize();
        this.updateCornerVectors();
        this.initializeEdgePoints();
        this.updateEdgePoints();
        
        for (let i = 0; i < this.cornerPointsElements.length; i++) {
			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute('cx', this.cornerPoints[i].x);
			circle.setAttribute('cy', this.cornerPoints[i].y);
			circle.setAttribute('r', '4');
			circle.style.fill = '#ff4444';
			this.svg.appendChild(circle);
            this.cornerPointsElements[i] = circle;
        }

        for (let i = 0; i < this.topPointsElements.length; i++) {
			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute('cx', this.edgePoints.top[i].x);
			circle.setAttribute('cy', this.edgePoints.top[i].y);
			circle.setAttribute('r', '4');
			circle.style.fill = '#ff4444';
			this.svg.appendChild(circle);
            this.topPointsElements[i] = circle;
        }
        for (let i = 0; i < this.bottomPointsElements.length; i++) {
			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute('cx', this.edgePoints.bottom[i].x);
			circle.setAttribute('cy', this.edgePoints.bottom[i].y);
			circle.setAttribute('r', '4');
			circle.style.fill = '#ff4444';
			this.svg.appendChild(circle);
            this.bottomPointsElements[i] = circle;
        }
    }

	randomRange(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	connectedCallback() {
		this.startAnimation();
	}

	disconnectedCallback() {
		this.stopAnimation();
	}

	startAnimation() {
		if (!this.isAnimating) {
			this.isAnimating = true;
			this.animate();
		}
	}

	stopAnimation() {
		this.isAnimating = false;
	}

	animate() {
		if (!this.isAnimating) return;
		
		this.updateShapeSize();
		this.createShape();

		// Request next frame
		requestAnimationFrame(() => this.animate());
	}

    updateCornerVectors(){
        this.cornerPoints = [
            new Vector2(0, this.verticalPadding),           // top-left
            new Vector2(this.width, this.verticalPadding),       // top-right
            new Vector2(this.width, this.height - this.verticalPadding),  // bottom-right
            new Vector2(0, this.height - this.verticalPadding)       // bottom-left
        ];
    }

    updateContentSize(){
		this.width = this.offsetWidth;
		this.height = this.offsetHeight;
    }

    getRandomPointX(maxProcentX, array){
        while (true) {
            let foundPoint = new Vector2(this.randomRange(0, maxProcentX), 0);
            let alone = true;
            for (let i = 0; i < array.length; i++) {
                const vector = array[i];
                if (vector === undefined)
                    continue;
                if (Math.abs(vector.x - foundPoint.x) <= this.minPointDistance){
                    alone = false;
                    break;
                }
            }
            if (alone)
                return foundPoint;
        }
    }

    initializeEdgePoints(){
        this.edgePointsPercentage = {
            top: Array(this.topPointsElements.length),
            bottom: Array(this.bottomPointsElements.length)
        };

        for (let i = 0; i < this.edgePointsPercentage.top.length; i++) {
            this.edgePointsPercentage.top[i] = this.getRandomPointX(100 / (this.topPointsElements.length + 1) * (i + 1), this.edgePointsPercentage.top);
            this.edgePointsPercentage.top[i].y = this.randomRange(0, this.waveSize);
        }
        for (let i = 0; i < this.edgePointsPercentage.bottom.length; i++) {
            this.edgePointsPercentage.bottom[i] = new Vector2(this.edgePointsPercentage.top[i].x, 100 + this.randomRange(0, this.waveSize));
        }

        let lastDir = 0;
        for (let i = 0; i < this.edgePointsPercentage.top.length; i++) {
            const point = this.edgePointsPercentage.top[i];
            const nextPoint = this.edgePointsPercentage.top[(i + 1) % this.edgePointsPercentage.top.length];
            const pointB = this.edgePointsPercentage.bottom[i];
            const nextPointB = this.edgePointsPercentage.bottom[(i + 1) % this.edgePointsPercentage.bottom.length];

            const cp = new Vector2(
                (point.x + nextPoint.x),
                (point.y + nextPoint.y)
            ).normalize();
            const cpB = new Vector2(
                (pointB.x + nextPointB.x),
                (pointB.y + nextPointB.y)
            ).normalize();

            if (lastDir == 0){
                if (this.randomRange(0, 1) >= 0.5)
                    lastDir = 1;
                else
                    lastDir = -1;
            }
            
            if (lastDir == 1){
                this.edgePointsPercentage.top[i].direction = new Vector2(-cp.y, cp.x).toArray()[0];
                this.edgePointsPercentage.bottom[i].direction = new Vector2(-cpB.y, cpB.x).toArray()[0];
            }
            else{
                this.edgePointsPercentage.top[i].direction = new Vector2(cp.y, -cp.x).toArray()[0];
                this.edgePointsPercentage.bottom[i].direction = new Vector2(cpB.y, -cpB.x).toArray()[0];
            }
            lastDir = -lastDir;
        }
    }

    getEdgePointX(percentage){
        return percentage * this.width;
    }

    getEdgePointY(percentage, verticalPaddingDir = 1){
        return (percentage * this.height) - this.verticalPadding * verticalPaddingDir;
    }

    sortBasedOnX(a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        return 0;
    }

    updateEdgePoints(){
        this.edgePoints = {
            top: Array(this.topPointsElements.length).fill(null).map((_, i) => (
                new Vector2(this.getEdgePointX(this.edgePointsPercentage.top[i].x / 100), this.getEdgePointY(this.edgePointsPercentage.top[i].y / 100, -1),
            this.edgePointsPercentage.top[i].direction)
            )).sort((a, b) => this.sortBasedOnX(a, b)),
            bottom: Array(this.bottomPointsElements.length).fill(null).map((_, i) => (
                new Vector2(this.getEdgePointX(this.edgePointsPercentage.bottom[i].x / 100), this.getEdgePointY(this.edgePointsPercentage.bottom[i].y / 100),
            this.edgePointsPercentage.bottom[i].direction)
            )).sort((a, b) => this.sortBasedOnX(a, b))
        };
    }

	updateShapeSize(){
		if (this.width == this.offsetWidth && this.height == this.offsetHeight)
			return;
		
        this.updateContentSize();
        this.updateCornerVectors();
		
        // update Point positions
        for (let i = 0; i < this.cornerPointsElements.length; i++) {
			this.cornerPointsElements[i].setAttribute('cx', this.cornerPoints[i].x);
			this.cornerPointsElements[i].setAttribute('cy', this.cornerPoints[i].y);
        }

        this.updateEdgePoints();

        for (let i = 0; i < this.topPointsElements.length; i++) {
			this.topPointsElements[i].setAttribute('cx', this.edgePoints.top[i].x);
			this.topPointsElements[i].setAttribute('cy', this.edgePoints.top[i].y);
        }
        for (let i = 0; i < this.bottomPointsElements.length; i++) {
			this.bottomPointsElements[i].setAttribute('cx', this.edgePoints.bottom[i].x);
			this.bottomPointsElements[i].setAttribute('cy', this.edgePoints.bottom[i].y);
        }
	}

	createShape() {
        // Create path with all points
        const points = [
            ...this.cornerPoints[0].toArray(),
            ...this.edgePoints.top,
            ...this.cornerPoints[1].toArray(),
            ...this.cornerPoints[2].toArray(),
            ...[...this.edgePoints.bottom].reverse(),
            ...this.cornerPoints[3].toArray()
        ];
        for (let i = 0; i < points.length; i++) {
            const prevPoint = points[(i - 1 + points.length) % points.length];
            const point = points[i];
            if (point.direction == undefined)
                continue;

			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const nextPoint = points[(i + 1) % points.length];
            const cp = new Vector2(
                (point.x + nextPoint.x) / 2,
                (point.y + nextPoint.y) / 2
            ).normalize().muliply(this.waveDirectionStrength).add(prevPoint).add(new Vector2(point.direction.x, point.direction.y).muliply(this.waveOffsetStrength));

			circle.setAttribute('cx', cp.x);
			circle.setAttribute('cy', cp.y);
			circle.setAttribute('r', '3');
			circle.style.fill = '#4444ff';
			this.svg.appendChild(circle);
        }

		let pathData = '';
        for (let i = 0; i < points.length; i++) {
            const prevPoint = points[(i - 1 + points.length) % points.length];
            const point = points[i];
            
            // Add command based on position
            if (i === 0) {
                pathData += `M ${point.x},${point.y} `;
                continue;
            }

            const nextPoint = points[(i + 1) % points.length];
            if (point.direction == undefined){
                pathData += `L ${point.x},${point.y} `;
                continue;
            }
            
            // Calculate control points for curves
            const cp = new Vector2(
                (point.x + nextPoint.x) / 2,
                (point.y + nextPoint.y) / 2
            ).normalize().muliply(this.waveDirectionStrength).add(prevPoint).add(new Vector2(point.direction.x, point.direction.y).muliply(this.waveOffsetStrength));
            pathData += `Q ${cp.x},${cp.y} ${point.x},${point.y} `;
        }
        pathData += 'Z';

        this.pathElement.setAttribute('d', pathData);
    }
	
	parseRgba(value) {
		if (value == null)
			return null;
		const [r, g, b, a] = value.split(',').map(Number);
		return new Color(r, g, b, a);
	}

    parseNumber(value){
        return Number(value) || 0;
    }
}

customElements.define('wave-svg-element', WaveElement);