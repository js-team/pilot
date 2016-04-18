'use strict';

export default function ProgressBar(holder) {
	const canvas = document.createElement('canvas');

	canvas.setAttribute('width', 320);
	canvas.setAttribute('height', 20);
	holder.appendChild(canvas);

	let ctx = canvas.getContext('2d');
	let canvasWidth = canvas.width;
	let canvasHeight = canvas.height;

	function drawHolder() {
		ctx.beginPath();
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(1, 1, canvasWidth - 2, canvasHeight - 2);
		ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
	}

	drawHolder();

	return {
		animProgress: percent => {
			ctx.beginPath();
			ctx.fillStyle = '#09b646';
			ctx.fillRect(1, 1, (canvasWidth * percent / 100) - 2, canvasHeight - 2);
		},
		resetProgress: () => {
			ctx.clearRect(1, 1, canvasWidth - 2, canvasHeight - 2);
			drawHolder();
		}
	};
}
