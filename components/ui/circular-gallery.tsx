import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl: any, text: string, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  gl: any; plane: any; renderer: any; text: any; textColor: any; screen: any; font: any; baseFont: any; mesh: any;
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif', screen }: any) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.screen = screen;
    this.baseFont = font;
    this.font = this.getResponsiveFont(font);
    this.createMesh();
  }

  getResponsiveFont(baseFont: string) {
    if (!this.screen) return baseFont;

    const isMobile = this.screen.width <= 768;
    const isTablet = this.screen.width > 768 && this.screen.width <= 1024;

    const baseFontSize = parseInt(baseFont.match(/\d+/)![0]);

    let fontSize;
    if (isMobile) {
      fontSize = Math.max(16, baseFontSize * 0.6);
    } else if (isTablet) {
      fontSize = Math.max(20, baseFontSize * 0.8);
    } else {
      fontSize = baseFontSize;
    }

    return baseFont.replace(/\d+px/, `${fontSize}px`);
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
  onResize(screen: any) {
    this.screen = screen;
    const newFont = this.getResponsiveFont(this.baseFont);
    if (newFont !== this.font) {
      this.font = newFont;
      // Remove old mesh and recreate
      if (this.mesh) {
        this.mesh.setParent(null);
      }
      this.createMesh();
    } else if (this.mesh) {
      // Just update scale/position to match new plane size
      const { width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
      const aspect = width / height;
      const textHeight = this.plane.scale.y * 0.15;
      const textWidth = textHeight * aspect;
      this.mesh.scale.set(textWidth, textHeight, 1);
      this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    }
  }
}

class Media {
  extra: number; geometry: any; gl: any; image: any; index: number; length: number;
  renderer: any; scene: any; screen: any; text: any; viewport: any; bend: any;
  textColor: any; borderRadius: number; font: any; program: any; plane: any;
  title: any; speed: number; isBefore: boolean; isAfter: boolean; scale: number;
  padding: number; width: number; widthTotal: number; x: number;

  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font }: any) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.speed = 0;
    this.isBefore = false;
    this.isAfter = false;
    this.scale = 0;
    this.padding = 0;
    this.width = 0;
    this.widthTotal = 0;
    this.x = 0;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl, plane: this.plane, renderer: this.renderer,
      text: this.text, textColor: this.textColor, font: this.font, screen: this.screen
    });
  }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }

    // Reset wrap-around offset so cards recalculate positions cleanly
    this.extra = 0;

    const isMobile = this.screen.width <= 768;
    const isTablet = this.screen.width > 768 && this.screen.width <= 1024;

    let baseScale;
    if (isMobile) {
      baseScale = this.screen.height / 800;
    } else if (isTablet) {
      baseScale = this.screen.height / 1200;
    } else {
      baseScale = this.screen.height / 1500;
    }

    this.scale = Math.max(baseScale, 0.3);

    let cardHeight, cardWidth;
    if (isMobile) {
      cardHeight = 400 * this.scale;
      cardWidth = 320 * this.scale;
    } else if (isTablet) {
      cardHeight = 600 * this.scale;
      cardWidth = 480 * this.scale;
    } else {
      cardHeight = 900 * this.scale;
      cardWidth = 700 * this.scale;
    }

    this.plane.scale.y = (this.viewport.height * cardHeight) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * cardWidth) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];

    this.padding = isMobile ? 1 : 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;

    // Update title text size/position
    if (this.title) {
      this.title.onResize(this.screen);
    }
  }
}

class App {
  container: any; bend!: number; responsiveBend!: number; scrollSpeed!: number;
  scroll: any; onCheckDebounce: any; renderer: any; gl: any;
  camera: any; scene: any; planeGeometry: any; mediasImages: any[];
  medias: any[]; screen: any; viewport: any; raf: number;
  isDown: boolean; start: number; startY: number; hasMoved: boolean;
  directionLocked: boolean; resizeObserver!: ResizeObserver | null;
  boundOnWheel: any; boundOnTouchDown: any;
  boundOnTouchMove: any; boundOnTouchUp: any;

