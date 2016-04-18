'use strict';

import {SvgChart as charts} from './svg-chart';

const initSvgChart = () => {
	[...document.querySelectorAll('.svg-chart')].forEach(function(item) {
		new charts(item);
	});
};

document.addEventListener('DOMContentLoaded', initSvgChart);