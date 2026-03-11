import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js';

//Global variables
let snowParticles;
let rainParticles;

// Call the main function to start the program
main();

function main() {
  // create the scene
  const scene = new THREE.Scene();
  // mainly for movement
  // key press
  document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
    // Jump with F
    if(event.key.toLowerCase() === 'f' && isOnGround){
      velocityY = 0.2;
      isOnGround = false;
    }
  });
  // key release
  document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
  });
  // Prepare the camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0,2,10);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,0);
  controls.update();

  // load the sky
  const loader = new THREE.CubeTextureLoader();
  const skybox = loader.load([
    'images/sky.png',
    'images/sky.png',
    'images/sky.png',
    'images/sky.png',
    'images/sky.png',
    'images/sky.png',
  ]);

  scene.background = skybox;

  // Add lights to the scene

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff,0.5);
  scene.add(ambient);

  // Directional light (sunlight)
  const directional = new THREE.DirectionalLight(0xffffff,1);
  directional.position.set(10,10,5);
  scene.add(directional);

  // Spot light (flashlight)
  const point = new THREE.PointLight(0xffaa00,2,100);
  point.position.set(0,10,0);
  scene.add(point);


  // ice texture 
  const textureLoader = new THREE.TextureLoader();
  const brickTexture = textureLoader.load('images/ice.png');
  const objects = [];
  // create 20+ cubes with ice texture to make it look like ice blocks
  const floorSize = 5;
  const tileSize = 2;
  for(let x = -floorSize; x <= floorSize; x++){
    for(let z = -floorSize; z <= floorSize; z++){
      const geometry = new THREE.BoxGeometry(tileSize,0.5,tileSize);
      const material = new THREE.MeshStandardMaterial({
        map: brickTexture,
        // more icy ish 
        roughness: 0.2,
        metalness: 0.3
      });
      // create the cube and position it on the floor as the new ice block
      const cube = new THREE.Mesh(geometry,material);
      cube.position.set(
        x * tileSize,
        -0.25,
        z * tileSize
      );
      scene.add(cube);
      objects.push(cube);
    }
  }

  /* Sphere -> to snow */
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,32,32),
    new THREE.MeshStandardMaterial({color:0x44aa88})
  );
  sphere.position.set(-5,2,0);
  scene.add(sphere);
  // once click, start snowing
  const snowGeometry = new THREE.BufferGeometry();
  const snowCount = 2000;
  const snowPositions = new Float32Array(snowCount * 3);
  for(let i=0;i<snowCount;i++){
    snowPositions[i*3] = (Math.random()-0.5)*50;
    snowPositions[i*3+1] = Math.random()*20;
    snowPositions[i*3+2] = (Math.random()-0.5)*50;
  }
  snowGeometry.setAttribute('position',
    new THREE.BufferAttribute(snowPositions,3)
  );
  const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2
  });
  snowParticles = new THREE.Points(snowGeometry,snowMaterial);
  // once click the sphere, toggle snow
  snowParticles.visible = false;
  scene.add(snowParticles);

  
  /* Cylinder -> Rain */
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1,1,3,32),
    new THREE.MeshStandardMaterial({color:0xaa8844})
  );
  cylinder.position.set(2,2,0);
  scene.add(cylinder);
  // once click, start raining
  const rainGeometry = new THREE.BufferGeometry();
  // a lot of rain particles to make it look like it's raining hard
  const rainCount = 2000;
  const rainPositions = new Float32Array(rainCount * 3);
  for(let i=0;i<rainCount;i++){
    rainPositions[i*3] = (Math.random()-0.5)*50;
    rainPositions[i*3+1] = Math.random()*20;
    rainPositions[i*3+2] = (Math.random()-0.5)*50;
  }
  rainGeometry.setAttribute('position',
    new THREE.BufferAttribute(rainPositions,3)
  );
  const rainMaterial = new THREE.PointsMaterial({
    color: 0x032cfc,
    size: 0.1
  });
  rainParticles = new THREE.Points(rainGeometry,rainMaterial);
  // once click the cylinder, toggle rain
  rainParticles.visible = false;
  scene.add(rainParticles);

  /* Square */
  const sqaure = new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshStandardMaterial({color:0x8844aa})
  );

  sqaure.position.set(5,2,0);
  scene.add(sqaure);
  

  // focus on the clicking the sphere, cylinder, or square to change the weather
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener("click",(event)=>{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse,camera);
    const intersects = raycaster.intersectObjects([sphere,cylinder,sqaure]);
    if(intersects.length > 0){
      const obj = intersects[0].object;
      // occurs when click the sphere, start snowing
      if(obj === sphere){
        weather = "snow";
        snowParticles.visible = true;
        rainParticles.visible = false;
        scene.fog = null;
      }
      //if click the cylinder, start raining
      if(obj === cylinder){
        weather = "rain";
        rainParticles.visible = true;
        snowParticles.visible = false;
        scene.fog = null;
      }
      //if click the square, start fog
      if(obj === sqaure){
        weather = "fog";
        snowParticles.visible = false;
        rainParticles.visible = false;
        scene.fog = new THREE.Fog(0xaaaaaa,5,40);
      }
    }
  });

  // Load the GLTF
  const gltfLoader = new GLTFLoader();
  // loading path
  gltfLoader.setPath('obj/');
  gltfLoader.load('scene.gltf', function(gltf){
    const model = gltf.scene;
    model.scale.set(3,3,3);
    model.position.set(0,-69,0);
    scene.add(model);
  });
  
  const keys = {};
  let velocityY = 0;
  let isOnGround = true;
  const speed = 0.2;
  const gravity = -0.01;
  let weather = "none";

  // Moving controls

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3(0,1,0);

  function moveCamera() {
     // normalized forward vector
    camera.getWorldDirection(forward);
    // prevent flying up/down when looking up/down
    forward.y = 0;
    forward.normalize();
    // right vector perpendicular to forward & up
    right.crossVectors(forward, up);
    if(keys['w']) camera.position.add(forward.clone().multiplyScalar(speed));
    if(keys['s']) camera.position.add(forward.clone().multiplyScalar(-speed));
    if(keys['a']) camera.position.add(right.clone().multiplyScalar(-speed));
    if(keys['d']) camera.position.add(right.clone().multiplyScalar(speed));
  }
  // Animation loop
  function animate(){
    // WASD movement
    moveCamera();
    // gravity + jump
    velocityY += gravity;
    camera.position.y += velocityY;
    // ground collision
    if(camera.position.y < 2){
      camera.position.y = 2;
      velocityY = 0;
      isOnGround = true;
    }
    ////////////////////////////snow and rain animation////////////////////////////
    if(weather === "snow"){
      const pos = snowParticles.geometry.attributes.position;
      for(let i=0;i<snowCount;i++){
        pos.array[i*3+1] -= 0.05;
        if(pos.array[i*3+1] < 0){
          pos.array[i*3+1] = 20;
        }
      }
      pos.needsUpdate = true;
    }
    if(weather === "rain"){
      const pos = rainParticles.geometry.attributes.position;
      for(let i=0;i<rainCount;i++){
        pos.array[i*3+1] -= 0.3;
        if(pos.array[i*3+1] < 0){
          pos.array[i*3+1] = 20;
        }
      }
      pos.needsUpdate = true;
    }
    requestAnimationFrame(animate);
    /* animated cubes */
    // objects.forEach(obj=>{
    //   obj.rotation.x += 0.01;
    //   obj.rotation.y += 0.01;
    // });
    /* animated sphere */
    sphere.rotation.y += 0.02;
    cylinder.rotation.x += 0.04;
    sqaure.rotation.z += 0.01;
    renderer.render(scene,camera);
  }
  // add the animation loop to the main
  animate();

  // add function to handle window resize
  window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth,window.innerHeight);
    
  });
  
}
