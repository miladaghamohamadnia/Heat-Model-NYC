if (WEBGL.isWebGLAvailable() === false) {
    document.getElementById("map")
    .appendChild(WEBGL.getWebGLErrorMessage());
}

const manager = initLoadingManager();
var stlLoader = new THREE.STLLoader( manager )
var fileLoader = new THREE.FileLoader( manager )
var gui = new dat.GUI()

var lut, Geo, avgs, folder, sky, sunSphere
var camera, stats, controls, scene, Geom, Material
var mesh, renderer, gui1, gui2, gui3
var projector, mouse = {
    x: 0,
    y: 0
  },
  INTERSECTED;
var datavalue = document.getElementById("datavalue")

var props = {
    colorMap: "grayscale",
    downwellingMode: "low",
    downwellingCode: 0,
    MinC: 68,
    MaxC: 77
}
var colorFiles = [
                "models/temps300.txt",
                "models/temps500.txt",
                "models/temps800.txt"
                 ]

var stlFileObj = {
    filePath: "models/object.stl",
    str: 'GEOMETRY File ',
    loader: stlLoader
}

var colorFileObjs = [
    {
        filePath: colorFiles[0],
        str: 'COLOR File 1  ',
        loader: fileLoader,
        minCMax: [68, 77]
        },
    {
        filePath: colorFiles[1],
        str: 'COLOR File 2  ',
        loader: fileLoader,
        minCMax: [78, 82]
        },
    {
        filePath: colorFiles[2],
        str: 'COLOR File 3  ',
        loader: fileLoader,
        minCMax: [90, 105]
        }
    ]

// LOADING MANAGER
const clock = new THREE.Clock();
function initLoadingManager() {
  
  const manager = new THREE.LoadingManager();
  const progressBar = document.querySelector( '#progress' );
  const loadingOverlay = document.querySelector( '#loading-overlay' );

  let percentComplete = 1;
  let frameID = null;

  const updateAmount = 0.5; // in percent of bar width, should divide 100 evenly

  const animateBar = () => {
    percentComplete += updateAmount;

    // if the bar fills up, just reset it.
    // I'm changing the color only once, you 
    // could get fancy here and set up the colour to get "redder" every time
    if ( percentComplete >= 100 ) {
      
      progressBar.style.backgroundColor = 'blue'
      percentComplete = 1;

    }

    progressBar.style.width = percentComplete + '%';

    frameID = requestAnimationFrame( animateBar )

  }

  manager.onStart = () => {

    // prevent the timer being set again
    // if onStart is called multiple times
    if ( frameID !== null ) return;

    animateBar();

  };

  manager.onLoad = function ( ) {

    loadingOverlay.classList.add( 'loading-overlay-hidden' );

    // reset the bar in case we need to use it again
    percentComplete = 0;
    progressBar.style.width = 0;
    cancelAnimationFrame( frameID );

  };
  
  manager.onError = function ( e ) { 
    
    console.error( e ); 
    
    progressBar.style.backgroundColor = 'red';
  
  }
  
  return manager;
}
  

read_data(stlFileObj, function (geo) {
    read_data(colorFileObjs[props.downwellingCode], function (colors) {
        var geoArray = geo.attributes.position.array
        var newarray = shift_to_center(geoArray)
        geo.attributes.position.array = newarray
        colors = textTotemps(colors)
        colorFileObjs[0].data = colors
        minCMax = [props.MinC,props.MaxC]
        // console.log(minCMax)
        var lutColors = val_to_color(colors,
            props.colorMap,
            128,
            minCMax)
        geo.addAttribute('color',
            new THREE.Float32BufferAttribute(
                lutColors, 3)
        );
        Geo = geo
        init(geo);
        animate();
    })
})