  constructor(
    container: any,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05
    }: any = {}
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.mediasImages = [];
    this.medias = [];
    this.raf = 0;
    this.isDown = false;
    this.start = 0;
    this.startY = 0;
    this.hasMoved = false;
    this.directionLocked = false;
    this.resizeObserver = null;

    this.bend = bend;
    const isMobile = window.innerWidth <= 768;
    this.responsiveBend = isMobile ? Math.min(bend * 0.6, 1.8) : bend;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, this.responsiveBend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }
  createMedias(items: any, bend = 1, textColor: any, borderRadius: any, font: any) {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Deep Diving' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: 'Train Track' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: 'Santorini' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: 'Blurry Lights' },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: 'New York' },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: 'Good Boy' },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: 'Coastline' },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: 'Palm Trees' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data: any, index: number) => {
      return new Media({
        geometry: this.planeGeometry, gl: this.gl, image: data.image,
        index, length: this.mediasImages.length, renderer: this.renderer,
        scene: this.scene, screen: this.screen, text: data.text,
        viewport: this.viewport, bend, textColor, borderRadius, font
      });
    });
  }
  onTouchDown(e: any) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
    this.startY = e.touches ? e.touches[0].clientY : e.clientY;
    this.hasMoved = false;
    this.directionLocked = false;
  }
  onTouchMove(e: any) {
    if (!this.isDown) return;

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = this.start - x;
    const deltaY = this.startY - y;

    if (!this.directionLocked && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      this.directionLocked = true;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.hasMoved = true;
      } else {
        this.isDown = false;
        return;
      }
    }

    if (this.hasMoved) {
      if (e.cancelable && e.touches) e.preventDefault();
      const isMobile = this.screen.width <= 768;
      const multiplier = isMobile ? 0.04 : 0.025;
      const distance = deltaX * (this.scrollSpeed * multiplier);
      this.scroll.target = this.scroll.position + distance;
    }
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e: any) {
    const deltaX = e.deltaX || 0;
    const deltaY = e.deltaY || e.wheelDelta || e.detail || 0;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      this.scroll.target += (deltaX > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
      this.onCheckDebounce();
    }
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    // Recalculate responsive bend for new screen size
    const isMobile = this.screen.width <= 768;
    this.responsiveBend = isMobile ? Math.min(this.bend * 0.6, 1.8) : this.bend;

    if (this.medias) {
      // Figure out which card index we're closest to before resize changes widths
      const oldWidth = this.medias[0]?.width || 1;
      const currentIndex = Math.round(this.scroll.current / oldWidth);

      // Resize all media cards and update their bend
      this.medias.forEach(media => {
        media.bend = this.responsiveBend;
        media.onResize({ screen: this.screen, viewport: this.viewport });
      });

      // Snap scroll to the same card index with new card width
      const newWidth = this.medias[0]?.width || 1;
      this.scroll.current = currentIndex * newWidth;
      this.scroll.target = currentIndex * newWidth;
      this.scroll.last = this.scroll.current;
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    // Use ResizeObserver on container — fires after CSS breakpoints settle
    this.resizeObserver = new ResizeObserver(() => { this.onResize(); });
    this.resizeObserver.observe(this.container);

    this.container.addEventListener('mousewheel', this.boundOnWheel);
    this.container.addEventListener('wheel', this.boundOnWheel);
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.boundOnTouchUp);
    document.addEventListener('mousemove', this.boundOnTouchMove);
    document.addEventListener('mouseup', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.container) {
      this.container.removeEventListener('mousewheel', this.boundOnWheel);
      this.container.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
      this.container.removeEventListener('touchmove', this.boundOnTouchMove);
      this.container.removeEventListener('touchend', this.boundOnTouchUp);
    }
    document.removeEventListener('mousemove', this.boundOnTouchMove);
    document.removeEventListener('mouseup', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

interface CircularGalleryProps {
  items: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => { app.destroy(); };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  return <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" style={{ touchAction: 'pan-y' }} ref={containerRef} />;
}
