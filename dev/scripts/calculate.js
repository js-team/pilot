'use strict';

module.exports = {
	calculateAngle: function(data, pathSumm) {
		return (data * 100 / pathSumm) * 360 / 100;
	},
	calculatePercents: function(time, duration) {
		return Math.ceil(time * 100 / duration);
	},
	transformAngleToRadian: function(angle) {
		return Math.PI * angle / 180;
	},
	transformRadianToAngle: function(radian) {
		return radian * (180 / Math.PI);
	},
	getRandomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};