function init(geom) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000);
//    scene.fog = new THREE.FogExp2(0x222222, 0.0002);
    renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("map").appendChild(renderer.domElement);
    stats = new Stats();
    document.getElementById("map").appendChild(stats.dom);
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 10, 5000);
    camera.position.set(-250, -1700, 1500);

    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //    controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.35;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 4000;
    //    controls.addEventListener('change', onPositionChange)

    var material = new THREE.MeshPhongMaterial({
        specular: 0xffffff,
        shininess: 20000,
        // flatShading: true,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors,
        // blending: THREE.MultiplyBlending
    });
    Material = material;
    mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);
    //  LIGHT
    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    // //  FLOOR
    // createFloor()
    //  GUI
    setupGui1()
    folder = gui.addFolder('Color Bounds');
    folder.open();
    setupGui2()
    window.addEventListener('resize', onWindowResize, false);
    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();
    // when the mouse moves, call the given function
    document.addEventListener('mousemove', onDocumentMouseMove, false)
    
}

setTimeout(function(){
    afterLoading() 
    console.log("gertgttf")
} ,5000)


function colorUpdate() {
    minCMax = [props.MinC, props.MaxC]
    console.log(minCMax)
    var lutColors = val_to_color(colorFileObjs[props.downwellingCode].data,
        props.colorMap,
        128,
        minCMax)
    scene.children[0].geometry.attributes.color = new THREE.Float32BufferAttribute(lutColors, 3)
}

function onChangeDownwelling() {
    if (props.downwellingMode==="low"){
        props.downwellingCode = 0
    }
    if (props.downwellingMode==="mid"){
    props.downwellingCode = 1
    }
    if (props.downwellingMode==="high"){
        props.downwellingCode = 2
    }
    props.MinC = colorFileObjs[props.downwellingCode].minCMax[0]
    props.MaxC = colorFileObjs[props.downwellingCode].minCMax[1]
    colorUpdate()
    folder.remove(guiMinColor);
    folder.remove(guiMaxColor);
    setupGui2()
    // update()
}

function onChangeColorMap() {
    colorUpdate()
    update()
}

function setupGui1() {
    guiWireframe = gui.add(Material, 'wireframe');
    guiColorMap = gui.add(props, "colorMap", ["grayscale", "rainbow", "cooltowarm", "blackbody"])
        .name("Color Palette")
        .onChange( onChangeColorMap )
    guiDownwelling = gui.add( props, "downwellingMode", [ "low", "mid", "high"] )
        .name( "Sky DownWelling" )
        .onChange( onChangeDownwelling )
}

function setupGui2() {
    guiMinColor = folder.add( props, 'MinC', 20, 130 )
        .step( .2 )
        .name( 'Min Temp.' )
        .onChange( function() {
            colorUpdate()
            update()
        } );
    guiMaxColor = folder.add( props, 'MaxC', 40, 150 )
        .step( .2 )
        .name( 'Max Temp.' )
        .onChange( function() {
            colorUpdate()
            update()
        } );
}

function onDocumentMouseMove(event) {
        // the following line would stop any other event handler from firing
        // (such as the mouse's TrackballControls)
        // event.preventDefault();
    
        // update the mouse variable
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        vector.unproject(camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        // create an array containing all objects in the scene with which the ray intersects
        var intersects = ray.intersectObjects(scene.children);
    // INTERSECTED = the object in the scene currently closest to the camera 
    //		and intersected by the Ray projected from the mouse position 	
    if (intersects.length > 0) {
        var faceIndex = Math.floor(intersects[0].index/3)
        var faceValue = colorFileObjs[props.downwellingCode].data[faceIndex]
        faceValue = Math.round(faceValue*10)/10
        // console.log(faceIndex, faceValue)
        datavalue.innerHTML = faceValue;

    } else // there are no intersections
    {
        datavalue.innerHTML = "--.--";
    }
  }

//   if(!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");
    
//   mapboxgl.accessToken = config.accessToken;
//   var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v9',
//     center: [-122.4131, 37.7743],
//     zoom: 15.95,
//     pitch: 60,
//     heading: 41,
//     hash: true
//   });
//   map.on("load", function() {
//       // Initialize threebox
//       window.threebox = new Threebox(map);
//     //   threebox.setupDefaultLights();

//       // Load and manipulate a THREE.js scenegraph as you would normally
//     //   loader = new THREE.JSONLoader();
//     //   loader.load("models/boeing747-400-jw.json", function(geometry) {
//     //       geometry.rotateY((90/360)*2*Math.PI);
//     //       geometry.rotateX((90/360)*2*Math.PI);
//     //       var material = new THREE.MeshPhongMaterial( {color: 0xaaaaff, side: THREE.DoubleSide}); 
//     //       aircraft = new THREE.Mesh( geometry, material );
//     //       var planePosition = [-122.41356, 37.77577 ,100];
//     //       // Add the model to the threebox scenegraph at a specific geographic coordinate
//     //       threebox.addAtCoordinate(aircraft, planePosition, {scaleToLatitude: true, preScale: 2});
//     //   });
//   });



function update() {
    controls.update(); 
    // rotate()
    stats.update();
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function render() {

    renderer.render(scene, camera);
}

function rotate() {
    var SPEED = 0.01;
    var g = scene.children[0]
//    g.rotation.x += SPEED * 2;
//    g.rotation.y += SPEED;
    g.rotation.z += SPEED * 3;
    
}

function createFloor() {
    var planeGeometry = new THREE.PlaneGeometry(4000, 4000);
    var texture = new THREE.TextureLoader().load( "textures/pic1.png" );
    var planeMaterial = [
        new THREE.MeshBasicMaterial({map: texture, side: THREE.FrontSide}),
        new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.BackSide})
                        ];
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // rotate and position the plane
    plane.rotation.z = -0.3 * Math.PI;
    plane.position.z = -60;
    scene.add(plane);
}

