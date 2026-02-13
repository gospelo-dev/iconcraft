import { useState, useRef, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { IconCraftInstance, AnimationType, DialPreset, ReticlePreset } from 'gospelo-iconcraft-react';
import { IconCraftView } from 'gospelo-iconcraft-react';

export interface DraggableIconProps {
  instance: IconCraftInstance;
  initialX?: number;
  initialY?: number;
  scaleX?: number;
  scaleY?: number;
  zIndex?: number;
  size?: number;
  rotation?: number;
  animation?: AnimationType;
  selected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onRotationChange?: (deg: number) => void;
  onDragStart?: () => void;
  onDrop?: (x: number, y: number) => void;
  dialPreset?: DialPreset;
  showReticle?: boolean;
  reticlePreset?: ReticlePreset;
  cssRotation?: number | null;
}

export function DraggableIcon({
  instance,
  initialX = 0,
  initialY = 0,
  scaleX = 1,
  scaleY = 1,
  zIndex = 1,
  size,
  rotation: _rotation = 0,
  animation,
  selected = false,
  onSelect,
  onPositionChange,
  onRotationChange,
  onDragStart,
  onDrop,
  dialPreset,
  showReticle,
  reticlePreset,
  cssRotation,
}: DraggableIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);

  // Sync position when initialX/initialY change (e.g. from parent state)
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);

  // --- Drag handling ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
    onDragStart?.();

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: position.x,
      elemY: position.y,
    };
    setIsDragging(true);
  }, [onSelect, onDragStart, position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const newX = dragStartRef.current.elemX + deltaX / scaleX;
    const newY = dragStartRef.current.elemY + deltaY / scaleY;

    setPosition({ x: newX, y: newY });
    onPositionChange?.(newX, newY);
  }, [isDragging, onPositionChange, scaleX, scaleY]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onDrop?.(e.clientX, e.clientY);
    }
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging, onDrop]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- Rendering ---
  const scaledSize = size ? size * scaleX : undefined;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: position.x * scaleX,
    top: position.y * scaleY,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : zIndex,
    userSelect: 'none',
    borderRadius: '50%',
    transition: isDragging ? 'none' : 'outline 0.15s ease',
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <IconCraftView
        instance={instance}
        animation={isDragging ? undefined : animation}
        style={scaledSize ? { width: scaledSize, height: scaledSize } : undefined}
        showRotationDial={selected}
        onRotationChange={onRotationChange}
        rotationSnap={5}
        dialPreset={dialPreset}
        showReticle={showReticle}
        reticlePreset={reticlePreset}
        cssRotation={cssRotation}
      />
    </div>
  );
}
