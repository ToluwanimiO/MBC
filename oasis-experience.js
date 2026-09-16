import * as THREE from "three";

const experience = document.querySelector(
  "#immersiveExperience"
);

const container = document.querySelector(
  "#oasisExperience"
);

const loader = document.querySelector(
  "#experienceLoader"
);

const loaderStatus = document.querySelector(
  "#loaderStatus"
);

const loaderSkip = document.querySelector(
  "#loaderSkip"
);

const skipExperience = document.querySelector(
  "#skipExperience"
);

const progressNumber = document.querySelector(
  "#experienceProgress"
);

const progressBar = document.querySelector(
  "#experienceProgressBar"
);

const copyDesert = document.querySelector(
  ".copy-desert"
);

const copyWater = document.querySelector(
  ".copy-water"
);

const copyOasis = document.querySelector(
  ".copy-oasis"
);

const copySent = document.querySelector(
  ".copy-sent"
);

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

document.documentElement.classList.add(
  "immersive-loading"
);

document.body.classList.add(
  "immersive-loading"
);

let experienceExited = false;
let loaderClosed = false;
let targetProgress = 0;
let currentProgress = 0;

let pointerX = 0;
let pointerY = 0;
let targetPointerX = 0;
let targetPointerY = 0;

const mobile = window.innerWidth < 700;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let scene;
let camera;
let renderer;
let water;
let oasisLight;
let particles;
let palmGroup;
let clock;

const ripples = [];

function closeLoader() {
  if (loaderClosed) return;

  loaderClosed = true;
  loader?.classList.add("hide");
}

function failLoader(message) {
  if (loaderClosed) return;

  loader?.classList.add("failed");

  if (loaderStatus) {
    loaderStatus.textContent =
      message || "Continue to the church website";
  }

  window.setTimeout(closeLoader, 1200);
}

loaderSkip?.addEventListener("click", () => {
  closeLoader();

  if (!experienceExited) {
    experienceExited = true;
    leaveImmersiveExperience();
  }
});
window.setTimeout(() => {
  if (!loaderClosed) {
    failLoader("The experience is taking longer than expected");
  }
}, 7000);

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");

    return Boolean(
      window.WebGLRenderingContext &&
        (
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")
        )
    );
  } catch {
    return false;
  }
}

function getExperienceProgress() {
  if (!experience) return 0;

  const start = experience.offsetTop;

  const scrollableDistance =
    experience.offsetHeight -
    window.innerHeight;

  if (scrollableDistance <= 0) {
    return 0;
  }

  return THREE.MathUtils.clamp(
    (window.scrollY - start) /
      scrollableDistance,
    0,
    1
  );
}

function updateScrollProgress() {
  targetProgress = getExperienceProgress();
}
function updateExperienceCopy(progress) {
  const copies = [
    copyDesert,
    copyWater,
    copyOasis,
    copySent,
  ];

  const activeIndex = Math.min(
    copies.length - 1,
    Math.floor(progress * copies.length)
  );

  copies.forEach((copy, index) => {
    copy?.classList.toggle(
      "active",
      index === activeIndex
    );
  });

  if (progressNumber) {
    progressNumber.textContent = String(
      activeIndex + 1
    ).padStart(2, "0");
  }

  if (progressBar) {
    progressBar.style.transform =
      `scaleX(${Math.max(progress, 0.015)})`;
  }
}

