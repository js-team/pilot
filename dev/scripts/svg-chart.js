'use strict';

require('window.requestAnimationFrame');

import * as lib from './calculate';
import ProgressBar from './progress-bar';

export class SvgChart {
	constructor(context) {
		this.options = {
			width: 320,
			height: 320,
			outerRadius: 160,
			innerRadius: 110,
			animDuration: 1000,
			stepDuration: 16,
			delay: 500
		};

		this.init(context);
	}

	init(context) {
		this.container = context;
		this.findElements();
		this.attachEvents();
	}

	findElements() {
		this.dataSrc = this.container.getAttribute('data-values');
		this.chartData = JSON.parse(this.dataSrc);
		this.dataAnimDuration = this.container.getAttribute('data-level-duration');
		this.levelDuration = JSON.parse(this.dataAnimDuration);
		this.dataMinLevelDuration = this.container.getAttribute('data-min-level-duration');
		this.minLevelDuration = JSON.parse(this.dataMinLevelDuration);
		this.dataLevelStep = this.container.getAttribute('data-level-step');
		this.levelStep = JSON.parse(this.dataLevelStep);
		this.svgns = 'http://www.w3.org/2000/svg';

		this.center = {
			x: this.options.width / 2,
			y: this.options.height / 2
		};

		this.pathSumm = this.chartData.reduce((sum, current) => sum + current.value, 0);

		this.startAngle = 0;
		this.animSpeed = 360 / this.options.animDuration;
		this.isAnimating = true;
		this.timerState = false;
		this.queue = [];
		this.paths = [];
		this.levelCounter = 1;
		this.sectorAngle = 0;
		this.levelTimer = null;
		this.timer = null;
	}

	attachEvents() {
		this.createSVG();
		this.createCircleHolder();
		this.createLineHolder();
		this.createStartButton();
		this.createInfoBox();

		this.chartData.forEach((item, i) => {
			let path = document.createElementNS(this.svgns, 'path');
			path.setAttribute('fill', item.color);
			this.paths.push(path);
			this.circle.appendChild(path);
			this.rotateElement(this.circle, -90);

			let itemPromise = new Promise(resolve => {
				Promise.all(this.queue).then(() => {
					this.drawChart(item, resolve, i);
				});
			});

			this.queue.push(itemPromise);
		});

		this.progressBar = new ProgressBar(this.container);

		this.clickHandler = () => this.startLevel();
		this.mousemoveHandler = (e) => this.rotateCircle(e);

		this.startButton.addEventListener('click', this.clickHandler);
	}

	createSVG() {
		this.svg = document.createElementNS(this.svgns, 'svg');
		this.svg.setAttribute('width', this.options.width);
		this.svg.setAttribute('height', this.options.height);
		this.container.appendChild(this.svg);
	}

	createCircleHolder() {
		this.circle = document.createElementNS(this.svgns, 'g');
		this.svg.appendChild(this.circle);
	}

	createLineHolder() {
		this.lineHolder = document.createElementNS(this.svgns, 'g');
		this.svg.appendChild(this.lineHolder);
		this.rotateElement(this.lineHolder, 90);
	}

	createStartButton() {
		this.startButton = document.createElementNS(this.svgns, 'g');
		this.startButton.setAttribute('transform', 'translate(110, 80)');
		this.startButton.setAttribute('style', 'cursor: pointer');
		this.svg.appendChild(this.startButton);

		let rect = document.createElementNS(this.svgns, 'rect');
		rect.setAttribute('rx', 7);
		rect.setAttribute('ry', 7);
		rect.setAttribute('width', 100);
		rect.setAttribute('height', 30);
		rect.setAttribute('style', 'fill: #060;');
		this.startButton.appendChild(rect);

		let buttonText = document.createElementNS(this.svgns, 'text');
		buttonText.setAttribute('x', 50);
		buttonText.setAttribute('y', 20);
		buttonText.setAttribute('style', 'fill: #fff; font-size: 14px; line-height: 20px; text-anchor: middle;');
		this.startButton.appendChild(buttonText);

		let textNode = document.createTextNode('Start!');
		buttonText.appendChild(textNode);
	}

	createInfoBox() {
		let infoBox = document.createElementNS(this.svgns, 'text');
		infoBox.setAttribute('style', 'fill: #000; font-size: 14px; line-height: 20px; text-anchor: middle;');
		infoBox.setAttribute('x', this.options.width / 2);
		infoBox.setAttribute('y', this.options.height * (3 / 4));
		this.svg.appendChild(infoBox);

		this.infoText = document.createTextNode(this.levelCounter + ' Level');
		infoBox.appendChild(this.infoText);
	}

	drawLine() {
		this.lineAngle = lib.getRandomInt(0, 360);

		this.line = document.createElementNS(this.svgns, 'line');
		this.line.setAttribute('x1', this.options.width / 2);
		this.line.setAttribute('y1', this.options.width / 2);
		this.line.setAttribute('x2', this.options.width / 2);
		this.line.setAttribute('y2', 3);
		this.line.setAttribute('style', 'stroke: #0f497f; stroke-width: 6; stroke-linecap: round');
		this.rotateElement(this.line, this.lineAngle);
		this.lineHolder.appendChild(this.line);
	}

