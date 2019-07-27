<!doctype html>

<html lang="en">
<head>
		<title>NYC Heat Radiation</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">

	</head>

	<div id="loading-overlay">
		<div id="loading-bar">
				<span id="progress"></span>
		</div>
	</div>

<body>
    <div id="info">
					<span>New York City Heat Radiation</span><br>
          A simulated 3x8 blocks sample
		</div>
    <div id="databox">
				<svg id='svg-1' height="70px" width="70px" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
					<g>
						<rect class='rect' x="0" y="0" rx=10 ry=10 width="90" height="50"></rect>
						<text class='recttext' x="5" y="14">Temperature</text>
						<text id='datavalue' class='rectvalue' x="6" y="43"> </text>
						<text class='datasymbol' x="65" y="40">&deg</text>
						<text class='datasymbol' x="72" y="41">F</text>
					</g>
				</svg>
		</div>
		<div id='map' class='map'></div>
		<div id="footer">
				Developed by <a class= author href="http://miladag.com" target="_blank" rel="noopener"> Milad Aghamohamadnia</a> <br> Powered by
				|<a class=resource href="http://threejs.org" target="_blank" rel="noopener"> three.js </a>| Python | WebGL
		</div>
    <script src="/lib/dat.gui.min.js"></script>
    <script src="/lib/three.js"></script>
    <script src="/lib/WebGL.js"></script>
    <script src="/lib/stats.js"></script>
    <script src="/lib/OrbitControls.js"></script>
    <script src="/lib/STLLoader.js"></script>
    <script src="/lib/Lut.js"></script>
    <script src="/lib/Projector.js"></script>
    <script src="./main.js"></script>
</body>
</html>
