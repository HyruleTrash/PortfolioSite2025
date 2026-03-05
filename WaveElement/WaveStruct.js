"use strict";

import { WavePoint } from "./WavePoint.js";

/**
 * A class used for holding a point list and bezier curving the points you give it
 *
 * @class WaveStruct
 * @typedef {WaveStruct}
 */
 
export class WaveStruct {
    constructor(givenPoints, height, resolution = 200) {
        this.height = height;
        this.controlPoints = givenPoints;
        this.points = [];

        if (!givenPoints || givenPoints.length < 2) return;

        let tempPoints = [];
        for (let i = 0; i <= resolution; i++) {
            const t = i / resolution;
            tempPoints.push(this.#ClampPoint(this.#BezierPoint(t)));
        }

        this.points.push(tempPoints[0]);
        let lastPoint = tempPoints[0];
        const dist = 10;
        tempPoints.forEach((tempPoint) => {
            if (tempPoint.GetDist(lastPoint) > dist) {
                lastPoint = tempPoint;
                this.points.push(tempPoint);
            }
        });
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
        return (
            this.#Factorial(n) / (this.#Factorial(k) * this.#Factorial(n - k))
        );
    }

    #Factorial(n) {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    #ClampPoint(point) {
        const min = point.lineWidth;
        const max = this.height - point.lineWidth; // we need height

        if (point.y < min) point.y = min;
        if (point.y > max) point.y = max;

        return point;
    }
}