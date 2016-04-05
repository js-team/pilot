'use strict';

var charts = require('./svg-chart');
const initSvgChart = () => {
	var holder = document.querySelectorAll('.svg-chart');

	[ ...holder ].forEach(function(item) {
		new charts(item);
	});
};

document.addEventListener('DOMContentLoaded', initSvgChart);


