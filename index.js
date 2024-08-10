let scene, camera, renderer;
const [width, height] = [600, 400];
let flag;
let flagTexture = null;
const [sizeW, sizeH, segW, segH] = [30, 20, 30, 20];

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(0, 0, 40);
  camera.lookAt(new THREE.Vector3(0, 0.0));
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.getElementById("renderArea").appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight("#FFFFFF");
  light.position.set(10, 50, 100);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight("#999999");
  scene.add(ambientLight);

  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 40, 16, 1);
  const material = new THREE.MeshPhongMaterial({
    color: "#ffcc99",
    specular: "#999999",
    shininess: 30,
  });
  const pole = new THREE.Mesh(geometry, material);
  pole.position.set(-15, -10, 0);
  scene.add(pole);

  const flagGeometry = new THREE.PlaneGeometry(sizeW, sizeH, segW, segH);
  const flagMaterial = new THREE.MeshLambertMaterial({
    color: "#ffffff",
    side: THREE.DoubleSide,
  });
  flag = new THREE.Mesh(flagGeometry, flagMaterial);
  scene.add(flag);

  fetchCountries();
  update();
};

const fetchCountries = async () => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const countries = await response.json();
    const countrySelect = document.getElementById("country");
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.flags.png;
      option.text = country.name.common;
      countrySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
};

const loadCountryFlag = () => {
  const flagUrl = document.getElementById("country").value;
  const loader = new THREE.TextureLoader();
  loader.load(flagUrl, (texture) => {
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    flagTexture = texture;
    setMaterial();
  });
};

const setMaterial = () => {
  flag.material = new THREE.MeshLambertMaterial({
    color: "#ffffff",
    map: flagTexture,
    side: THREE.DoubleSide,
  });
};

const update = () => {
  const h = 0.5;
  const v = 0.3;
  const w = 0.2;
  const s = 0.5;

  for (let y = 0; y < segH + 1; y++) {
    for (let x = 0; x < segW + 1; x++) {
      const index = x + y * (segW + 1);
      const vertex = flag.geometry.vertices[index];
      const time = (Date.now() * s) / 50;
      vertex.z = (Math.sin(h * x + v * y - time) * w * x) / 4;
    }
  }
  flag.geometry.verticesNeedUpdate = true;
  renderer.render(scene, camera);
  window.requestAnimationFrame(update);
};
