'use strict';

import {SvgChart as charts} from './svg-chart';

const initSvgChart = () => {
	let holder = document.querySelectorAll('.svg-chart');

	[...holder].forEach(function(item) {
		new charts(item);
	});
};

document.addEventListener('DOMContentLoaded', initSvgChart);