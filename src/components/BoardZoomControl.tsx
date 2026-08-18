import { useEffect, useState, type RefObject } from 'react';
import { BOARD_ZOOM_MAX, BOARD_ZOOM_MIN, normalizeBoardZoom, type BoardZoom } from '../domain/boardZoom';

type BoardZoomControlProps = { canvasRef: RefObject<HTMLDivElement | null> };

export default function BoardZoomControl({ canvasRef }: BoardZoomControlProps) {
  const [zoom, setZoom] = useState<BoardZoom>(() => normalizeBoardZoom(localStorage.getItem('soultasks-board-zoom')));

  useEffect(() => {
    localStorage.setItem('soultasks-board-zoom', String(zoom));
    const canvas = canvasRef.current;
    const columns = canvas?.querySelector<HTMLElement>('.columns-row');
    if (!canvas || !columns) return;

    columns.style.zoom = String(zoom / 100);
    const shiftScroll = (event: WheelEvent) => {
      if (event.shiftKey) {
        event.preventDefault();
        canvas.scrollLeft += event.deltaY;
      }
    };
    let dragStart: { x: number; scrollLeft: number } | null = null;
    const pointerDown = (event: PointerEvent) => {
      if (event.target !== event.currentTarget) return;
      dragStart = { x: event.clientX, scrollLeft: canvas.scrollLeft };
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-panning');
    };
    const pointerMove = (event: PointerEvent) => {
      if (dragStart) canvas.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x);
    };
    const pointerUp = () => {
      dragStart = null;
      canvas.classList.remove('is-panning');
    };

    canvas.addEventListener('wheel', shiftScroll, { passive: false });
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    return () => {
      canvas.removeEventListener('wheel', shiftScroll);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.classList.remove('is-panning');
    };
  }, [canvasRef, zoom]);

  return <div className="board-zoom-control" aria-label="Controles do espaço de trabalho">
    <span className="board-zoom-label">Zoom do quadro</span>
    <input type="range" min={BOARD_ZOOM_MIN} max={BOARD_ZOOM_MAX} step="1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Ajustar zoom do quadro" />
    <output>{zoom}%</output>
    <small>Shift + rolagem para navegar</small>
  </div>;
}
