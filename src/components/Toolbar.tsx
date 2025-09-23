import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addObject, undo, redo, removeObject, updateObjectsOrder } from '../redux/canvasSlice';
import { v4 as uuid } from 'uuid';
import type { RootState } from '../redux/store';

export default function Toolbar() {
  const dispatch = useDispatch();
  const selectedId = useSelector((state: RootState) => state.canvas.selectedObjectId);

  const addShape = (shapeType: string) => {
    dispatch(addObject({
      id: uuid(),
      type: 'shape',
      shapeType: shapeType as any,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
    }));
  };

  const addText = () => {
    dispatch(addObject({
      id: uuid(),
      type: 'text',
      text: 'Sample Text',
      x: 150,
      y: 150,
      fontSize: 20,
      color: '#000000',
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch(addObject({
        id: uuid(),
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        src: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const stage = document.querySelector('canvas')?.parentElement;
    if (!stage) return;
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = (stage as HTMLCanvasElement).toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 150, zIndex: 1000, background: '#fff', padding: 10, border: '1px solid #ccc', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={() => addShape('rectangle')}>Rectangle</button>
      <button onClick={() => addShape('circle')}>Circle</button>
      <button onClick={() => addShape('triangle')}>Triangle</button>
      <button onClick={() => addShape('arrow')}>Arrow</button>
      <button onClick={() => addShape('line')}>Line</button>
      <button onClick={addText}>Text</button>
      <label style={{ cursor: 'pointer' }}>
        <span style={{ padding: '2px 4px', background: '#eee', border: '1px solid #ccc' }}>Upload Image</span>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </label>
      <button onClick={() => dispatch(undo())}>Undo</button>
      <button onClick={() => dispatch(redo())}>Redo</button>
      <button onClick={() => selectedId && dispatch(removeObject(selectedId))} disabled={!selectedId}>Delete</button>
      <button onClick={() => selectedId && dispatch(updateObjectsOrder({ id: selectedId, direction: 'forward' }))} disabled={!selectedId}>Bring Forward</button>
      <button onClick={() => selectedId && dispatch(updateObjectsOrder({ id: selectedId, direction: 'backward' }))} disabled={!selectedId}>Send Backward</button>
      <button onClick={handleExport}>Export PNG</button>
    </div>
  );
}
