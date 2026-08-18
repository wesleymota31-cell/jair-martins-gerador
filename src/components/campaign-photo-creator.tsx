"use client";

import {
  Camera,
  Check,
  Download,
  Hand,
  ImagePlus,
  Minus,
  Plus,
  RotateCcw,
  Share2,
} from "lucide-react";
import NextImage from "next/image";
import { ChangeEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type PhotoFormat = "square" | "feed" | "story";
type FrameAsset = { name: string; src: string };

const formats = {
  square: { label: "QUADRADO", detail: "1080 × 1080", width: 1080, height: 1080 },
  feed: { label: "FEED", detail: "1080 × 1440", width: 1080, height: 1440 },
  story: { label: "STORY", detail: "1080 × 1920", width: 1080, height: 1920 },
} as const;

const frameAssets: Record<PhotoFormat, FrameAsset[]> = {
  square: [
    { name: "Azul 1011", src: "/frames/square/frame-01.png" },
    { name: "Verde Tem Voz", src: "/frames/square/frame-02.png" },
    { name: "Pará Tem Voz", src: "/frames/square/frame-03.png" },
  ],
  feed: [],
  story: [],
};

export function CampaignPhotoCreator() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [format, setFormat] = useState<PhotoFormat>("square");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const offsetStart = useRef<Point>({ x: 0, y: 0 });
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const photoStage = useRef<HTMLDivElement>(null);

  const loadPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setPreview(null);
      setSaved(false);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    offsetStart.current = offset;
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: offsetStart.current.x + event.clientX - dragStart.current.x,
      y: offsetStart.current.y + event.clientY - dragStart.current.y,
    });
  };

  const makeImage = useCallback(async () => {
    if (!photo) return null;
    const selectedFrame = frameAssets[format][frame];
    if (!selectedFrame) return null;
    const image = new Image();
    image.src = photo;
    const frameImage = new Image();
    frameImage.src = selectedFrame.src;
    await Promise.all([image.decode(), frameImage.decode()]);
    const { width: canvasWidth, height: canvasHeight } = formats[format];
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth; canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const baseScale = Math.max(canvasWidth / image.width, canvasHeight / image.height);
    const scale = baseScale * zoom;
    const width = image.width * scale, height = image.height * scale;
    const offsetScaleX = canvasWidth / (photoStage.current?.clientWidth || 360);
    const offsetScaleY = canvasHeight / (photoStage.current?.clientHeight || 480);
    ctx.drawImage(image, (canvasWidth - width) / 2 + offset.x * offsetScaleX, (canvasHeight - height) / 2 + offset.y * offsetScaleY, width, height);
    ctx.drawImage(frameImage, 0, 0, canvasWidth, canvasHeight);
    return canvas;
  }, [format, frame, offset.x, offset.y, photo, zoom]);

  const finishEditing = async () => {
    const canvas = await makeImage();
    if (!canvas) return;
    setPreview(canvas.toDataURL("image/png"));
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const download = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.download = `jair-martins-${format}-${formats[format].width}x${formats[format].height}.png`;
    link.href = preview;
    link.click();
    setSaved(true);
  };

  const share = async () => {
    if (!preview) return;
    const blob = await fetch(preview).then((response) => response.blob());
    if (!blob) return;
    const file = new File([blob], `jair-martins-${format}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Jair Martins 1011" });
    else download();
  };

  useEffect(() => () => { if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo); }, [photo]);

  if (preview) {
    return (
      <main className="campaign-shell campaign-success">
        <p className="campaign-kicker">PASSO 3 DE 3</p>
        <h1>SUA FOTO ESTÁ<br />PRONTA!</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`final-preview is-${format}`} src={preview} alt={`Prévia da foto para ${formats[format].label}`} />
        <p className="success-copy">{saved ? "✓ Foto salva. Confira a galeria ou os downloads do celular." : "Toque abaixo para permitir que a foto seja salva no seu celular."}</p>
        <button className="campaign-button button-yellow" onClick={download}><Download /> SALVAR NA GALERIA</button>
        <button className="campaign-button button-yellow" onClick={share}><Share2 /> COMPARTILHAR FOTO</button>
        <button className="campaign-button button-blue" onClick={() => setPreview(null)}><RotateCcw /> VOLTAR E AJUSTAR</button>
        <button className="campaign-new-photo" onClick={() => { setPhoto(null); setPreview(null); }}><RotateCcw /> CRIAR OUTRA FOTO</button>
        <CampaignFooter />
      </main>
    );
  }

  return (
    <main className={`campaign-shell ${photo ? "is-editing" : "is-start"}`}>
      <header className="campaign-header">
        <div className="campaign-brand">
          <NextImage src="/campaign/logo-jair.png" alt="Jair Martins 1011" width={606} height={161} priority />
        </div>
        <span className="official-pill"><Check /> OFICIAL</span>
      </header>

      {!photo ? (
        <section className="campaign-intro">
          <p className="campaign-kicker">FAÇA PARTE DESSE MOVIMENTO</p>
          <h1>CRIE SUA<br /><span>FOTO</span></h1>
          <p className="campaign-subtitle">Escolha uma foto, ajuste a moldura e compartilhe seu apoio.</p>
          <div className="campaign-actions">
            <button className="campaign-button button-yellow" onClick={() => cameraInput.current?.click()}><Camera /> TIRAR FOTO</button>
            <button className="campaign-button button-blue" onClick={() => galleryInput.current?.click()}><ImagePlus /> ESCOLHER DA GALERIA</button>
          </div>
          <div className="campaign-steps" aria-label="Etapas: foto, moldura e pronto">
            <span className="active"><b>1</b> FOTO</span><i /><span><b>2</b> MOLDURA</span><i /><span><b>3</b> PRONTO</span>
          </div>
        </section>
      ) : (
        <section className="campaign-editor">
          <p className="campaign-kicker">PASSO 2 DE 3</p>
          <h1>ESCOLHA SUA <span>MOLDURA</span></h1>
          <div className="format-heading"><b>FORMATO DA FOTO</b><span>ESCOLHA ONDE VAI PUBLICAR</span></div>
          <div className="format-options">
            {(Object.keys(formats) as PhotoFormat[]).map((item) => (
              <button key={item} className={format === item ? "selected" : ""} onClick={() => { setFormat(item); setFrame(0); setOffset({ x: 0, y: 0 }); setZoom(1); }} aria-pressed={format === item}>
                <span className={`format-icon is-${item}`} />
                <b>{formats[item].label}</b>
                <small>{formats[item].detail}</small>
                {format === item && <i><Check /></i>}
              </button>
            ))}
          </div>
          <div ref={photoStage} className={`photo-stage is-${format}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Sua foto para ajustar" draggable={false} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} />
            {frameAssets[format][frame] && <NextImage className="official-frame" src={frameAssets[format][frame].src} alt="" fill sizes="(max-width: 560px) 100vw, 560px" priority />}
          </div>
          <p className="drag-hint"><Hand /> ARRASTE A FOTO PARA AJUSTAR</p>
          <div className="zoom-controls">
            <button aria-label="Diminuir foto" onClick={() => setZoom((value) => Math.max(.75, value - .1))}><Minus /></button>
            <button className="center-control" onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(1); }}>CENTRALIZAR</button>
            <button aria-label="Aumentar foto" onClick={() => setZoom((value) => Math.min(2.2, value + .1))}><Plus /></button>
          </div>
          <div className="frame-heading"><b>MOLDURAS</b><span><Check /> MOLDURA ESCOLHIDA</span></div>
          {frameAssets[format].length ? <div className="frame-list">
            {frameAssets[format].map((item, index) => (
              <button key={item.src} className={frame === index ? "selected" : ""} onClick={() => setFrame(index)} aria-label={`Moldura ${item.name}`} aria-pressed={frame === index}>
                <div className={`frame-thumb is-${format}`} style={{ backgroundImage: `url(${photo})`, backgroundPosition: `calc(50% + ${offset.x / 4}px) calc(50% + ${offset.y / 4}px)`, backgroundSize: "cover" }}>
                  <NextImage src={item.src} alt="" fill sizes="120px" />
                </div>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {frame === index && <i><Check /></i>}
              </button>
            ))}
          </div> : <div className="frames-coming"><ImagePlus /><b>MOLDURAS EM PREPARAÇÃO</b><span>Os PNGs oficiais deste formato serão adicionados em breve.</span></div>}
          <button className="campaign-button button-yellow download-button" disabled={!frameAssets[format].length} onClick={finishEditing}><Check /> CONTINUAR PARA SALVAR</button>
        </section>
      )}

      <input ref={cameraInput} className="file-input" type="file" accept="image/*" capture="user" onChange={loadPhoto} />
      <input ref={galleryInput} className="file-input" type="file" accept="image/*" onChange={loadPhoto} />
      {!photo && <CampaignFooter />}
    </main>
  );
}

function CampaignFooter() {
  return (
    <footer className="campaign-footer">
      <div className="campaign-footer-inner">
        <div className="campaign-footer-head">
          <NextImage src="/campaign/logo-jair.png" alt="Jair Martins 1011" width={606} height={161} />
          <span>Jair Martins · Deputado Federal · Pará · 1011</span>
        </div>
        <div className="campaign-footer-rule" />
        <p><strong>Site oficial da campanha.</strong> Conteúdo de propaganda eleitoral gratuito, de responsabilidade da candidatura identificada nesta página.</p>
        <p>Anúncios pagos por ELEICAO 2026 JAIR LOPES MARTINS DEPUTADO FEDERAL · CNPJ 68.379.736/0001-56 · Conceição do Araguaia/PA.</p>
      </div>
    </footer>
  );
}
