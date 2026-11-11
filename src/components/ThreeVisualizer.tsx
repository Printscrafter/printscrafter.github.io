import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Sparkles, 
  Maximize2, 
  Check, 
  ShoppingBag, 
  Eye, 
  Sliders,
  Palette,
  Armchair,
  Utensils
} from 'lucide-react';
import { 
  Product, 
  Orientation, 
  SizeOption, 
  FrameStyle, 
  RoomType, 
  Currency, 
  CartItem,
  SavedCustomArtwork 
} from '../types';
import { PRODUCTS, formatPrice } from '../data/products';

interface ThreeVisualizerProps {
  currency: Currency;
  selectedProduct: Product | null;
  onAddToCart: (item: CartItem) => void;
  onSelectProduct: (p: Product) => void;
  onSaveCustomArtwork?: (art: SavedCustomArtwork) => void;
  customArtworkToPreview?: { image: string; title: string; isCustom: boolean } | null;
}

export const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({
  currency,
  selectedProduct,
  onAddToCart,
  onSelectProduct,
  onSaveCustomArtwork,
  customArtworkToPreview
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio state
  const [roomType, setRoomType] = useState<RoomType>('living');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [sizeKey, setSizeKey] = useState<SizeOption>('small');
  const [sizeMultiplier, setSizeMultiplier] = useState<number>(1.0);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('black');
  const [wallColor, setWallColorState] = useState<string>('#f8fafc');
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [currentArtworkTitle, setCurrentArtworkTitle] = useState<string>(PRODUCTS[0].title);
  const [isLedActive, setIsLedActive] = useState<boolean>(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

  // Three.js internal references
  const threeRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    wallMesh: THREE.Mesh;
    floorMesh: THREE.Mesh;
    canvasMesh: THREE.Mesh;
    frameBorderMesh: THREE.Mesh;
    ledLight: THREE.PointLight;
    furnitureGroup: THREE.Group;
    textureLoader: THREE.TextureLoader;
    currentTexture?: THREE.Texture;
    animFrameId?: number;
    cameraAngleX: number;
    cameraAngleY: number;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
  } | null>(null);

  // Current base price calculation
  const currentBasePrice = isCustomUpload ? 45000 : (selectedProduct ? selectedProduct.basePriceNGN : PRODUCTS[0].basePriceNGN);
  const calculatedPrice = Math.round(currentBasePrice * sizeMultiplier);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(wallColor);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 7.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Directional main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.95);
    mainLight.position.set(4, 6, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Smart LED point light
    const ledLight = new THREE.PointLight(0xa855f7, 0, 10);
    ledLight.position.set(0, 0.4, 0.3);
    scene.add(ledLight);

    // Wall mesh
    const wallGeo = new THREE.PlaneGeometry(16, 10);
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.z = -0.1;
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // Floor mesh (hardwood tone)
    const floorGeo = new THREE.PlaneGeometry(16, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -3;
    floorMesh.position.z = 3;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Art canvas mesh
    const canvasGeo = new THREE.BoxGeometry(2.2, 3.2, 0.08);
    const canvasMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
    canvasMesh.position.set(0, 0.4, 0.04);
    canvasMesh.castShadow = true;
    scene.add(canvasMesh);

    // Frame border mesh
    const frameGeo = new THREE.BoxGeometry(2.36, 3.36, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.35, metalness: 0.15 });
    const frameBorderMesh = new THREE.Mesh(frameGeo, frameMat);
    frameBorderMesh.position.set(0, 0.4, 0.02);
    scene.add(frameBorderMesh);

    // Furniture group
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);

    // Setup initial living room furniture
    buildFurniture(furnitureGroup, 'living');

    const textureLoader = new THREE.TextureLoader();

    threeRefs.current = {
      scene,
      camera,
      renderer,
      wallMesh,
      floorMesh,
      canvasMesh,
      frameBorderMesh,
      ledLight,
      furnitureGroup,
      textureLoader,
      cameraAngleX: 0,
      cameraAngleY: 0,
      isDragging: false,
      prevMousePos: { x: 0, y: 0 }
    };

    // Load initial texture
    const initialImg = selectedProduct ? selectedProduct.image : PRODUCTS[0].image;
    loadTexture(initialImg);

    // Interaction listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (!threeRefs.current) return;
      threeRefs.current.isDragging = true;
      threeRefs.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!threeRefs.current || !threeRefs.current.isDragging) return;
      const dx = e.clientX - threeRefs.current.prevMousePos.x;
      const dy = e.clientY - threeRefs.current.prevMousePos.y;

      threeRefs.current.cameraAngleX += dx * 0.005;
      threeRefs.current.cameraAngleY = Math.max(-0.35, Math.min(0.35, threeRefs.current.cameraAngleY + dy * 0.005));

      const cam = threeRefs.current.camera;
      cam.position.x = 7.5 * Math.sin(threeRefs.current.cameraAngleX);
      cam.position.z = 7.5 * Math.cos(threeRefs.current.cameraAngleX);
      cam.position.y = 0.5 + Math.sin(threeRefs.current.cameraAngleY) * 2;
      cam.lookAt(0, 0, 0);

      threeRefs.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (threeRefs.current) threeRefs.current.isDragging = false;
    };

    // Touch support for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (!threeRefs.current || e.touches.length === 0) return;
      threeRefs.current.isDragging = true;
      threeRefs.current.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!threeRefs.current || !threeRefs.current.isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - threeRefs.current.prevMousePos.x;
      const dy = e.touches[0].clientY - threeRefs.current.prevMousePos.y;

      threeRefs.current.cameraAngleX += dx * 0.006;
      threeRefs.current.cameraAngleY = Math.max(-0.35, Math.min(0.35, threeRefs.current.cameraAngleY + dy * 0.006));

      const cam = threeRefs.current.camera;
      cam.position.x = 7.5 * Math.sin(threeRefs.current.cameraAngleX);
      cam.position.z = 7.5 * Math.cos(threeRefs.current.cameraAngleX);
      cam.position.y = 0.5 + Math.sin(threeRefs.current.cameraAngleY) * 2;
      cam.lookAt(0, 0, 0);

      threeRefs.current.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const id = requestAnimationFrame(animate);
      if (threeRefs.current) {
        threeRefs.current.animFrameId = id;
        
        // Pulsate LED if active
        if (isLedActive && threeRefs.current.ledLight) {
          const t = clock.getElapsedTime();
          threeRefs.current.ledLight.intensity = 2.4 + Math.sin(t * 3) * 0.9;
        }

        threeRefs.current.renderer.render(threeRefs.current.scene, threeRefs.current.camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !threeRefs.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      threeRefs.current.camera.aspect = w / h;
      threeRefs.current.camera.updateProjectionMatrix();
      threeRefs.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (threeRefs.current?.animFrameId) {
        cancelAnimationFrame(threeRefs.current.animFrameId);
      }
      renderer.dispose();
    };
  }, []);

  // Helper to build furniture
  const buildFurniture = (group: THREE.Group, type: RoomType) => {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (type === 'living') {
      // Modern contemporary sofa
      const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.65, 1.7), sofaMat);
      seat.position.set(0, -2.1, 1.8);
      seat.castShadow = true;
      seat.receiveShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.45), sofaMat);
      back.position.set(0, -1.35, 1.1);
      back.castShadow = true;
      group.add(back);

      // Accent cushions
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.6 });
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.25), cushionMat);
      c1.position.set(-1.4, -1.4, 1.45);
      c1.rotation.z = 0.08;
      group.add(c1);

      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.25), cushionMat);
      c2.position.set(1.4, -1.4, 1.45);
      c2.rotation.z = -0.08;
      group.add(c2);
    } else {
      // Luxury hardwood dining table
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45 });
      const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 2.0), tableMat);
      tableTop.position.set(0, -1.55, 1.8);
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      group.add(tableTop);

      // Table legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16), legMat);
      leg1.position.set(-1.9, -2.25, 1.1);
      group.add(leg1);

      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16), legMat);
      leg2.position.set(1.9, -2.25, 1.1);
      group.add(leg2);

      const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16), legMat);
      leg3.position.set(-1.9, -2.25, 2.5);
      group.add(leg3);

      const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16), legMat);
      leg4.position.set(1.9, -2.25, 2.5);
      group.add(leg4);
    }
  };

  // Texture loader
  const loadTexture = (url: string) => {
    if (!threeRefs.current) return;
    threeRefs.current.textureLoader.load(
      url,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0xffffff }), // right
          new THREE.MeshStandardMaterial({ color: 0xffffff }), // left
          new THREE.MeshStandardMaterial({ color: 0xffffff }), // top
          new THREE.MeshStandardMaterial({ color: 0xffffff }), // bottom
          new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35 }), // front
          new THREE.MeshStandardMaterial({ color: 0xffffff }) // back
        ];
        if (threeRefs.current) {
          threeRefs.current.canvasMesh.material = materials;
          threeRefs.current.currentTexture = texture;
        }
      },
      undefined,
      (err) => {
        console.error('Texture load error:', err);
      }
    );
  };

  // Sync selectedProduct changes from outside (e.g. clicking "Preview 3D" in catalog)
  useEffect(() => {
    if (!selectedProduct) return;
    setIsCustomUpload(false);
    setCustomImageSrc(null);
    setCurrentArtworkTitle(selectedProduct.title);
    setIsLedActive(selectedProduct.isLed);

    loadTexture(selectedProduct.image);

    if (threeRefs.current) {
      if (selectedProduct.isLed) {
        threeRefs.current.ledLight.intensity = 2.8;
      } else {
        threeRefs.current.ledLight.intensity = 0;
      }
    }
  }, [selectedProduct]);

  // Handle Room Change
  const handleRoomChange = (type: RoomType) => {
    setRoomType(type);
    if (threeRefs.current) {
      buildFurniture(threeRefs.current.furnitureGroup, type);
    }
  };

  // Handle Orientation and Dimensions scaling
  const applyScaling = (orient: Orientation, mult: number) => {
    if (!threeRefs.current) return;
    let baseW = orient === 'landscape' ? 3.4 : 2.2;
    let baseH = orient === 'landscape' ? 2.2 : 3.2;

    const scaleW = (baseW / 2.2) * mult;
    const scaleH = (baseH / 3.2) * mult;

    threeRefs.current.canvasMesh.scale.set(scaleW, scaleH, 1);
    threeRefs.current.frameBorderMesh.scale.set(scaleW, scaleH, 1);
  };

  const handleOrientationChange = (orient: Orientation) => {
    setOrientation(orient);
    applyScaling(orient, sizeMultiplier);
  };

  const handleSizeChange = (key: SizeOption, mult: number) => {
    setSizeKey(key);
    setSizeMultiplier(mult);
    applyScaling(orientation, mult);
  };

  // Handle Frame Change
  const handleFrameChange = (style: FrameStyle) => {
    setFrameStyle(style);
    if (!threeRefs.current) return;
    const border = threeRefs.current.frameBorderMesh;
    if (style === 'canvas') {
      border.visible = false;
    } else {
      border.visible = true;
      const mat = border.material as THREE.MeshStandardMaterial;
      if (style === 'black') mat.color.setStyle('#000000');
      if (style === 'oak') mat.color.setStyle('#854d0e');
      if (style === 'gold') mat.color.setStyle('#d4af37');
    }
  };

  // Handle Wall Color
  const handleWallColor = (hex: string) => {
    setWallColorState(hex);
    if (!threeRefs.current) return;
    (threeRefs.current.wallMesh.material as THREE.MeshStandardMaterial).color.setStyle(hex);
    threeRefs.current.scene.background = new THREE.Color(hex);
  };

  // Sync external custom artwork to preview from dashboard
  useEffect(() => {
    if (!customArtworkToPreview) return;
    setIsCustomUpload(true);
    setCustomImageSrc(customArtworkToPreview.image);
    setCurrentArtworkTitle(customArtworkToPreview.title);
    setIsLedActive(false);
    loadTexture(customArtworkToPreview.image);
    if (threeRefs.current) {
      threeRefs.current.ledLight.intensity = 0;
    }
  }, [customArtworkToPreview]);

  // Handle Local Art Upload
  const handleUserUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImageSrc(dataUrl);
      setIsCustomUpload(true);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      setCurrentArtworkTitle(`Custom Upload: ${cleanTitle.slice(0, 24)}`);
      setIsLedActive(false);
      loadTexture(dataUrl);
      if (threeRefs.current) {
        threeRefs.current.ledLight.intensity = 0;
      }

      // Automatically store in user's custom art vault
      if (onSaveCustomArtwork) {
        onSaveCustomArtwork({
          id: `custom-${Date.now()}`,
          title: cleanTitle,
          imageUrl: dataUrl,
          orientation: orientation,
          createdAt: new Date().toISOString()
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCatalogueSelect = (productIdStr: string) => {
    const id = parseInt(productIdStr, 10);
    const prod = PRODUCTS.find(p => p.id === id);
    if (prod) {
      onSelectProduct(prod);
    }
  };

  const handleAddToCart = () => {
    const frameLabels: Record<FrameStyle, string> = {
      black: 'Modern Black Aluminum',
      oak: 'Natural Oak Wood',
      gold: 'Brushed Gold Leaf',
      canvas: 'Frameless Gallery Canvas Wrap'
    };

    const sizeLabels: Record<SizeOption, string> = {
      small: 'Small (16x24")',
      medium: 'Medium (24x36")',
      large: 'Grand Large (36x48")'
    };

    const itemImage = isCustomUpload && customImageSrc 
      ? customImageSrc 
      : (selectedProduct ? selectedProduct.image : PRODUCTS[0].image);

    const newItem: CartItem = {
      cartId: `viz-${Date.now()}`,
      productId: selectedProduct?.id,
      title: isCustomUpload ? 'Custom Uploaded Fine Canvas' : currentArtworkTitle,
      category: isCustomUpload ? 'Custom Photo' : (selectedProduct?.category || 'Fine Art'),
      size: `${sizeLabels[sizeKey]} • ${orientation.toUpperCase()}`,
      orientation,
      frame: frameLabels[frameStyle],
      wallColorHex: wallColor,
      priceNGN: calculatedPrice,
      image: itemImage,
      quantity: 1,
      isCustomUpload
    };

    onAddToCart(newItem);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  return (
    <section id="visualizer" className="py-16 bg-slate-50 border-y border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            3D Room &amp; Dining Wall Art Visualizer
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Orbit the room in real-time, test wall paint tones, custom sizes, luxury frames, or upload your own family photos to preview before purchasing.
          </p>
        </div>

        {/* Visualizer Studio Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / 3D Canvas Area */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Top Room Selector Controls */}
            <div className="flex items-center justify-between mb-3 bg-slate-100/80 p-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 ml-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-700">Room Scene:</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRoomChange('living')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    roomType === 'living'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" /> Living Room
                </button>
                <button
                  type="button"
                  onClick={() => handleRoomChange('dining')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    roomType === 'dining'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" /> Dining Room
                </button>
              </div>
            </div>

            {/* 3D Container */}
            <div 
              ref={containerRef}
              className="relative w-full h-[400px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 select-none group"
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-full block cursor-grab active:cursor-grabbing"
              />

              {/* Orbit Overlay Hint */}
              <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-[11px] text-white flex items-center gap-2 pointer-events-none shadow-lg">
                <RotateCw className="w-3.5 h-3.5 text-brand-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Drag to Orbit 3D Room</span>
              </div>

              {/* Scale / Orientation Indicator */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium shadow-sm flex items-center gap-2 pointer-events-none">
                <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                <span className="capitalize">{sizeKey} ({orientation})</span>
              </div>

              {/* Smart LED Active Badge */}
              {isLedActive && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 pointer-events-none animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Smart LED Illumination Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Right / Customizer Controls Panel */}
          <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
            
            {/* Upload Custom Art Box */}
            <div className="bg-gradient-to-br from-brand-50/80 to-purple-50/50 border border-brand-200/80 p-4 rounded-2xl">
              <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-600" /> Custom Photo Upload
                </span>
                <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded-md font-semibold">
                  From ₦45,000
                </span>
              </label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleUserUpload} 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white hover:bg-brand-50 border border-brand-300 text-brand-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01]"
              >
                <Upload className="w-4 h-4 text-brand-600" /> Upload Local Photo to 3D Wall
              </button>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Orientation (Vertical / Horizontal)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleOrientationChange('portrait')}
                  className={`py-2.5 px-3 font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    orientation === 'portrait'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Portrait (Vertical)
                </button>
                <button
                  type="button"
                  onClick={() => handleOrientationChange('landscape')}
                  className={`py-2.5 px-3 font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    orientation === 'landscape'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Landscape (Horizontal)
                </button>
              </div>
            </div>

            {/* Choose Catalogue Artwork */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Catalogue Artwork Selection
              </label>
              <select 
                value={selectedProduct?.id || ''} 
                onChange={(e) => handleCatalogueSelect(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
              >
                <option value="">-- Choose Catalogue Artwork --</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category}) - {formatPrice(p.basePriceNGN, currency)}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Canvas Dimension Scaling
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSizeChange('small', 1.0)}
                  className={`py-2 px-2 font-medium rounded-xl text-center transition-all ${
                    sizeKey === 'small'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Small (1x)
                </button>
                <button
                  type="button"
                  onClick={() => handleSizeChange('medium', 1.5)}
                  className={`py-2 px-2 font-medium rounded-xl text-center transition-all ${
                    sizeKey === 'medium'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Medium (1.5x)
                </button>
                <button
                  type="button"
                  onClick={() => handleSizeChange('large', 2.2)}
                  className={`py-2 px-2 font-medium rounded-xl text-center transition-all ${
                    sizeKey === 'large'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Large (2.2x)
                </button>
              </div>
            </div>

            {/* Wall Paint Tone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Wall Paint Tone</span>
                <span className="text-[10px] text-slate-400">Click to change wall color</span>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { hex: '#f8fafc', title: 'Studio White' },
                  { hex: '#cbd5e1', title: 'Soft Slate Gray' },
                  { hex: '#fef3c7', title: 'Warm Beige' },
                  { hex: '#dcfce7', title: 'Sage Green' },
                  { hex: '#1e1b4b', title: 'Midnight Navy' }
                ].map(item => (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => handleWallColor(item.hex)}
                    style={{ backgroundColor: item.hex }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      wallColor === item.hex ? 'ring-2 ring-brand-500 border-white scale-110' : 'border-slate-300'
                    }`}
                    title={item.title}
                  />
                ))}
              </div>
            </div>

            {/* Framing Material */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3D Frame Border Finish
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'black', label: 'Modern Black', color: 'bg-black' },
                  { id: 'oak', label: 'Natural Oak', color: 'bg-amber-700' },
                  { id: 'gold', label: 'Brushed Gold', color: 'bg-amber-400' },
                  { id: 'canvas', label: 'Frameless Wrap', color: 'bg-slate-300' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleFrameChange(item.id as FrameStyle)}
                    className={`px-3 py-2 border rounded-xl text-slate-700 font-medium text-left flex items-center gap-2 transition-all ${
                      frameStyle === item.id 
                        ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-1 ring-brand-500' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-xs ${item.color} border border-slate-400 shrink-0`}></span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Price & Add To Cart Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Calculated Total</span>
                <span className="text-xl sm:text-2xl font-bold text-brand-700">
                  {formatPrice(calculatedPrice, currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {isAddedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-brand-300" />
                    <span>Add To Cart</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
