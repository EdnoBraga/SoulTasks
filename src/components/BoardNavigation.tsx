import { useEffect, useState } from 'react';
import { BOARD_ZOOM_LEVELS, normalizeBoardZoom, type BoardZoom } from '../domain/boardZoom';

export default function BoardNavigation() {
  const [zoom, setZoom] = useState<BoardZoom>(() => normalizeBoardZoom(localStorage.getItem('soultasks-board-zoom')));

  useEffect(() => {
    localStorage.setItem('soultasks-board-zoom', String(zoom));
    const canvas = document.querySelector<HTMLDivElement>('.board-canvas');
    const columns = canvas?.querySelector<HTMLElement>('.columns-row');
    if (!canvas || !columns) return;
    columns.style.zoom = String(zoom / 100);
    const shiftScroll = (event: WheelEvent) => { if (event.shiftKey) { event.preventDefault(); canvas.scrollLeft += event.deltaY; } };
    let dragStart: { x: number; scrollLeft: number } | null = null;
    const pointerDown = (event: PointerEvent) => { if (event.target !== event.currentTarget) return; dragStart = { x: event.clientX, scrollLeft: canvas.scrollLeft }; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-panning'); };
    const pointerMove = (event: PointerEvent) => { if (dragStart) canvas.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x); };
    const pointerUp = () => { dragStart = null; canvas.classList.remove('is-panning'); };
    canvas.addEventListener('wheel', shiftScroll, { passive: false }); canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp);
    return () => { canvas.removeEventListener('wheel', shiftScroll); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerUp); };
  }, [zoom]);

  return <div className="board-navigation" aria-label="Navegação do quadro"><span>Quadro</span><div className="zoom-picker">{BOARD_ZOOM_LEVELS.map((level) => <button key={level} className={zoom === level ? 'active' : ''} onClick={() => setZoom(level)} aria-label={`Zoom ${level}%`}>{level}%</button>)}</div><small>Shift + rolagem para mover</small></div>;
}
