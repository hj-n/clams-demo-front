import { useEffect } from 'react';
import './App.css';
import * as RENDERER from './functionalities/scatterplotRendering';
import * as UTILS from './functionalities/utils';


function App() {

	const mainSvgSize = 500;
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
					RENDERER.drawSplot(mainSvgSize, canvas, ctx, normalizedData)
				} catch (error) {
					alert('Invalid JSON file');
				}
			};
			reader.readAsText(file);
		} else {
			alert('Please upload a JSON file');
		}
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
							<label for="svgInput">
								<div id="uploadButtonDiv">
									Upload JSON DATASET
								</div>
								<input id="svgInput" type="file" accept=".json" onChange={handleFileUpload} />
							</label>
							
							<select className="svgSelect" onChange={selectScatterplot}>
								<option value="none">Select a Scatterplot</option>
								{datasetList.map((dataset, i) => (
									<option value={dataset} key={i}>{dataset}</option>
								))}
							</select>
							<button id="initializeButton" className="svgButton">Reset!!</button>
							
						</div>
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