function val_to_color(colors, colormap, nrColors, mCx) {
    lut = new THREE.Lut(colormap, nrColors)
    lut.setMin(mCx[0])
    lut.setMax(mCx[1])
    var lutColors = colors.map(function (el) {
        var clr = lut.getColor(el)
        return [clr.r, clr.g, clr.b,
                clr.r, clr.g, clr.b,
                clr.r, clr.g, clr.b]
    }).flat()
    return lutColors
}

function shift_to_center(geoArray) {
    var NrTriangles = geoArray.length / 3
    var avgs = [1, 2].map(function (el) {
        return geoArray
            .filter(function (value, index) {
                return (index + 1) % 3 === el;
            })
            .reduce(function (acc, val) {
                return acc + val;
            }, 0) / NrTriangles;
    })

    newarray = geoArray.map(function (value, index) {
        if ((index + 1) % 3 === 1) {
            return value - avgs[0]
        }
        if ((index + 1) % 3 === 2) {
            return value - avgs[1]
        }
        if ((index + 1) % 3 === 0) {
            return value - 50
        }
    })
    return newarray
}

function read_data(fileObj, callback) {
    fileObj.loader.load(
        fileObj.filePath,
        function (data) {
            callback(data)
        },
        function (xhr) {
            onProgress(xhr, fileObj.str)
        }
    )
}

function textTotemps(tempsText) {
    filtered = tempsText.split('\n').filter(v => v != '');
    var fahrenheit = filtered.map(function (el) {
        return (parseFloat(el.split(' ')[1]) - 273.0) * (9 / 5) + 32;
    }).filter(function (value) {
        return !Number.isNaN(value);
    });
    return fahrenheit
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onProgress(xhr, name) {
    console.log(
        (name +
            Math.round(100 * xhr.loaded / xhr.total)) +
        '% loaded');
}

function afterLoading() {
    read_data(colorFileObjs[1], function (colors) {
        colors = textTotemps(colors)
        colorFileObjs[1].data = colors
    })
    read_data(colorFileObjs[2], function (colors) {
        colors = textTotemps(colors)
        colorFileObjs[2].data = colors
    })
}

const quantile = (arr, q1, q2) => {
    // sort array ascending
    var asc = arr_copy => arr_copy.sort((a, b) => a - b);
    var sorted = asc(arr.slice(0));
    const pos1 = ((sorted.length) - 1) * q1;
    const pos2 = ((sorted.length) - 1) * q2;
    const base1 = Math.floor(pos1);
    const base2 = Math.floor(pos2);
    const rest1 = pos1 - base1;
    const rest2 = pos2 - base2;
    if ((sorted[base1 + 1] !== undefined)) {
        var v1 = sorted[base1] + rest1 * (sorted[base1 + 1] - sorted[base1])
        var v2 = sorted[base2] + rest2 * (sorted[base2 + 1] - sorted[base2])

    } else {
        var v1 = sorted1[base1]
        var v1 = sorted2[base2]
    }
    var v12 = [v1, v2]
    return v12
};
