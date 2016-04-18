'use strict';

export const calculateAngle = (data, pathSumm) => (data * 100 / pathSumm) * 360 / 100;
export const calculatePercents = (time, duration) => Math.ceil(time * 100 / duration);
export const transformAngleToRadian = (angle) => Math.PI * angle / 180;
export const transformRadianToAngle = (radian) => radian * (180 / Math.PI);
export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
