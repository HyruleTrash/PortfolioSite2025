"use-strict";

import { RandomRange, Vector2 } from "./Math.js";

export class Wave extends HTMLElement {
  constructor() {
    super();

    this._ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.onResize(width, height);
      }
    });
  }

  connectedCallback() {
    this._ro.observe(this);

    const amount = this.getAttribute("height");
    this.height = parseInt(amount); // assuming pixels
    
    if (!isNaN(this.height)){
        this.style.height = this.height + "px";
    }

    this.canvas = document.createElement("canvas");
    this.canvas.innerText = "Wave element failed to load"
    this.appendChild(this.canvas);

    if (!this.canvas.getContext) {
        // canvas-unsupported code here
        this.removeChild(this.canvas)
    }else{
        const ctx = this.canvas.getContext("2d");
        this.Draw(ctx);
    }
  }

  disconnectedCallback() {
    this._ro.disconnect();
  }

  onResize(width, height) {
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

  Draw(ctx){
    ctx.fillStyle = "rgb(200 0 0)";
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = "rgb(0 0 200)";

    let amount = 5;
    let points = this.GeneratePoints(amount, 50, 50);
    
    for (let i = 0; i < points.length - 1; i++) {
        let firstPoint = points[i];
        let secondPoint = points[i + 1];
        ctx.beginPath();
        ctx.moveTo(Math.round(firstPoint.x),    Math.round(firstPoint.y - firstPoint.lineWidth));
        ctx.lineTo(Math.round(secondPoint.x),   Math.round(secondPoint.y - secondPoint.lineWidth));
        ctx.lineTo(Math.round(secondPoint.x),   Math.round(secondPoint.y + secondPoint.lineWidth));
        ctx.lineTo(Math.round(firstPoint.x),    Math.round(firstPoint.y + firstPoint.lineWidth));
        ctx.closePath();
        ctx.fill();
    }
  }

  GeneratePoints(amount, variationX, variationY){
    let array = new Array(amount + 2);

    let lineMinWidth = this.PercentOfHeight(5);
    let lineMaxWidth = this.PercentOfHeight(20);

    let lw = RandomRange(lineMinWidth, lineMaxWidth);
    array[0] = new Vector2(0, this.GenerateYPosition(variationY, lw));
    array[0].lineWidth = lw;
    for (let i = 1; i < array.length - 1; i++) {
        let x = this.width / amount * i;
        x += RandomRange(-variationX, variationX);

        lw = RandomRange(lineMinWidth, lineMaxWidth);
        array[i] = new Vector2(x, this.GenerateYPosition(variationY, lw));
        array[i].lineWidth = lw;
    }
    
    lw = RandomRange(lineMinWidth, lineMaxWidth);
    array[amount + 1] = new Vector2(this.width, this.GenerateYPosition(variationY, lw));
    array[amount + 1].lineWidth = lw;

    return array;
  }

  GenerateYPosition(variation, lineWidth = 0){
    const center = this.height / 2;
    const varPx = this.PercentOfHeight(variation);

    const min = center - varPx + lineWidth;
    const max = center + varPx - lineWidth;

    return RandomRange(min, max);
  }

  PercentOfHeight(val){
    return this.height * (val / 100)
  }
}

customElements.define("wave-element", Wave);