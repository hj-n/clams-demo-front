import './App.css';

function App() {

	const mainSvgSize = 600;
	const datasetList = require("./dataset_list.json");

  return (
    <div className="App">
			<h1>CLAMS DEMO</h1>
			<div className="suppDiv">
				<h2>Supplemental material of the paper <b><i>CLAMS</i>: A Cluster Ambiguity Measure for Estimating Perceptual Variability in Visual Clustering</b></h2>
			</div>

			<div id="mainSvgDiv">
				<svg id="mainSvg" width={mainSvgSize} height={mainSvgSize}></svg>
				<div id="mainSvgButtonDiv">
					<button id="startDrawing" class="svgButton">Start Drawing!!</button>
					<button id="uploadButton" class="svgButton">Upload JSON dataset</button>
					<select class="svgSelect">
						<option value="none">Select a Scatterplot</option>
						{datasetList.map((dataset) => (
							<option value={dataset}>{dataset}</option>
						))}
					</select>
					<button id="initializeButton" class="svgButton">Initialize!!</button>
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