function updateCamera(progress) {
  if (!camera || !scene || !water || !oasisLight) {
    return;
  }

  const p = THREE.MathUtils.clamp(
    progress,
    0,
    1
  );

  const z = THREE.MathUtils.lerp(
    210,
    -145,
    p
  );

  const y = THREE.MathUtils.lerp(
    52,
    12,
    p
  );

  const x =
    Math.sin(p * Math.PI) * 28;

  camera.position.set(x, y, z);

  const lookTarget = new THREE.Vector3(
    x * 0.17,
    4 + Math.sin(p * Math.PI) * 4,
    z - 90
  );

  camera.lookAt(lookTarget);

  const desertColor =
    new THREE.Color(0x123f52);

  const oasisColor =
    new THREE.Color(0x073a48);

  const currentColor =
    desertColor.clone().lerp(
      oasisColor,
      p
    );

  scene.background.copy(currentColor);
  scene.fog.color.copy(currentColor);

  water.material.opacity =
    0.76 + p * 0.17;

  oasisLight.intensity =
    7 + Math.sin(p * Math.PI) * 4;
}
function resetImmersiveExperience() {
  if (!experience) return;

  experience.style.display = "";
  experience.style.height = "";
  experience.style.minHeight = "";

  experience.classList.remove(
    "experience-complete"
  );

  document.body.classList.remove(
    "experience-finished"
  );

  targetProgress = 0;
  currentProgress = 0;

  if (progressNumber) {
    progressNumber.textContent = "01";
  }

  if (progressBar) {
    progressBar.style.transform =
      "scaleX(0)";
  }

  [
    copyDesert,
    copyWater,
    copyOasis,
    copySent,
  ].forEach((copy, index) => {
    copy?.classList.toggle(
      "active",
      index === 0
    );
  });

  experienceExited = false;
}

resetImmersiveExperience();
function exitExperienceAutomatically() {
  if (experienceExited || !experience) return;

  const progress = getExperienceProgress();

  if (progress < 0.985) return;

  experienceExited = true;

  leaveImmersiveExperience();
}
function leaveImmersiveExperience() {
  if (!experience) return;

  const homeSection =
    document.querySelector("#home");

  experience.classList.add(
    "experience-complete"
  );

  document.body.classList.add(
    "experience-finished"
  );

  /*
    Wait for the immersive section to collapse.
    This prevents the old 520vh section from
    preserving the previous scroll position.
  */
  window.setTimeout(() => {
    experience.style.display = "none";

    if (!homeSection) return;

    window.scrollTo({
      top: homeSection.offsetTop,
      left: 0,
      behavior: "instant",
    });

    window.setTimeout(() => {
      window.scrollTo({
        top: homeSection.offsetTop,
        left: 0,
        behavior: "smooth",
      });
    }, 40);
  }, 700);
}

