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

	const colorScale = d3.scaleOrdinal(d3.schemeSet3).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

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
		RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData,2,  true)
		runClams();
	
	}, []);

	
	const selectScatterplot = (e) => {
		if (e.target.value === "none") {
			RENDERER.initializeSplot(mainSvgSize, canvas, ctx);
			return;
		}
		data = require(`./pre_datasets/${e.target.value}`);
		normalizedData = UTILS.normalize(data, mainSvgSize, mainSvgMargin);
		RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData, 2, true);
		initiateClams();
		runClams();
	}

	const handleFileUpload = (e) =>{
		const file = e.target.files[0];
		if (file && file.type === 'application/json') {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const jsonContent = JSON.parse(e.target.result);
					data = JSON.parse(JSON.stringify(jsonContent));
					normalizedData = UTILS.normalize(jsonContent, mainSvgSize, mainSvgMargin);
					RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData, 2, true);
					initiateClams();
					runClams();
					
				} catch (error) {
					alert('Invalid JSON file');
				}
			};
			reader.readAsText(file);
		} else {
			alert('Please upload a JSON file');
		}
	}

	const initiateClams = () => {
		d3.select("#sepAmbSvg").selectAll("*").remove();
		d3.select("#sepMat").selectAll("*").remove();
		d3.select("#ambMat").selectAll("*").remove();
		document.getElementById("clamsGMMCanvas").getContext("2d").clearRect(0, 0, clamsViewSize, clamsViewSize);
		document.getElementById("ambDescriptionP").innerHTML = "";
	}

	const runClams = () => {
		smallNormalizedData = UTILS.normalize(data, clamsViewSize, clamsViewMargin);
		document.getElementById("loadingAlarm").style.visibility = "visible";
		document.getElementById("svgInput").disabled = true;
		document.getElementById("svgInput").style.cursor = "not-allowed";
		document.getElementById("uploadButtonDiv").style.opacity = "0.5";
		document.getElementById("uploadButtonDiv").style.cursor = "not-allowed";
		document.getElementById("svgPre").disabled = true;
		document.getElementById("svgPre").style.cursor = "not-allowed";
		// document.getElementById("svgSelect").disabled = true;
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
			document.getElementById("loadingAlarm").style.visibility = "hidden";
			document.getElementById("svgInput").disabled = false;
			document.getElementById("svgInput").style.cursor = "pointer";
			document.getElementById("uploadButtonDiv").style.opacity = "1";
			document.getElementById("uploadButtonDiv").style.cursor = "pointer";
			document.getElementById("svgPre").disabled = false;
			document.getElementById("svgPre").style.cursor = "pointer";
			CLAMSRENDERER.renderMat(document.getElementById("sepMat"), clamsViewSize, sepMat, colorScale, true);
			CLAMSRENDERER.renderMat(document.getElementById("ambMat"), clamsViewSize, ambMat, colorScale);
			RENDERER.initializeSplot(clamsViewSize, clamsCanvas, clamsCtx);
			covs = UTILS.decomposeCov(covs);
			RENDERER.drawSplot(clamsViewSize, clamsCanvas, clamsCtx, smallNormalizedData, 0.7);
			RENDERER.installLabels(labels);
			CLAMSRENDERER.renderGMM(clamsCanvas, clamsCtx, means, covs, colorScale, smallNormalizedData, ambiguity);
			CLAMSRENDERER.initiateSepAmbGraph(document.getElementById("sepAmbSvg"), clamsViewSize, clamsViewMargin);
			document.getElementById("ambDescriptionP").innerHTML = "The cluster ambiguity of the scatterplot is <b>" + ambiguity.toFixed(2) + "</b>.";
		}).catch((err) => {
			console.log(err)
			alert("Server is currently unavailable.")
		})

	}

  return (
    <div className="App">
			<h1>PLAY WITH CLAMS!!</h1>
			<div className="suppDiv">
				<h2>Supplemental material of the paper <b><i>CLAMS</i>: A Cluster Ambiguity Measure for Estimating Perceptual Variability in Visual Clustering</b></h2>
			</div>
			<p>
				In this demo, you will experience the functionality of <b>CLAMS</b>.
				You will observe the process of applying CLAMS
				to a scatterplot to measure cluster ambiguity.
				You can upload scatterplot data in JSON format or utilize the provided sample scatterplots
				through a drop-down menu.
				Once you have drawn or uploaded the scatterplot as desired,
				wait for seconds for CLAMS to compute cluster ambiguity.
			</p>

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
							
							<select id="svgPre" className="svgSelect" onChange={selectScatterplot}>
								{/* <option value="none">Select a Scatterplot</option> */}
								{datasetList.map((dataset, i) => (
									<option value={dataset} key={i}>{dataset}</option>
								))}
							</select>

						</div>
					</div>
				</div>
				<div id="clamsResultDiv">
					<div id="loadingAlarm" style={{ visibility: "hidden" }}>
						Computing CLAMS...
					</div>
					<div>
						<svg id="sepMat" className="mat" width={clamsViewSize} height={clamsViewSize}></svg>
						<svg id="ambMat" className="mat" width={clamsViewSize} height={clamsViewSize}></svg>
					</div>
					<div>
						<canvas id="clamsGMMCanvas" width={clamsViewSize} height={clamsViewSize}></canvas>
						<svg id="sepAmbSvg" width={clamsViewSize} height={clamsViewSize}></svg>
					</div>
					<div id="ambDescription">
						<p id="ambDescriptionP"></p>
					</div>

				</div>
			</div>

			<p>
				After you select or upload a scatterplot (default: t-SNE projection of Fashion MNIST)
				and CLAMS finish computing cluster ambiguity of the scatterplot, 
				You will see four visualizations depicting the intermediate results of CLAMS.
				In the lower right corner, you will see the same scatterplot along with the 
				Gaussian Mixture Model (GMM) fitted to the scatterplot. Different Gaussian components 
				are colored differently. Then, you can see the pairwise separability and ambiguity 
				of the Gaussian components in the heatmaps on the top row. The saturation of the cells 
				in the heatmaps indicates the pairwise separability and ambiguity of the Gaussian components
				corresponding to the row and column. The darker the color, the higher the scores.
			</p>
			<p>
				Note that by <b>hovering</b> the mouse over the cells in the heatmaps, 
				you can highlight the corresponding Gaussian components and data points in the scatterplot.
				Moreover, this will show the corresponding separability and ambiguity scores in the graph depicted in the lower right corner.
			</p>
    </div>
  );
}

export default App;
