import { useEffect } from 'react';
import './App.css';
import * as RENDERER from './functionalities/scatterplotRendering';
import * as UTILS from './functionalities/utils';


function App() {

	const mainSvgSize = 600;
	const mainSvgMargin = 30;
	const datasetList = require("./dataset_list.json");
	let canvas, ctx;

	let normalizedData = null;

	useEffect(() => {
		canvas = document.getElementById("mainCanvas");
		ctx = canvas.getContext("2d");
		RENDERER.initiateSplot(mainSvgSize, canvas, ctx);
	}, []);

	
	const selectScatterplot = (e) => {
		const data = require(`./pre_datasets/${e.target.value}`);
		normalizedData = UTILS.normalize(data, mainSvgSize, mainSvgMargin);
		RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData)
	}


  return (
    <div className="App">
			<h1>CLAMS DEMO</h1>
			<div className="suppDiv">
				<h2>Supplemental material of the paper <b><i>CLAMS</i>: A Cluster Ambiguity Measure for Estimating Perceptual Variability in Visual Clustering</b></h2>
			</div>

			<div id="mainSvgDiv">
				<canvas id="mainCanvas" width={mainSvgSize} height={mainSvgSize}></canvas>
				<div id="mainSvgButtonDiv">
					<button id="startDrawing" className="svgButton">Start Drawing!!</button>
					<button id="uploadButton" className="svgButton">Upload JSON dataset</button>
					<select className="svgSelect" onChange={selectScatterplot}>
						<option value="none">Select a Scatterplot</option>
						{datasetList.map((dataset, i) => (
							<option value={dataset} key={i}>{dataset}</option>
						))}
					</select>
					<button id="initializeButton" className="svgButton">Initialize!!</button>
				</div>
			</div>
			<p>
				In this demo, you will experience the functionality of <b>CLAMS</b>. 
				Specifically, you will observe the process of applying CLAMS 
				to a scatterplot to measure cluster ambiguity. 
				You can draw a scatterplot by adding Gaussian distributions yourself, 
				upload scatterplot data in JSON format, 
				or utilize the provided sample scatterplots.
				Once you have drawn or uploaded the scatterplot as desired, 
				press the 'run CLAMS' button to measure cluster ambiguity.</p>
    </div>
  );
}

export default App;
