'use strict';

import SvgChart from './svg-chart';

const initSvgChart = () => {
	[...document.querySelectorAll('.svg-chart')].forEach(item => new SvgChart(item));
};

document.addEventListener('DOMContentLoaded', initSvgChart);
