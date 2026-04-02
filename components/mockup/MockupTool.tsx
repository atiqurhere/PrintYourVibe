"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, Type, Undo2, Redo2, Trash2, RotateCcw, Download,
  ShoppingBag, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Layers, GripVertical, ArrowUp, ArrowDown, AlignCenter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { products, categories } from "@/lib/mock-data";
import { useMockupStore, type DesignLayer } from "@/stores/useMockupStore";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/utils";

const FONTS = ["Inter", "Cormorant Garamond", "DM Sans", "Space Mono", "Georgia", "Arial Black", "Courier New"];
const HANDLE_SIZE = 8; // px, selection handle half-size

// ─── Image Cache ─────────────────────────────────────────────────────────────
// Keeps loaded HTMLImageElement objects so draw() can paint synchronously.
const imgCache = new Map<string, HTMLImageElement>();

function getCachedImage(src: string, onReady: () => void): HTMLImageElement | null {
  if (imgCache.has(src)) return imgCache.get(src)!;
  const img = new window.Image();
  img.onload = () => { imgCache.set(src, img); onReady(); };
  img.src = src;
  return null; // loading — caller will re-draw on onReady
}

// ─── Hit-test helpers ─────────────────────────────────────────────────────────
function layerRect(l: DesignLayer) {
  return {
    x: l.x,
    y: l.y,
    w: l.width * l.scaleX,
    h: l.height * l.scaleY,
  };
}

