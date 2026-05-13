const initWebGL = () => {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0015);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 150;
  camera.position.y = 80;
  camera.rotation.x = -0.4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const SEPARATION = 6, AMOUNTX = 120, AMOUNTY = 120;
  let count = 0;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(AMOUNTX * AMOUNTY * 3);
  const scales = new Float32Array(AMOUNTX * AMOUNTY);

  let i = 0, j = 0;
  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i]     = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
      positions[i + 1] = 0;
      positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
      scales[j] = 1;
      i += 3;
      j++;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(0xffffff) } },
    vertexShader: `
      attribute float scale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = scale * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.4, d);
        gl_FragColor = vec4(color, a * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let mouseX = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
  });

  const render = () => {
    requestAnimationFrame(render);

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.lookAt(scene.position);

    const pos = particles.geometry.attributes.position.array;
    const sc  = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        pos[i + 1] =
          Math.sin((ix + count) * 0.1) * 12 +
          Math.cos((iy + count) * 0.08) * 12 +
          Math.sin((ix + iy + count) * 0.05) * 8;
        sc[j] =
          (Math.sin((ix + count) * 0.2) + 1) * 1.5 +
          (Math.sin((iy + count) * 0.2) + 1) * 1.5;
        i += 3;
        j++;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;
    count += 0.03;

    renderer.render(scene, camera);
  };

  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

initWebGL();