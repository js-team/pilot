'use strict';

function ProgressBar(holder) {
	var canvas = document.createElement('canvas');

	canvas.setAttribute('width', 320);
	canvas.setAttribute('height', 20);
	holder.appendChild(canvas);

	var ctx = canvas.getContext('2d');
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	function drawHolder() {
		ctx.beginPath();
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(1, 1, canvasWidth - 2, canvasHeight - 2);
		ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
	}

	drawHolder();

	return {
		animProgress: function(percent) {
			ctx.beginPath();
			ctx.fillStyle = '#09b646';
			ctx.fillRect(1, 1, (canvasWidth * percent / 100) - 2, canvasHeight - 2);
		},
		resetProgress: function() {
			ctx.clearRect(1, 1, canvasWidth - 2, canvasHeight - 2);
			drawHolder();
		}
	};
}

module.exports = ProgressBar;
