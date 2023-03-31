import * as d3 from 'd3';

export function normalize(data, size, margin ) {
	const minX = Math.min(...data.map(d => d[0]));
	const maxX = Math.max(...data.map(d => d[0]));
	const minY = Math.min(...data.map(d => d[1]));
	const maxY = Math.max(...data.map(d => d[1]));

	const xScale = d3.scaleLinear().domain([minX, maxX]).range([margin, size - margin]);
	const yScale = d3.scaleLinear().domain([minY, maxY]).range([size - margin, margin]);

	return data.map(d => [xScale(d[0]), yScale(d[1])]);

}