import { useEffect } from 'react';
import './App.css';
import * as RENDERER from './functionalities/scatterplotRendering';
import * as UTILS from './functionalities/utils';
import axios from 'axios';
import * as CLAMSRENDERER from './functionalities/clamsResultRendering';
import * as d3 from 'd3';


function App() {

	const mainSvgSize = 500;
	const mainSvgMargin = 30;
	const clamsViewSize = mainSvgSize / 2;
	const clamsViewMargin = mainSvgMargin / 1.2;
	const datasetList = require("./dataset_list.json");
	let canvas, ctx;
	let clamsCanvas, clamsCtx;

	const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

	const SERVER_URL = "http://147.46.242.161:9999"

	// data
	let data = null;
	let normalizedData = null;
	let smallNormalizedData = null;
	let sepMat = null;
	let ambMat = null;
	let means = null;
	let covs= null;
	let ambiguity = null;
	let labels = null;

	let useEffectRunOnce = false;

	useEffect(() => {
		if (useEffectRunOnce) {return;}
		useEffectRunOnce = true;
		canvas = document.getElementById("mainCanvas");
		ctx = canvas.getContext("2d");
		clamsCanvas = document.getElementById("clamsGMMCanvas");
		clamsCtx = clamsCanvas.getContext("2d");
		RENDERER.initiateSplot(mainSvgSize, canvas, ctx);
		RENDERER.initiateSplot(clamsViewSize, clamsCanvas, clamsCtx);

		// load initial data
		const datasetName = document.getElementsByClassName("svgSelect")[0].value 
		data = require(`./pre_datasets/${datasetName}`);
		normalizedData = UTILS.normalize(data, mainSvgSize, mainSvgMargin);
		RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData)
		runClams();
	
	}, []);

	
	const selectScatterplot = (e) => {
		if (e.target.value === "none") {
			RENDERER.initializeSplot(mainSvgSize, canvas, ctx);
			return;
		}
		const data = require(`./pre_datasets/${e.target.value}`);
		normalizedData = UTILS.normalize(data, mainSvgSize, mainSvgMargin);
		RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData)
	}

	const handleFileUpload = (e) =>{
		const file = e.target.files[0];
		if (file && file.type === 'application/json') {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const jsonContent = JSON.parse(e.target.result);
					normalizedData = UTILS.normalize(jsonContent, mainSvgSize, mainSvgMargin);
					RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData);
					
				} catch (error) {
					alert('Invalid JSON file');
				}
			};
			reader.readAsText(file);
		} else {
			alert('Please upload a JSON file');
		}
	}

	const runClams = () => {
		smallNormalizedData = UTILS.normalize(data, clamsViewSize, clamsViewMargin);
		axios.post(`${SERVER_URL}/clams`, {
			data: smallNormalizedData
		}).then((res) => {
			const responseParseResult = UTILS.extractAmbDataFromResponse(res);
			ambiguity = responseParseResult.ambiguity;
			sepMat = responseParseResult.sepMat;
			ambMat = responseParseResult.ambMat;
			means  = responseParseResult.means;
			covs   = responseParseResult.covs;
			labels = UTILS.extractLabels(responseParseResult.proba);
			CLAMSRENDERER.renderMat(document.getElementById("sepMat"), clamsViewSize, sepMat, colorScale);
			CLAMSRENDERER.renderMat(document.getElementById("ambMat"), clamsViewSize, ambMat, colorScale);
			RENDERER.initializeSplot(clamsViewSize, clamsCanvas, clamsCtx);
			covs = UTILS.decomposeCov(covs);
			RENDERER.drawSplot(clamsViewSize, clamsCanvas, clamsCtx, smallNormalizedData, 0.7);
			CLAMSRENDERER.renderGMM(clamsCanvas, clamsCtx, means, covs, colorScale, smallNormalizedData);
			CLAMSRENDERER.initiateSepAmbGraph(document.getElementById("sepAmbSvg"), clamsViewSize, clamsViewMargin);
		}).catch((err) => {
			console.log(err)
			alert("Server is currently unavailable.")
		})

	}

  return (
    <div className="App">
			<h1>CLAMS DEMO</h1>
			<div className="suppDiv">
				<h2>Supplemental material of the paper <b><i>CLAMS</i>: A Cluster Ambiguity Measure for Estimating Perceptual Variability in Visual Clustering</b></h2>
			</div>

			<div id="mainSvgDiv">
				<div id="mainCanvasDiv">
					<canvas id="mainCanvas" width={mainSvgSize} height={mainSvgSize}></canvas>
					<div >
						{/* <button id="uploadButton" className="svgButton">Upload JSON dataset</button> */}
						<div id="mainSvgButtonDiv">
							<label htmlFor="svgInput">
								<div id="uploadButtonDiv">
									Upload JSON DATASET
								</div>
								<input id="svgInput" type="file" accept=".json" onChange={handleFileUpload} />
							</label>
							
							<select className="svgSelect" onChange={selectScatterplot}>
								{/* <option value="none">Select a Scatterplot</option> */}
								{datasetList.map((dataset, i) => (
									<option value={dataset} key={i}>{dataset}</option>
								))}
							</select>
							<button id="initializeButton" className="svgButton">Reset!!</button>

						</div>
					</div>
				</div>
				<div id="clamsResultDiv">
					<div>
						<svg id="sepMat" className="mat" width={clamsViewSize} height={clamsViewSize}></svg>
						<svg id="ambMat" className="mat" width={clamsViewSize} height={clamsViewSize}></svg>
					</div>
					<div>
						<canvas id="clamsGMMCanvas" width={clamsViewSize} height={clamsViewSize}></canvas>
						<svg id="sepAmbSvg" width={clamsViewSize} height={clamsViewSize}></svg>
					</div>
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