function hitLayer(l: DesignLayer, px: number, py: number): boolean {
  const { x, y, w, h } = layerRect(l);
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

type HandleKind = "tl" | "tr" | "bl" | "br" | "rotate";

function getHandles(l: DesignLayer): Record<HandleKind, { cx: number; cy: number }> {
  const { x, y, w, h } = layerRect(l);
  return {
    tl: { cx: x,     cy: y },
    tr: { cx: x + w, cy: y },
    bl: { cx: x,     cy: y + h },
    br: { cx: x + w, cy: y + h },
    rotate: { cx: x + w / 2, cy: y - 20 },
  };
}

function hitHandle(
  l: DesignLayer,
  px: number,
  py: number
): HandleKind | null {
  const handles = getHandles(l);
  for (const [kind, { cx, cy }] of Object.entries(handles) as [HandleKind, { cx: number; cy: number }][]) {
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (dist <= HANDLE_SIZE + 4) return kind;
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MockupToolPage({ initialProductSlug }: { initialProductSlug?: string }) {
  const store = useMockupStore();
  const addToCart = useCartStore((s) => s.addItem);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state refs — using refs (not state) so pointer handlers don't go stale
  const dragState = useRef<{
    active: boolean;
    kind: "move" | HandleKind;
    layerId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origScaleX: number;
    origScaleY: number;
    origRotation: number;
  } | null>(null);

  // Layer panel drag-reorder state
  const dragLayerIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const [step, setStep] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [textFont, setTextFont] = useState("DM Sans");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(32);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 500, h: 500 });
  // Snap guides: null = none, 'x' = vertical line, 'y' = horizontal line, 'xy' = both
  const [snapGuide, setSnapGuide] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // ── Product / colour / print area ──────────────────────────────────────────
  const currentProduct = products.find((p) => p.id === store.productId) || products[0];
  const currentColour = currentProduct.colours.find((c) => c.id === store.colourId) || currentProduct.colours[0];
  const printArea = currentProduct.print_area[store.side];
  const baseImage = store.side === "front"
    ? currentColour.mockup_front_url
    : (currentColour.mockup_back_url || currentColour.mockup_front_url);

  // Set initial product from slug
  useEffect(() => {
    if (initialProductSlug) {
      const p = products.find((pr) => pr.slug === initialProductSlug);
      if (p) store.setProduct(p.id, p.colours[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductSlug]);

  // ── Scale: print area coordinates → canvas pixels ─────────────────────────
  const scale = canvasSize.w / 500;
  const pa = {
    x: printArea.x * scale,
    y: printArea.y * scale,
    w: printArea.w * scale,
    h: printArea.h * scale,
  };

  // ── Canvas → client coordinate ratio (CSS size vs actual pixel size) ───────
  function getCanvasRatio(): { rx: number; ry: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { rx: 1, ry: 1 };
    const rect = canvas.getBoundingClientRect();
    return {
      rx: canvasSize.w / rect.width,
      ry: canvasSize.h / rect.height,
    };
  }

  function clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { rx, ry } = getCanvasRatio();
    return {
      x: (clientX - rect.left) * rx,
      y: (clientY - rect.top) * ry,
    };
  }

  // ── Draw (with snap guide lines) ──────────────────────────────────────────
  const draw = useCallback((guides?: { x: boolean; y: boolean }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    store.layers.forEach((layer) => {
      ctx.save();

      const { x, y, w, h } = layerRect(layer);
      const cx = x + w / 2;
      const cy = y + h / 2;

      // Apply rotation around layer centre
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      if (layer.type === "image" && layer.src) {
        const cached = getCachedImage(layer.src, () => draw());
        if (cached) {
          ctx.drawImage(cached, x, y, w, h);
        }
      } else if (layer.type === "text" && layer.text) {
        ctx.font = `${layer.fontSize || 32}px "${layer.fontFamily || "DM Sans"}"`;
        ctx.fillStyle = layer.fill || "#ffffff";
        ctx.textBaseline = "top";
        ctx.fillText(layer.text, x, y);
      }

      // ── Selection outline + handles ──────────────────────────────────────
      if (layer.isSelected) {
        ctx.restore();
        ctx.save();

        const { x: rx, y: ry, w: rw, h: rh } = layerRect(layer);

        ctx.strokeStyle = "#c9a84c";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);

        const handles = getHandles(layer);
        const corners: HandleKind[] = ["tl", "tr", "bl", "br"];
        corners.forEach((k) => {
          const { cx: hx, cy: hy } = handles[k];
          ctx.fillStyle = "#c9a84c";
          ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        });

        const { cx: rhx, cy: rhy } = handles.rotate;
        ctx.strokeStyle = "rgba(201,168,76,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx + rw / 2, ry);
        ctx.lineTo(rhx, rhy);
        ctx.stroke();
        ctx.fillStyle = "#c9a84c";
        ctx.beginPath();
        ctx.arc(rhx, rhy, HANDLE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.restore();
        return;
      }

      ctx.restore();
    });

    // ── Snap guide lines ──────────────────────────────────────────────────
    const g = guides ?? snapGuide;
    const pax = printArea.x * scale;
    const pay = printArea.y * scale;
    const paw = printArea.w * scale;
    const pah = printArea.h * scale;

    if (g.x) {
      // Vertical centre line through print area
      const lineX = pax + paw / 2;
      ctx.save();
      ctx.strokeStyle = "rgba(201,168,76,0.9)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lineX, pay);
      ctx.lineTo(lineX, pay + pah);
      ctx.stroke();
      // Label
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(201,168,76,0.9)";
      ctx.font = '10px "DM Sans", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("⊕ center", lineX, pay - 6);
      ctx.restore();
    }
    if (g.y) {
      // Horizontal centre line through print area
      const lineY = pay + pah / 2;
      ctx.save();
      ctx.strokeStyle = "rgba(201,168,76,0.9)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pax, lineY);
      ctx.lineTo(pax + paw, lineY);
      ctx.stroke();
      ctx.restore();
    }
  }, [store.layers, canvasSize, snapGuide, printArea, scale]); // eslint-disable-line

  useEffect(() => { draw(); }, [draw]);

  // ── Resize canvas to container ────────────────────────────────────────────
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.min(500, entry.contentRect.width);
        setCanvasSize({ w, h: w });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Pointer events on canvas ──────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = clientToCanvas(e.clientX, e.clientY);

    // Check selected-layer handles first
    const selected = store.layers.find((l) => l.isSelected);
    if (selected) {
      const handleHit = hitHandle(selected, x, y);
      if (handleHit) {
        dragState.current = {
          active: true,
          kind: handleHit,
          layerId: selected.id,
          startX: x,
          startY: y,
          origX: selected.x,
          origY: selected.y,
          origW: selected.width,
          origH: selected.height,
          origScaleX: selected.scaleX,
          origScaleY: selected.scaleY,
          origRotation: selected.rotation,
        };
        return;
      }
    }

    // Hit-test layers (top-most first)
    for (let i = store.layers.length - 1; i >= 0; i--) {
      const l = store.layers[i];
      if (hitLayer(l, x, y)) {
        store.selectLayer(l.id);
        dragState.current = {
          active: true,
          kind: "move",
          layerId: l.id,
          startX: x,
          startY: y,
          origX: l.x,
          origY: l.y,
          origW: l.width,
          origH: l.height,
          origScaleX: l.scaleX,
          origScaleY: l.scaleY,
          origRotation: l.rotation,
        };
        return;
      }
    }

    // Clicked empty space — deselect
    store.selectLayer(null);
    dragState.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ds = dragState.current;
    if (!ds || !ds.active) return;

    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    const dx = x - ds.startX;
    const dy = y - ds.startY;

    const layer = store.layers.find((l) => l.id === ds.layerId);
    if (!layer) return;

    if (ds.kind === "move") {
      const layerW = ds.origW * ds.origScaleX;
      const layerH = ds.origH * ds.origScaleY;

      let newX = ds.origX + dx;
      let newY = ds.origY + dy;

      // ── Centre snapping ──────────────────────────────────────────────────
      const SNAP_THRESHOLD = 10;
      const pax = printArea.x * scale;
      const pay = printArea.y * scale;
      const paw = printArea.w * scale;
      const pah = printArea.h * scale;

      const printCentreX = pax + paw / 2;
      const printCentreY = pay + pah / 2;
      const layerCentreX = newX + layerW / 2;
      const layerCentreY = newY + layerH / 2;

      const snapX = Math.abs(layerCentreX - printCentreX) < SNAP_THRESHOLD;
      const snapY = Math.abs(layerCentreY - printCentreY) < SNAP_THRESHOLD;

      if (snapX) newX = printCentreX - layerW / 2;
      if (snapY) newY = printCentreY - layerH / 2;

      setSnapGuide({ x: snapX, y: snapY });

      store.updateLayer(ds.layerId, { x: newX, y: newY });
      return;
    }

    if (ds.kind === "rotate") {
      const { x: lx, y: ly, w, h } = layerRect(layer);
      const cx = lx + w / 2;
      const cy = ly + h / 2;
      const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
      store.updateLayer(ds.layerId, { rotation: Math.round(angle) });
      return;
    }

    // Corner scale handles — maintain aspect ratio
    const origW = ds.origW * ds.origScaleX;
    const origH = ds.origH * ds.origScaleY;

    let newW = origW;
    let newH = origH;
    let newX = ds.origX;
    let newY = ds.origY;

    switch (ds.kind) {
      case "br":
        newW = Math.max(20, origW + dx);
        newH = Math.max(20, origH + dy);
        break;
      case "bl":
        newW = Math.max(20, origW - dx);
        newH = Math.max(20, origH + dy);
        newX = ds.origX + origW - newW;
        break;
      case "tr":
        newW = Math.max(20, origW + dx);
        newH = Math.max(20, origH - dy);
        newY = ds.origY + origH - newH;
        break;
      case "tl":
        newW = Math.max(20, origW - dx);
        newH = Math.max(20, origH - dy);
        newX = ds.origX + origW - newW;
        newY = ds.origY + origH - newH;
        break;
    }

    store.updateLayer(ds.layerId, {
      x: newX,
      y: newY,
      scaleX: newW / ds.origW,
      scaleY: newH / ds.origH,
    });
  };

  const handlePointerUp = () => {
    if (dragState.current?.active) {
      store.pushHistory();
    }
    dragState.current = null;
    setSnapGuide({ x: false, y: false }); // clear guides on release
  };

  // ── Cursor style based on hover ───────────────────────────────────────────
  const [cursor, setCursor] = useState<string>("default");

  const handlePointerMoveForCursor = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Also drive layer drag if active
    handlePointerMove(e);

    if (dragState.current?.active) return; // cursor stays as-is during drag

    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    const selected = store.layers.find((l) => l.isSelected);

    if (selected) {
      const h = hitHandle(selected, x, y);
      if (h === "rotate") { setCursor("crosshair"); return; }
      if (h === "tl" || h === "br") { setCursor("nwse-resize"); return; }
      if (h === "tr" || h === "bl") { setCursor("nesw-resize"); return; }
      if (hitLayer(selected, x, y)) { setCursor("move"); return; }
    }

    for (let i = store.layers.length - 1; i >= 0; i--) {
      if (hitLayer(store.layers[i], x, y)) { setCursor("move"); return; }
    }
    setCursor("default");
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const maxW = pa.w;
        const maxH = pa.h;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * ratio;
        const h = img.height * ratio;
        imgCache.set(src, img); // pre-cache so first draw is synchronous
        const layer: DesignLayer = {
          id: Date.now().toString(),
          type: "image",
          x: pa.x + (pa.w - w) / 2,
          y: pa.y + (pa.h - h) / 2,
          width: w,
          height: h,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          src,
          isSelected: true,
        };
        store.addLayer(layer);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFileDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // ── Text layer ────────────────────────────────────────────────────────────
  const addTextLayer = () => {
    if (!textInput.trim()) return;
    const layer: DesignLayer = {
      id: Date.now().toString(),
      type: "text",
      x: pa.x + 10,
      y: pa.y + pa.h / 2 - textSize / 2,
      width: 240,
      height: textSize + 8,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: textInput,
      fontSize: textSize,
      fontFamily: textFont,
      fill: textColor,
      isSelected: true,
    };
    store.addLayer(layer);
    setTextInput("");
  };

  // ── Layer panel reorder (drag-and-drop) ───────────────────────────────────
  // Layers are rendered reversed (top layer first). We work on the reversed
  // array and reorder the backing store.layers accordingly.
  const reversedLayers = [...store.layers].reverse();

  const handleLayerDragStart = (e: React.DragEvent, reversedIdx: number) => {
    dragLayerIdx.current = reversedIdx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleLayerDragOver = (e: React.DragEvent, reversedIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(reversedIdx);
  };

  const handleLayerDrop = (e: React.DragEvent, reversedIdx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    const from = dragLayerIdx.current;
    if (from === null || from === reversedIdx) return;

    const newReversed = [...reversedLayers];
    const [moved] = newReversed.splice(from, 1);
    newReversed.splice(reversedIdx, 0, moved);
    store.reorderLayers([...newReversed].reverse());
    dragLayerIdx.current = null;
  };

  // Move layer up/down in stack
  const moveLayerUp = (layerId: string) => {
    const idx = store.layers.findIndex((l) => l.id === layerId);
    if (idx >= store.layers.length - 1) return;
    const next = [...store.layers];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    store.reorderLayers(next);
  };
  const moveLayerDown = (layerId: string) => {
    const idx = store.layers.findIndex((l) => l.id === layerId);
    if (idx <= 0) return;
    const next = [...store.layers];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    store.reorderLayers(next);
  };

  // Snap selected layer to print-area centre
  const centreLayer = (layerId: string, axis: "both" | "h" | "v" = "both") => {
    const layer = store.layers.find((l) => l.id === layerId);
    if (!layer) return;
    const lw = layer.width * layer.scaleX;
    const lh = layer.height * layer.scaleY;
    const pax = printArea.x * scale;
    const pay = printArea.y * scale;
    const paw = printArea.w * scale;
    const pah = printArea.h * scale;
    const updates: Partial<DesignLayer> = {};
    if (axis === "both" || axis === "h") updates.x = pax + (paw - lw) / 2;
    if (axis === "both" || axis === "v") updates.y = pay + (pah - lh) / 2;
    store.updateLayer(layerId, updates);
    store.pushHistory();
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = (format: "png" | "jpg" | "pdf") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `printyourvibe-design.${format === "pdf" ? "png" : format}`;
    link.href = canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", 0.92);
    link.click();
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    addToCart({
      id: `${currentProduct.id}-${currentColour.id}-${store.selectedSize}-${Date.now()}`,
      productId: currentProduct.id,
      productName: currentProduct.name,
      productSlug: currentProduct.slug,
      colour: currentColour.name,
      colourHex: currentColour.hex,
      size: store.selectedSize,
      quantity: 1,
      unitPrice: currentProduct.base_price,
      thumbnailUrl: baseImage,
      mockupSessionId: store.sessionId || undefined,
    });
  };

  const selectedLayer = store.layers.find((l) => l.id === store.selectedLayerId);

  return (
    <div className="flex h-screen overflow-hidden bg-dark pt-16">

      {/* ── Left: Canvas Panel ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-2 relative p-4 md:p-8 overflow-hidden select-none">

        {/* Top action bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-cream transition-colors">
            <ChevronLeft size={16} /> Products
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={store.undo} title="Undo" disabled={store.historyIndex <= 0}>
              <Undo2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={store.redo} title="Redo" disabled={store.historyIndex >= store.history.length - 1}>
              <Redo2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={store.clearCanvas} title="Clear canvas">
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>

        {/* Front / Back toggle */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-1 bg-dark-card border border-gold/15 rounded-xl p-1 z-10">
          {(["front", "back"] as const).map((side) => (
            <button
              key={side}
              onClick={() => store.setSide(side)}
              className={`px-4 py-1.5 rounded-lg font-label text-xs uppercase tracking-widest transition-all ${store.side === side ? "bg-gold text-dark font-bold" : "text-cream-muted hover:text-cream"}`}
            >
              {side}
            </button>
          ))}
        </div>

        {/* Canvas container */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[500px] aspect-square mt-8"
          onDragOver={(e) => { e.preventDefault(); setIsFileDragging(true); }}
          onDragLeave={() => setIsFileDragging(false)}
          onDrop={handleFileDrop}
        >
          {/* Product base image */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <Image src={baseImage} alt={currentProduct.name} fill className="object-contain" />
          </div>

          {/* Print-area dashed guide */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(printArea.x / 500) * 100}%`,
              top: `${(printArea.y / 500) * 100}%`,
              width: `${(printArea.w / 500) * 100}%`,
              height: `${(printArea.h / 500) * 100}%`,
              border: "2px dashed rgba(201,168,76,0.4)",
              borderRadius: "4px",
            }}
          />

          {/* Interactive design canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="absolute inset-0 w-full h-full rounded-2xl"
            style={{ cursor }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMoveForCursor}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {/* File drop overlay */}
          {isFileDragging && (
            <div className="absolute inset-0 border-2 border-gold rounded-2xl bg-gold/10 flex items-center justify-center z-20 pointer-events-none">
              <p className="font-heading text-gold font-semibold">Drop your design here</p>
            </div>
          )}

          {/* Empty-state hint */}
          {store.layers.length === 0 && (
            <div
              className="absolute pointer-events-none flex flex-col items-center justify-center gap-2"
              style={{
                left: `${(printArea.x / 500) * 100}%`,
                top: `${(printArea.y / 500) * 100}%`,
                width: `${(printArea.w / 500) * 100}%`,
                height: `${(printArea.h / 500) * 100}%`,
              }}
            >
              <Upload size={28} className="text-gold/35" />
              <p className="text-xs text-cream-faint/50 text-center leading-snug">
                Upload your design<br />or add text
              </p>
            </div>
          )}
        </div>

        {/* Quick toolbar for selected layer */}
        {selectedLayer && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-dark-card border border-gold/20 rounded-xl px-3 py-2 shadow-2xl z-10">
            <span className="font-label text-[10px] text-cream-faint capitalize mr-2 select-none">
              {selectedLayer.type === "text" ? `"${selectedLayer.text?.slice(0, 12)}…"` : "Image"}
            </span>
            <button
              onClick={() => store.updateLayer(selectedLayer.id, { rotation: selectedLayer.rotation - 15 })}
              className="p-1.5 text-cream-muted hover:text-cream transition-colors" title="Rotate −15°"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => store.updateLayer(selectedLayer.id, { scaleX: selectedLayer.scaleX * 0.9, scaleY: selectedLayer.scaleY * 0.9 })}
              className="p-1.5 text-cream-muted hover:text-cream transition-colors" title="Scale down"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => store.updateLayer(selectedLayer.id, { scaleX: selectedLayer.scaleX * 1.1, scaleY: selectedLayer.scaleY * 1.1 })}
              className="p-1.5 text-cream-muted hover:text-cream transition-colors" title="Scale up"
            >
              <ZoomIn size={14} />
            </button>
            <div className="w-px h-4 bg-gold/15 mx-1" />
            <button
              onClick={() => centreLayer(selectedLayer.id, "both")}
              className="p-1.5 text-gold/70 hover:text-gold transition-colors" title="Centre on print area"
            >
              <AlignCenter size={14} />
            </button>
            <div className="w-px h-4 bg-gold/15 mx-1" />
            <button
              onClick={() => moveLayerUp(selectedLayer.id)}
              className="p-1.5 text-cream-muted hover:text-cream transition-colors" title="Bring forward"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => moveLayerDown(selectedLayer.id)}
              className="p-1.5 text-cream-muted hover:text-cream transition-colors" title="Send backward"
            >
              <ArrowDown size={14} />
            </button>
            <div className="w-px h-4 bg-gold/15 mx-1" />
            <button
              onClick={() => store.removeLayer(selectedLayer.id)}
              className="p-1.5 text-red-400 hover:text-red-300 transition-colors" title="Delete layer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Right: Controls Panel ───────────────────────── */}
      <div className="w-80 xl:w-96 bg-dark-card border-l border-gold/12 flex flex-col overflow-hidden">
        {/* Step tabs */}
        <div className="flex border-b border-gold/10 shrink-0">
          {[{ n: 1, label: "Product" }, { n: 2, label: "Design" }, { n: 3, label: "Order" }].map(({ n, label }) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`flex-1 py-4 text-xs font-label uppercase tracking-widest transition-all ${step === n ? "text-gold border-b-2 border-gold" : "text-cream-faint hover:text-cream"}`}
            >
              {n}. {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6">

          {/* ── Step 1: Product ── */}
          {step === 1 && (
            <>
              {/* Category tabs */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const catProducts = products.filter((p) => p.category_id === cat.id);
                    const isActive = catProducts.some((p) => p.id === store.productId);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          const first = catProducts[0];
                          if (first) store.setProduct(first.id, first.colours[0].id);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-label transition-all ${isActive ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/35 hover:text-cream"}`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product list (filtered by selected category) */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Product</p>
                <div className="space-y-2">
                  {products
                    .filter((p) => p.category_id === currentProduct.category_id)
                    .map((product) => (
                      <button
                        key={product.id}
                        onClick={() => store.setProduct(product.id, product.colours[0].id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${store.productId === product.id ? "border-gold/40 bg-gold/8" : "border-gold/10 hover:border-gold/25 hover:bg-dark-elevated"}`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-elevated shrink-0">
                          <Image src={product.colours[0].mockup_front_url} alt={product.name} width={40} height={40} className="object-contain w-full h-full p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-xs text-cream font-semibold truncate">{product.name}</p>
                          <p className="font-label text-[10px] text-gold">{formatPrice(product.base_price)}</p>
                        </div>
                        {store.productId === product.id && (
                          <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Colour swatches */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">
                  Colour — <span className="text-cream">{currentColour.name}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.colours.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => store.setColour(c.id)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-8 h-8 rounded-full transition-all ${store.colourId === c.id ? "ring-2 ring-gold ring-offset-2 ring-offset-dark-card scale-110" : "hover:scale-105 ring-1 ring-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.available_sizes.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => store.setSelectedSize(s.label)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-label transition-all ${store.selectedSize === s.label ? "border-gold bg-gold/15 text-gold" : "border-gold/15 text-cream-muted hover:border-gold/40"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="md" className="w-full" onClick={() => setStep(2)}>
                Next: Upload Design <ChevronRight size={16} />
              </Button>
            </>
          )}

          {/* ── Step 2: Design ── */}
          {step === 2 && (
            <>
              {/* Upload zone */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Upload Design</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsFileDragging(true); }}
                  onDragLeave={() => setIsFileDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsFileDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isFileDragging ? "border-gold bg-gold/10" : "border-gold/20 hover:border-gold/40 hover:bg-dark-elevated"}`}
                >
                  <Upload size={24} className="text-gold/60 mx-auto mb-2" />
                  <p className="text-sm text-cream-muted mb-1">Drop file or click to upload</p>
                  <p className="font-label text-[10px] text-cream-faint uppercase tracking-widest">PNG · JPG · SVG · Max 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </div>
              </div>

              {/* Text tool */}
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">
                  <Type size={12} className="inline mr-1" /> Add Text
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Your text here…"
                      onKeyDown={(e) => e.key === "Enter" && addTextLayer()}
                      className="flex-1 bg-dark-elevated border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                    <button
                      onClick={addTextLayer}
                      className="px-3 py-2.5 bg-gold/15 border border-gold/25 text-gold rounded-lg text-xs font-label hover:bg-gold/25 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full bg-dark-elevated border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-cream-muted focus:outline-none focus:border-gold/30 transition-colors"
                  >
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-label text-[10px] text-cream-faint uppercase tracking-wide">Size</span>
                      <input type="range" min="12" max="80" value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="flex-1 accent-[#c9a84c]"
                      />
                      <span className="font-label text-xs text-cream-muted w-6">{textSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-[10px] text-cream-faint uppercase tracking-wide">Colour</span>
                      <input type="color" value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-gold/15 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layers panel with drag-to-reorder */}
              {store.layers.length > 0 && (
                <div>
                  <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">
                    <Layers size={12} className="inline mr-1" /> Layers ({store.layers.length})
                    <span className="ml-1 text-cream-faint/50 text-[9px] normal-case">drag to reorder</span>
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                    {reversedLayers.map((layer, revIdx) => (
                      <div
                        key={layer.id}
                        draggable
                        onDragStart={(e) => handleLayerDragStart(e, revIdx)}
                        onDragOver={(e) => handleLayerDragOver(e, revIdx)}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => handleLayerDrop(e, revIdx)}
                        onClick={() => store.selectLayer(layer.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          dragOverIdx === revIdx
                            ? "border-gold bg-gold/15"
                            : store.selectedLayerId === layer.id
                            ? "border-gold/40 bg-gold/8"
                            : "border-gold/10 hover:border-gold/20 hover:bg-dark-elevated"
                        }`}
                      >
                        <GripVertical size={12} className="text-cream-faint/40 shrink-0 cursor-grab" />
                        <span className="text-xs text-cream flex-1 truncate">
                          {layer.type === "text" ? `"${layer.text}"` : "📷 Image"}
                        </span>
                        {/* Up / down */}
                        <button
                          onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id); }}
                          className="p-0.5 text-cream-faint/40 hover:text-cream transition-colors" title="Bring forward"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id); }}
                          className="p-0.5 text-cream-faint/40 hover:text-cream transition-colors" title="Send backward"
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); store.removeLayer(layer.id); }}
                          className="p-0.5 text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transform sliders for selected layer */}
              {selectedLayer && (
                <div>
                  <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-3">Transform Selected</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-label text-[10px] text-cream-faint w-12">Rotate</span>
                      <input type="range" min="-180" max="180"
                        value={selectedLayer.rotation}
                        onChange={(e) => store.updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                        className="flex-1 accent-[#c9a84c]"
                      />
                      <span className="font-label text-xs text-cream-muted w-10">{selectedLayer.rotation}°</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-label text-[10px] text-cream-faint w-12">Scale</span>
                      <input type="range" min="10" max="300"
                        value={Math.round(selectedLayer.scaleX * 100)}
                        onChange={(e) => { const v = Number(e.target.value) / 100; store.updateLayer(selectedLayer.id, { scaleX: v, scaleY: v }); }}
                        className="flex-1 accent-[#c9a84c]"
                      />
                      <span className="font-label text-xs text-cream-muted w-10">{Math.round(selectedLayer.scaleX * 100)}%</span>
                    </div>
                    {/* Position nudge */}
                    <div className="flex items-center gap-3">
                      <span className="font-label text-[10px] text-cream-faint w-12">X</span>
                      <input type="range" min="0" max={canvasSize.w}
                        value={Math.round(selectedLayer.x)}
                        onChange={(e) => store.updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                        className="flex-1 accent-[#c9a84c]"
                      />
                      <span className="font-label text-xs text-cream-muted w-10">{Math.round(selectedLayer.x)}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-label text-[10px] text-cream-faint w-12">Y</span>
                      <input type="range" min="0" max={canvasSize.h}
                        value={Math.round(selectedLayer.y)}
                        onChange={(e) => store.updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                        className="flex-1 accent-[#c9a84c]"
                      />
                      <span className="font-label text-xs text-cream-muted w-10">{Math.round(selectedLayer.y)}px</span>
                    </div>
                  </div>
                </div>
              )}

              <Button variant="primary" size="md" className="w-full" onClick={() => setStep(3)}>
                Next: Order <ChevronRight size={16} />
              </Button>
            </>
          )}

          {/* ── Step 3: Export / Order ── */}
          {step === 3 && (
            <>
              <div>
                <p className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-2">Export Mockup</p>
                <p className="text-xs text-cream-faint/60 mb-4">
                  Sign in for a watermark-free download and to save your design to your account.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["png", "jpg", "pdf"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gold/15 hover:border-gold/40 hover:bg-dark-elevated transition-all group"
                    >
                      <Download size={18} className="text-gold/60 group-hover:text-gold transition-colors" />
                      <span className="font-label text-[10px] uppercase tracking-widest text-cream-muted group-hover:text-cream transition-colors">{fmt.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gold/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-heading text-sm text-cream font-semibold">{currentProduct.name}</p>
                    <p className="font-label text-[10px] text-cream-faint uppercase mt-0.5">
                      {currentColour.name} · Size {store.selectedSize}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-lg text-cream">{formatPrice(currentProduct.base_price)}</span>
                </div>

                <Link href="/cart">
                  <Button variant="primary" size="lg" className="w-full mb-3" onClick={handleAddToCart}>
                    <ShoppingBag size={16} /> Add to Cart
                  </Button>
                </Link>
                <p className="text-center text-xs text-cream-faint">
                  or{" "}
                  <Link href="/login" className="text-gold hover:text-gold-light transition-colors">sign in</Link>
                  {" "}to watermark-free export
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
