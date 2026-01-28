import { useState, useRef, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { IconCraftInstance, AnimationType } from 'gospelo-iconcraft-react';
import { IconCraftView } from 'gospelo-iconcraft-react';

export interface DraggableIconProps {
  instance: IconCraftInstance;
  initialX?: number;
  initialY?: number;
  zIndex?: number;
  size?: number;
  animation?: AnimationType;
  selected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onDragStart?: () => void;
  onDrop?: (x: number, y: number) => void;
}

export function DraggableIcon({
  instance,
  initialX = 0,
  initialY = 0,
  zIndex = 1,
  size,
  animation,
  selected = false,
  onSelect,
  onPositionChange,
  onDragStart,
  onDrop,
}: DraggableIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  // Store the offset from mouse to element's position at drag start
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
    onDragStart?.();

    // Remember where the mouse was and where the element was
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

    // Calculate how much the mouse has moved since drag start
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    // New position = original position + delta
    const newX = dragStartRef.current.elemX + deltaX;
    const newY = dragStartRef.current.elemY + deltaY;

    setPosition({ x: newX, y: newY });
    onPositionChange?.(newX, newY);
  }, [isDragging, onPositionChange]);

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

  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : zIndex,
    userSelect: 'none',
    outline: selected ? '3px solid #0071e3' : 'none',
    outlineOffset: '4px',
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
        animationTarget={animation === 'rotateIcon' ? 'icon' : undefined}
        style={size ? { width: size, height: size } : undefined}
      />
    </div>
  );
}
