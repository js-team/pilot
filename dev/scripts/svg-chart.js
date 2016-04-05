'use strict';

module.exports = SvgChart;

require('babel-polyfill');

var request = require('./request');
var lib = require('./calculate');
var progressBar = require('./progress-bar');

request();

function SvgChart(context) {
	this.options = {
		width: 320,
		height: 320,
		outerRadius: 160,
		innerRadius: 110,
		animDuration: 1000,
		delay: 500
	};
	this.init(context);
}
SvgChart.prototype = {
	init: function(context) {
		this.container = context;
		this.findElements();
		this.attachEvents();
	},
	findElements: function() {
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

		this.pathSumm = this.chartData.reduce(function(sum, current) {
			return sum + current.value;
		}, 0);

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
	},
	attachEvents: function() {
		var self = this;

		this.createSVG();
		this.createCircleHolder();
		this.createLineHolder();
		this.createStartButton();
		this.createInfoBox();

		this.chartData.forEach(function(item, i) {
			var path = document.createElementNS(self.svgns, 'path');
			path.setAttribute('fill', item.color);
			self.paths.push(path);
			self.circle.appendChild(path);
			self.rotateElement(self.circle, -90);

			var itemPromise = new Promise(function(resolve) {
				Promise.all(self.queue).then(function() {
					self.drawChart(item, resolve, i);
				});
			});

			self.queue.push(itemPromise);
		});

		this.progressBar = new progressBar(this.container);

		this.clickHandler = function() {
			self.startLevel();
		};

		this.mousemoveHandler = function(e) {
			self.rotateCircle(e);
		};

		this.startButton.addEventListener('click', this.clickHandler);
	},
	createSVG: function() {
		this.svg = document.createElementNS(this.svgns, 'svg');
		this.svg.setAttribute('width', this.options.width);
		this.svg.setAttribute('height', this.options.height);
		this.container.appendChild(this.svg);
	},
	createCircleHolder: function() {
		this.circle = document.createElementNS(this.svgns, 'g');
		this.svg.appendChild(this.circle);
	},
	createLineHolder: function() {
		this.lineHolder = document.createElementNS(this.svgns, 'g');
		this.svg.appendChild(this.lineHolder);
		this.rotateElement(this.lineHolder, 90);
	},
	createStartButton: function() {
		this.startButton = document.createElementNS(this.svgns, 'g');
		this.startButton.setAttribute('transform', 'translate(110, 80)');
		this.startButton.setAttribute('style', 'cursor: pointer');
		this.svg.appendChild(this.startButton);

		var rect = document.createElementNS(this.svgns, 'rect');
		rect.setAttribute('rx', 7);
		rect.setAttribute('ry', 7);
		rect.setAttribute('width', 100);
		rect.setAttribute('height', 30);
		rect.setAttribute('style', 'fill: #060;');
		this.startButton.appendChild(rect);

		var buttonText = document.createElementNS(this.svgns, 'text');
		buttonText.setAttribute('x', 50);
		buttonText.setAttribute('y', 20);
		buttonText.setAttribute('style', 'fill: #fff; font-size: 14px; line-height: 20px; text-anchor: middle;');
		this.startButton.appendChild(buttonText);

		var textNode = document.createTextNode('Start!');
		buttonText.appendChild(textNode);
	},
	createInfoBox: function() {
		var infoBox = document.createElementNS(this.svgns, 'text');
		infoBox.setAttribute('style', 'fill: #000; font-size: 14px; line-height: 20px; text-anchor: middle;');
		infoBox.setAttribute('x', this.options.width / 2);
		infoBox.setAttribute('y', this.options.height * (3 / 4));
		this.svg.appendChild(infoBox);

		this.infoText = document.createTextNode(this.levelCounter + ' Level');
		infoBox.appendChild(this.infoText);
	},
	drawLine: function() {
		this.lineAngle = lib.getRandomInt(0, 360);

		this.line = document.createElementNS(this.svgns, 'line');
		this.line.setAttribute('x1', this.options.width / 2);
		this.line.setAttribute('y1', this.options.width / 2);
		this.line.setAttribute('x2', this.options.width / 2);
		this.line.setAttribute('y2', 3);
		this.line.setAttribute('style', 'stroke: #0f497f; stroke-width: 6; stroke-linecap: round');
		this.rotateElement(this.line, this.lineAngle);
		this.lineHolder.appendChild(this.line);
	},
	startLevel: function() {
		var self = this;

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
	},
	completeGame: function(text) {
		this.svg.removeChild(this.startButton);
		this.lineHolder.removeChild(this.line);
		this.progressBar.resetProgress();
		this.rotateElement(this.circle, -90);
		this.infoText.textContent = text;
	},
	rotateElement: function(element, angle) {
		element.setAttribute('transform', 'rotate(' + angle + ', ' + this.options.width / 2 + ', ' + this.options.height / 2 + ')');
	},
	rotateCircle: function(e) {
		var self = this;
		var positionX = e.pageX - this.svg.getBoundingClientRect().left;
		var positionY = e.pageY - this.svg.getBoundingClientRect().top;
		var coordinateX = positionX - this.options.width / 2;
		var coordinateY = positionY - this.options.height / 2;
		var radians = Math.atan2(coordinateY, coordinateX);
		var rotateRadians = 0;

		if (radians.toString().indexOf('-') !== -1) {
			rotateRadians = (Math.PI * 2 + radians);
		} else {
			rotateRadians = radians;
		}

		var angle = lib.transformRadianToAngle(rotateRadians);

		this.rotateElement(this.circle, angle);

		if (angle - this.sectorAngle <= this.lineAngle && angle + this.sectorAngle >= this.lineAngle) {
			if (!this.timerState) {
				this.timerState = true;

				this.levelTimer = setTimeout(function() {
					clearInterval(self.timer);

					self.svg.removeEventListener('mousemove', self.mousemoveHandler);

					if (self.levelDuration > self.minLevelDuration) {
						self.infoText.textContent = 'Level complete!';
					} else {
						self.completeGame('You win!');
					}
				}, this.options.delay);
			}
		} else {
			clearTimeout(this.levelTimer);
			this.timerState = false;
		}
	},
	animateProgress: function() {
		var self = this;
		var counter = 0;

		var animate = function(time) {
			if (time < self.levelDuration) {
				var percents = lib.calculatePercents(time, self.levelDuration);

				self.progressBar.animProgress(percents);
			} else {
				clearInterval(self.timer);
				self.svg.removeEventListener('mousemove', self.mousemoveHandler);
				self.completeGame('Game over!');
			}
		};

		this.timer = setInterval(function() {
			counter += 16;
			animate(counter);
		}, 16);
	},
	drawChart: function(data, resolve, index) {
		var self = this;
		var endAngle = self.startAngle + lib.calculateAngle(data.value, this.pathSumm);

		var animatePath = function(time) {
			var angle = time * self.animSpeed;

			self.drawPath(lib.transformAngleToRadian(Math.min(endAngle, angle)), index);

			if (endAngle <= angle) {
				self.startAngle += lib.calculateAngle(data.value, self.pathSumm);

				if (index === 0) self.sectorAngle = self.startAngle;

				resolve();
				return;
			}

			requestAnimationFrame(animatePath);
		};

		requestAnimationFrame(animatePath);
	},
	drawPath: function(endAngle, index) {
		if (index === this.paths.length - 1) {
			this.isAnimating = false;
		}

		const { options: { outerRadius, innerRadius }} = this;

		var startAngle = lib.transformAngleToRadian(this.startAngle);
		var largeArc = ((endAngle - startAngle) % (Math.PI * 2) > Math.PI) ? 1 : 0;
		var startX = this.center.x + Math.cos(startAngle) * outerRadius;
		var startY = this.center.y + Math.sin(startAngle) * outerRadius;
		var endX2 = this.center.x + Math.cos(startAngle) * innerRadius;
		var endY2 = this.center.y + Math.sin(startAngle) * innerRadius;
		var endX = this.center.x + Math.cos(endAngle) * outerRadius;
		var endY = this.center.y + Math.sin(endAngle) * outerRadius;
		var startX2 = this.center.x + Math.cos(endAngle) * innerRadius;
		var startY2 = this.center.y + Math.sin(endAngle) * innerRadius;

		var cmd = [
			'M', startX, startY,
			'A', outerRadius, outerRadius, 0, largeArc, 1, endX, endY,
			'L', startX2, startY2,
			'A', innerRadius, innerRadius, 0, largeArc, 0, endX2, endY2,
			'Z'
		];

		this.paths[index].setAttribute('d', cmd.join(' '));
	}
};