function createScene() {
  if (!supportsWebGL()) {
    container?.classList.add("webgl-fallback");
    throw new Error("WebGL is unavailable.");
  }

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(0x123f52);

  scene.fog = new THREE.FogExp2(
    0x123f52,
    0.0028
  );

  camera = new THREE.PerspectiveCamera(
    46,
    window.innerWidth / window.innerHeight,
    0.1,
    2200
  );

  camera.position.set(0, 48, 210);

  renderer = new THREE.WebGLRenderer({
    antialias: !mobile,
    alpha: false,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(
    mobile
      ? 1
      : Math.min(window.devicePixelRatio, 1.7)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.25;

  container.appendChild(renderer.domElement);

  const sun = new THREE.DirectionalLight(
    0xffd6a0,
    5.2
  );

  sun.position.set(-110, 160, 90);
  sun.castShadow = !mobile;
  scene.add(sun);

  const ambient = new THREE.HemisphereLight(
    0xffdfbd,
    0x12363f,
    2.4
  );

  scene.add(ambient);

  oasisLight = new THREE.PointLight(
    0x46e6da,
    9,
    260
  );

  oasisLight.position.set(0, 9, -44);
  scene.add(oasisLight);

  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(14, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffdda1,
    })
  );

  sunMesh.position.set(-82, 95, -370);
  scene.add(sunMesh);

  const terrainGeometry =
    new THREE.PlaneGeometry(
      980,
      980,
      mobile ? 90 : 180,
      mobile ? 90 : 180
    );

  const terrainPositions =
    terrainGeometry.attributes.position;

  for (
    let i = 0;
    i < terrainPositions.count;
    i++
  ) {
    const x = terrainPositions.getX(i);
    const y = terrainPositions.getY(i);

    let height = 0;

    height += Math.sin(x * 0.018) * 7;
    height += Math.sin(y * 0.024) * 5;
    height += Math.sin(x * 0.05 + y * 0.02) * 2;
    height += Math.sin(x * 0.009 - y * 0.03) * 4;

    const oasisDistance =
      Math.sqrt(
        Math.pow(x, 2) +
          Math.pow(y + 40, 2)
      );

    const flatten =
      THREE.MathUtils.smoothstep(
        oasisDistance,
        0,
        105
      );

    height *= 1 - flatten * 0.88;

    terrainPositions.setZ(i, height);
  }

  terrainGeometry.computeVertexNormals();

  const terrain = new THREE.Mesh(
    terrainGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xc38b55,
      roughness: 1,
      metalness: 0,
    })
  );

  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -4;
  terrain.receiveShadow = true;
  scene.add(terrain);

  water = new THREE.Mesh(
    new THREE.CircleGeometry(
      80,
      mobile ? 60 : 110
    ),
    new THREE.MeshPhysicalMaterial({
      color: 0x1eabb5,
      roughness: 0.04,
      metalness: 0.08,
      transmission: 0.12,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    })
  );

  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.08, -42);
  scene.add(water);

  const rippleCount = mobile ? 9 : 22;

  for (let i = 0; i < rippleCount; i++) {
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(4.6, 5.1, 64),
      new THREE.MeshBasicMaterial({
        color: 0xbafff4,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
    );

    ripple.rotation.x = -Math.PI / 2;

    ripple.position.set(
      (Math.random() - 0.5) * 104,
      0.22,
      -42 + (Math.random() - 0.5) * 76
    );

    const initialScale =
      Math.random() * 1.4 + 0.45;

    ripple.scale.setScalar(initialScale);
    scene.add(ripple);

    ripples.push({
      mesh: ripple,
      speed: Math.random() * 0.017 + 0.006,
      initialScale,
    });
  }

  palmGroup = new THREE.Group();
  scene.add(palmGroup);

  function createPalm(x, z, scale = 1) {
    const palm = new THREE.Group();

    palm.position.set(x, -1, z);
    palm.scale.setScalar(scale);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.9,
        1.6,
        15,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0x75482d,
        roughness: 0.94,
      })
    );

    trunk.position.y = 7.5;
    trunk.rotation.z =
      (Math.random() - 0.5) * 0.16;

    trunk.castShadow = !mobile;
    palm.add(trunk);

    const leavesMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x2e704d,
        roughness: 0.88,
      });

    for (let i = 0; i < 12; i++) {
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(
          0.36,
          9.5,
          5
        ),
        leavesMaterial
      );

      const angle =
        (i / 12) * Math.PI * 2;

      leaf.position.y = 15;
      leaf.position.x =
        Math.cos(angle) * 3;
      leaf.position.z =
        Math.sin(angle) * 3;

      leaf.rotation.z = Math.PI / 3;
      leaf.rotation.y = angle;
      leaf.castShadow = !mobile;

      palm.add(leaf);
    }

    palmGroup.add(palm);
  }

  [
    [-52, -50, 1.35],
    [-37, -91, 1],
    [36, -70, 1.35],
    [56, -30, 1.08],
    [-70, -20, 1],
    [68, -86, 0.92],
    [-20, -18, 0.8],
    [30, -9, 1],
  ].forEach((palm) => {
    createPalm(...palm);
  });

  const rockMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x61483b,
      roughness: 0.97,
    });

  const rockCount = mobile ? 28 : 70;

  for (let i = 0; i < rockCount; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(
        Math.random() * 4 + 1,
        1
      ),
      rockMaterial
    );

    const angle =
      Math.random() * Math.PI * 2;

    const radius =
      52 + Math.random() * 155;

    rock.position.set(
      Math.cos(angle) * radius,
      Math.random() * 2,
      -42 + Math.sin(angle) * radius
    );

    rock.scale.y =
      Math.random() * 0.8 + 0.5;

    rock.rotation.set(
      Math.random(),
      Math.random(),
      Math.random()
    );

    rock.castShadow = !mobile;
    scene.add(rock);
  }

  const particleCount = mobile
    ? 850
    : 2700;

  const particlePositions =
    new Float32Array(
      particleCount * 3
    );

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] =
      (Math.random() - 0.5) * 720;

    particlePositions[i * 3 + 1] =
      Math.random() * 100;

    particlePositions[i * 3 + 2] =
      Math.random() * -610;
  }

  const particleGeometry =
    new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      particlePositions,
      3
    )
  );

  particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xffe7b5,
      size: mobile ? 0.62 : 0.44,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
  );

  scene.add(particles);

  clock = new THREE.Clock();

  if (!mobile) {
    window.addEventListener(
      "pointermove",
      (event) => {
        targetPointerX =
          (event.clientX / window.innerWidth - 0.5) * 2;

        targetPointerY =
          (event.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!renderer || !camera || !scene) {
    return;
  }

  const elapsed =
    clock?.getElapsedTime() || 0;

  if (!reducedMotion) {
    currentProgress +=
      (targetProgress - currentProgress) *
      0.045;
  } else {
    currentProgress = targetProgress;
  }

  pointerX +=
    (targetPointerX - pointerX) * 0.035;

  pointerY +=
    (targetPointerY - pointerY) * 0.035;

  updateCamera(currentProgress);
  updateExperienceCopy(currentProgress);
  exitExperienceAutomatically();

  if (!mobile) {
    camera.position.x += pointerX * 2.4;
    camera.position.y += pointerY * -1.5;
  }

  if (water) {
    water.rotation.z =
      Math.sin(elapsed * 0.2) * 0.01;
  }

  if (oasisLight) {
    oasisLight.intensity =
      8.5 + Math.sin(elapsed * 1.5) * 1.5;
  }

  ripples.forEach((ripple) => {
    const scale =
      ripple.mesh.scale.x + ripple.speed;

    ripple.mesh.scale.setScalar(scale);

    ripple.mesh.material.opacity =
      Math.max(
        0,
        0.28 - scale * 0.018
      );

    if (scale > 4.6) {
      ripple.mesh.scale.setScalar(
        ripple.initialScale
      );

      ripple.mesh.material.opacity =
        0.25;
    }
  });

  if (particles) {
    particles.rotation.y =
      elapsed * 0.008;
  }

  if (palmGroup) {
    palmGroup.rotation.y =
      Math.sin(elapsed * 0.32) * 0.008;
  }

  renderer.render(scene, camera);
}

try {
  if (!experience || !container) {
    throw new Error(
      "Immersive experience elements are missing."
    );
  }

  createScene();
  /* Keep loader visible until Three.js has rendered at least once */
renderer.render(scene, camera);

window.setTimeout(() => {
  closeLoader();
}, 900);
  window.addEventListener(
    "scroll",
    updateScrollProgress,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updateScrollProgress
  );

  window.addEventListener(
    "resize",
    () => {
      if (!camera || !renderer) return;

      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );

      renderer.setPixelRatio(
        window.innerWidth < 700
          ? 1
          : Math.min(window.devicePixelRatio, 1.7)
      );
    }
  );

  updateScrollProgress();
  animate();
} catch (error) {
  console.error(
    "Maranatha immersive experience error:",
    error
  );

  container.classList.add("webgl-fallback");
  failLoader("Continue to the church website");
}

/* Automatic transition without a button */

let automaticTransitionStarted = false;

function watchExperienceEnd() {
  if (automaticTransitionStarted) return;

  const progress = getExperienceProgress();

  if (progress < 0.985) return;

  automaticTransitionStarted = true;
  experience.classList.add("experience-complete");
}

window.addEventListener(
  "scroll",
  watchExperienceEnd,
  { passive: true }
);
skipExperience?.addEventListener("click", () => {
  if (experienceExited) return;

  experienceExited = true;
  leaveImmersiveExperience();
});