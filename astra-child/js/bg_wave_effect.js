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

	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	toArray(){
		return [{x: this.x, y: this.y}];
	}
}

class WaveElement extends HTMLElement {
	static observedAttributes = ["start_color", "end_color"];
    verticalPadding = 20;
    minPointDistance = 10;
    minPointAmount = 3;
    maxPointAmount = 5;
    waveSize;
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
        this.bottomPointsElements = Array(this.randomRange(this.minPointAmount, this.maxPointAmount));

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

    getRandomPoint(maxProcentX, minProcentY, array){
        while (true) {
            let foundPoint = new Vector2(this.randomRange(0, maxProcentX), minProcentY + this.randomRange(0, this.waveSize));
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
            this.edgePointsPercentage.top[i] = this.getRandomPoint(100 / (this.topPointsElements.length + 1) * (i + 1), 0, this.edgePointsPercentage.top);
        }
        for (let i = 0; i < this.edgePointsPercentage.bottom.length; i++) {
            this.edgePointsPercentage.bottom[i] = this.getRandomPoint(100 / (this.bottomPointsElements.length + 1) * (i + 1), 100, this.edgePointsPercentage.bottom);
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
                new Vector2(this.getEdgePointX(this.edgePointsPercentage.top[i].x / 100), this.getEdgePointY(this.edgePointsPercentage.top[i].y / 100, -1))
            )).sort((a, b) => this.sortBasedOnX(a, b)),
            bottom: Array(this.bottomPointsElements.length).fill(null).map((_, i) => (
                new Vector2(this.getEdgePointX(this.edgePointsPercentage.bottom[i].x / 100), this.getEdgePointY(this.edgePointsPercentage.bottom[i].y / 100))
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

		const pathData = points.map((point, index) => 
            {
                if (index === 0) return `M ${point.x},${point.y}`;
                return `L ${point.x},${point.y}`;
            }).join(' ') + "Z";

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