	startLevel() {
		if (this.isAnimating) return;
		if (this.line) this.lineHolder.removeChild(this.line);

		this.progressBar.resetProgress();
		this.timerState = false;

		if (this.levelDuration > this.minLevelDuration) {
			this.levelDuration -= this.levelStep;
			this.infoText.textContent = this.levelCounter + ' Level';
			this.levelCounter++;
			this.drawLine();
			this.animateProgress();

			this.svg.addEventListener('mousemove', this.mousemoveHandler);
		}
	}

	completeGame(text) {
		this.svg.removeChild(this.startButton);
		this.lineHolder.removeChild(this.line);
		this.progressBar.resetProgress();
		this.rotateElement(this.circle, -90);
		this.infoText.textContent = text;
	}

	rotateElement(element, angle) {
		element.setAttribute('transform', 'rotate(' + angle + ', ' + this.options.width / 2 + ', ' + this.options.height / 2 + ')');
	}

	rotateCircle(e) {
		let positionX = e.pageX - this.svg.getBoundingClientRect().left;
		let positionY = e.pageY - this.svg.getBoundingClientRect().top;
		let coordinateX = positionX - this.options.width / 2;
		let coordinateY = positionY - this.options.height / 2;
		let radians = Math.atan2(coordinateY, coordinateX);
		let rotateRadians = 0;

		radians.toString().indexOf('-') !== -1 ? rotateRadians = (Math.PI * 2 + radians) : rotateRadians = radians;

		let angle = lib.transformRadianToAngle(rotateRadians);

		this.rotateElement(this.circle, angle);

		if (angle - this.sectorAngle <= this.lineAngle && angle + this.sectorAngle >= this.lineAngle) {
			if (!this.timerState) {
				this.timerState = true;

				this.levelTimer = setTimeout(() => {
					clearInterval(this.timer);

					this.svg.removeEventListener('mousemove', this.mousemoveHandler);

					if (this.levelDuration > this.minLevelDuration) {
						this.infoText.textContent = 'Level complete!';
					} else {
						this.completeGame('You win!');
					}
				}, this.options.delay);
			}
		} else {
			clearTimeout(this.levelTimer);
			this.timerState = false;
		}
	}

	animateProgress() {
		let counter = 0;

		const animate = time => {
			if (time < this.levelDuration) {
				let percents = lib.calculatePercents(time, this.levelDuration);

				this.progressBar.animProgress(percents);
			} else {
				clearInterval(this.timer);
				this.svg.removeEventListener('mousemove', this.mousemoveHandler);
				this.completeGame('Game over!');
			}
		};

		this.timer = setInterval(() => {
			counter += this.options.stepDuration;
			animate(counter);
		}, this.options.stepDuration);
	}

	drawChart(data, resolve, index) {
		let endAngle = this.startAngle + lib.calculateAngle(data.value, this.pathSumm);

		const animatePath = time => {
			let angle = time * this.animSpeed;

			this.drawPath(lib.transformAngleToRadian(Math.min(endAngle, angle)), index);

			if (endAngle <= angle) {
				this.startAngle += lib.calculateAngle(data.value, this.pathSumm);

				if (index === 0) this.sectorAngle = this.startAngle;

				resolve();
				return;
			}

			requestAnimationFrame(animatePath);
		};

		requestAnimationFrame(animatePath);
	}

	drawPath(endAngle, index) {
		if (index === this.paths.length - 1) {
			this.isAnimating = false;
		}

		const {options: {outerRadius, innerRadius}} = this;

		let startAngle = lib.transformAngleToRadian(this.startAngle);
		let largeArc = ((endAngle - startAngle) % (Math.PI * 2) > Math.PI) ? 1 : 0;
		let startX = this.center.x + Math.cos(startAngle) * outerRadius;
		let startY = this.center.y + Math.sin(startAngle) * outerRadius;
		let endX2 = this.center.x + Math.cos(startAngle) * innerRadius;
		let endY2 = this.center.y + Math.sin(startAngle) * innerRadius;
		let endX = this.center.x + Math.cos(endAngle) * outerRadius;
		let endY = this.center.y + Math.sin(endAngle) * outerRadius;
		let startX2 = this.center.x + Math.cos(endAngle) * innerRadius;
		let startY2 = this.center.y + Math.sin(endAngle) * innerRadius;

		const cmd = [
			'M', startX, startY,
			'A', outerRadius, outerRadius, 0, largeArc, 1, endX, endY,
			'L', startX2, startY2,
			'A', innerRadius, innerRadius, 0, largeArc, 0, endX2, endY2,
			'Z'
		];

		this.paths[index].setAttribute('d', cmd.join(' '));
	}
}
