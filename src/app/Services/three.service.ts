import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private frameCallback: (() => void) | null = null;
  constructor(private zone: NgZone) { }
  init(container: HTMLElement) {
    // Cleanup if init is called again
    this.destroy();

    // Ensure container has dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0a0f');

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Handle window resize
    this.resizeHandler = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.resizeHandler);

    this.animate();
  }

  setFrameCallback(cb: (() => void) | null) {
    this.frameCallback = cb;
  }

  animate() {
    this.zone.runOutsideAngular(() => {
      const loop = () => {
        if (this.frameCallback) this.frameCallback();
        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.frameCallback = null;

    if (this.renderer) {
      // Remove canvas
      const canvas = this.renderer.domElement;
      canvas?.parentElement?.removeChild(canvas);
      this.renderer.dispose();
    }
  }
}

