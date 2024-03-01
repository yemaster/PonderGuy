<script setup lang="ts">
import * as THREE from 'three'
import { onMounted } from 'vue'

onMounted(() => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(
    sizes.width / -16,
    sizes.width / 16,
    sizes.height / 16,
    sizes.height / -16,
    -200,
    500
  )
  camera.position.set(200, 200, 200)
  camera.lookAt(scene.position)

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("d")?.appendChild(renderer.domElement);

  // 创建平面
  var planeGeometry = new THREE.PlaneGeometry(10, 10);
  var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  // 创建立方体
  var clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, -1), 2); // 剪裁平面垂直于 y 轴，过原点
  var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
  var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, clippingPlanes: [clipPlane], clipShadows: true  });
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);

  // 创建剪裁平面
  var localPlane = new THREE.PlaneGeometry(10, 10);
  localPlane.translate(0, 0, 0);
  var localPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, clippingPlanes: [clipPlane], clipShadows: true });
  var clipPlaneMesh = new THREE.Mesh(localPlane, localPlaneMaterial);
  scene.add((clipPlaneMesh));

  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(0, 100, 0)
  scene.add(directionalLight)

  // 开启剪裁平面
  renderer.localClippingEnabled = true;

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();
})
</script>

<template>
  <div id="d">
  </div>
</template>

<style></style>
