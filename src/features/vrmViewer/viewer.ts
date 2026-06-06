import * as THREE from "three";
import { Model } from "./model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { buildUrl } from "@/utils/buildUrl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
  private _isContextLost = false;
  private _animationFrameId: number | null = null;
  private _isVisible = true;
  private _lowPowerMode = false;
  private _frameCount = 0;
  private _isMobile: boolean;

  constructor() {
    this.isReady = false;
    this._isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      // On mobile, reduce texture quality
      if (this._isMobile) {
        this.model!.vrm.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const material = obj.material as THREE.MeshStandardMaterial;
            if (material.map) {
              material.map.minFilter = THREE.LinearMipmapLinearFilter;
              material.map.generateMipmaps = true;
            }
          }
        });
      }

      this._scene.add(this.model.vrm.scene);

      const vrma = await loadVRMAnimation(buildUrl("/idle_loop.vrma"));
      if (vrma) this.model.loadAnimation(vrma);

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;

    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !this._isMobile,
      powerPreference: this._isMobile ? "low-power" : "high-performance",
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2);
    this._renderer.setPixelRatio(dpr);

    // camera
    this._camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
    this._camera.position.set(0, 1.3, 1.5);
    this._cameraControls?.target.set(0, 1.3, 0);
    this._cameraControls?.update();
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    this._cameraControls.update();

    // WebGL context loss handling
    const contextLostHandler = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL context lost");
      this._isContextLost = true;
      if (this._animationFrameId !== null) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
      }
    };
    const contextRestoredHandler = () => {
      console.log("WebGL context restored");
      this._isContextLost = false;
      this.resize();
      if (this.model?.vrm) {
        this.model.vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });
      }
      if (this._animationFrameId === null) {
        this._animationFrameId = requestAnimationFrame(this.update);
      }
    };
    canvas.addEventListener("webglcontextlost", contextLostHandler);
    canvas.addEventListener("webglcontextrestored", contextRestoredHandler);

    // Visibility change — pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this._isVisible = false;
        if (this._animationFrameId !== null) {
          cancelAnimationFrame(this._animationFrameId);
          this._animationFrameId = null;
        }
      } else {
        this._isVisible = true;
        this._clock.start(); // prevent huge delta jump
        if (this._animationFrameId === null) {
          this._animationFrameId = requestAnimationFrame(this.update);
        }
      }
    });

    // Low power detection
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updatePowerMode = () => {
          this._lowPowerMode = battery.level < 0.2 && !battery.charging;
          if (this._lowPowerMode) {
            this._renderer?.setPixelRatio(1);
          } else {
            this._renderer?.setPixelRatio(
              Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2)
            );
          }
        };
        battery.addEventListener("levelchange", updatePowerMode);
        battery.addEventListener("chargingchange", updatePowerMode);
        updatePowerMode();
      });
    }

    window.addEventListener("resize", () => {
      this.resize();
    });
    this.isReady = true;
    this._animationFrameId = requestAnimationFrame(this.update);
  }

  /**
   * canvasの親要素を参照してサイズを変更する
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    const dpr = Math.min(window.devicePixelRatio, this._isMobile ? 1.5 : 2);
    this._renderer.setPixelRatio(dpr);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  public update = () => {
    this._animationFrameId = requestAnimationFrame(this.update);
    if (!this._isVisible || this._isContextLost) return;

    const delta = this._clock.getDelta();

    // Low power: skip every other frame (~30fps)
    if (this._lowPowerMode) {
      this._frameCount++;
      if (this._frameCount % 2 !== 0) return;
    }

    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  };
}
