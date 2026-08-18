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
type FrameId = 0 | 1 | 2 | 3;

const frames = [
  { id: 0 as FrameId, name: "Movimento", className: "frame-movement" },
  { id: 1 as FrameId, name: "Juntos", className: "frame-together" },
  { id: 2 as FrameId, name: "1011", className: "frame-number" },
  { id: 3 as FrameId, name: "Esperança", className: "frame-hope" },
];

function FrameArtwork({ frame, compact = false }: { frame: FrameId; compact?: boolean }) {
  const label = frames[frame];
  return (
    <div className={`frame-art ${label.className} ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <span className="frame-top">JAIR MARTINS</span>
      {frame === 1 && <span className="frame-side">JUNTOS</span>}
      {frame === 3 && <span className="frame-tag">FAZ A DIFERENÇA</span>}
      <div className="frame-footer">
        <span>JAIR</span>
        <strong>MARTINS</strong>
        <b>10<span>11</span></b>
      </div>
    </div>
  );
}

export function CampaignPhotoCreator() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [frame, setFrame] = useState<FrameId>(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const offsetStart = useRef<Point>({ x: 0, y: 0 });
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const loadPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setReady(false);
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

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, selected: FrameId, size: number) => {
    const blue = "#006CCE", dark = "#012D61", yellow = "#FFD800", green = "#43BA04";
    ctx.fillStyle = selected === 2 ? blue : dark;
    ctx.fillRect(0, 0, size, selected === 1 ? 115 : 82);
    ctx.fillStyle = yellow;
    ctx.font = "900 42px Montserrat, Arial";
    ctx.fillText("JAIR MARTINS", 48, 58);
    if (selected === 1) {
      ctx.save(); ctx.translate(62, 690); ctx.rotate(-Math.PI / 2);
      ctx.font = "900 58px Montserrat, Arial"; ctx.fillText("JUNTOS", 0, 0); ctx.restore();
    }
    if (selected === 3) {
      ctx.save(); ctx.translate(930, 160); ctx.rotate(Math.PI / 2);
      ctx.fillStyle = green; ctx.fillRect(0, 0, 430, 72);
      ctx.fillStyle = "white"; ctx.font = "800 30px Montserrat, Arial"; ctx.fillText("FAZ A DIFERENÇA", 24, 48); ctx.restore();
    }
    ctx.fillStyle = selected === 0 ? blue : dark;
    ctx.beginPath(); ctx.moveTo(0, 855); ctx.lineTo(size, 765); ctx.lineTo(size, size); ctx.lineTo(0, size); ctx.fill();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.moveTo(0, 825); ctx.lineTo(size, 750); ctx.lineTo(size, 780); ctx.lineTo(0, 875); ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "900 76px Montserrat, Arial"; ctx.fillText("JAIR", 48, 947);
    ctx.font = "800 42px Montserrat, Arial"; ctx.fillText("MARTINS", 50, 1001);
    ctx.fillStyle = yellow; ctx.font = "900 132px Montserrat, Arial"; ctx.fillText("10", 690, 1000);
    ctx.fillStyle = green; ctx.fillText("11", 855, 1000);
  }, []);

  const makeImage = useCallback(async () => {
    if (!photo) return null;
    const image = new Image();
    image.src = photo;
    await image.decode();
    const size = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const baseScale = Math.max(size / image.width, size / image.height);
    const scale = baseScale * zoom;
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (size - width) / 2 + offset.x * 3, (size - height) / 2 + offset.y * 3, width, height);
    drawFrame(ctx, frame, size);
    return canvas;
  }, [drawFrame, frame, offset.x, offset.y, photo, zoom]);

  const download = async () => {
    const canvas = await makeImage();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "minha-foto-jair-martins.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setReady(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const share = async () => {
    const canvas = await makeImage();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], "minha-foto-jair-martins.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Jair Martins 1011" });
    else download();
  };

  useEffect(() => () => { if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo); }, [photo]);

  if (ready) {
    return (
      <main className="campaign-shell campaign-success">
        <div className="success-check"><Check strokeWidth={4} /></div>
        <p className="campaign-kicker">TUDO CERTO!</p>
        <h1>SUA FOTO ESTÁ<br />PRONTA!</h1>
        <p className="success-copy">A foto foi salva no seu celular.</p>
        <button className="campaign-button button-yellow" onClick={share}><Share2 /> COMPARTILHAR FOTO</button>
        <button className="campaign-button button-blue" onClick={() => { setPhoto(null); setReady(false); }}><RotateCcw /> CRIAR OUTRA FOTO</button>
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
          <div className="photo-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Sua foto para ajustar" draggable={false} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} />
            <FrameArtwork frame={frame} />
          </div>
          <p className="drag-hint"><Hand /> ARRASTE A FOTO PARA AJUSTAR</p>
          <div className="zoom-controls">
            <button aria-label="Diminuir foto" onClick={() => setZoom((value) => Math.max(.75, value - .1))}><Minus /></button>
            <button className="center-control" onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(1); }}>CENTRALIZAR</button>
            <button aria-label="Aumentar foto" onClick={() => setZoom((value) => Math.min(2.2, value + .1))}><Plus /></button>
          </div>
          <div className="frame-heading"><b>MOLDURAS</b><span><Check /> MOLDURA ESCOLHIDA</span></div>
          <div className="frame-list">
            {frames.map((item) => (
              <button key={item.id} className={frame === item.id ? "selected" : ""} onClick={() => setFrame(item.id)} aria-label={`Moldura ${item.name}`} aria-pressed={frame === item.id}>
                <div className="frame-thumb" style={{ backgroundImage: `url(${photo})`, backgroundPosition: `calc(50% + ${offset.x / 4}px) calc(50% + ${offset.y / 4}px)`, backgroundSize: `${100 * zoom}%` }}><FrameArtwork frame={item.id} compact /></div>
                <small>{String(item.id + 1).padStart(2, "0")}</small>
                {frame === item.id && <i><Check /></i>}
              </button>
            ))}
          </div>
          <button className="campaign-button button-yellow download-button" onClick={download}><Download /> BAIXAR MINHA FOTO</button>
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
