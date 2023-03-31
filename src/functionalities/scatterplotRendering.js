
export function initiateSplot(size, canvas, ctx) {
	ctx.clearRect(0, 0, size, size);
}

export function initializeSplot(size, canvas, ctx) {
	ctx.clearRect(0, 0, size, size);
}

export function drawSplot(size, canvas, ctx, data) {
	ctx.clearRect(0, 0, size, size);
	data.forEach(d => {
		// draw circle
		ctx.beginPath();
		ctx.arc(d[0], d[1], 2, 0, 2 * Math.PI);
		ctx.fillStyle = "black";
		ctx.fill();

		
	});
}