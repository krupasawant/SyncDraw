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

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '6px 10px',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '4px 6px',
    fontSize: '13px',
    background: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: 'pointer',
  };

  const disabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  return (
    <div style={toolbarStyle}>
      <button style={buttonStyle} onClick={() => addShape('rectangle')}>▭</button>
      <button style={buttonStyle} onClick={() => addShape('circle')}>⬤</button>
      <button style={buttonStyle} onClick={() => addShape('triangle')}>△</button>
      <button style={buttonStyle} onClick={() => addShape('arrow')}>➝</button>
      <button style={buttonStyle} onClick={() => addShape('line')}>━</button>
      <button style={buttonStyle} onClick={addText}>✎</button>

      <label style={{ ...buttonStyle, display: 'inline-block' }}>
        ⬆
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </label>

      <button style={buttonStyle} onClick={() => dispatch(undo())}>Undo</button>
      <button style={buttonStyle} onClick={() => dispatch(redo())}>Redo</button>
      <button
        style={selectedId ? buttonStyle : disabledStyle}
        onClick={() => selectedId && dispatch(removeObject(selectedId))}
        disabled={!selectedId}
      >
        Delete
      </button>
      <button
        style={selectedId ? buttonStyle : disabledStyle}
        onClick={() => selectedId && dispatch(updateObjectsOrder({ id: selectedId, direction: 'forward' }))}
        disabled={!selectedId}
      >
        Bring ↑
      </button>
      <button
        style={selectedId ? buttonStyle : disabledStyle}
        onClick={() => selectedId && dispatch(updateObjectsOrder({ id: selectedId, direction: 'backward' }))}
        disabled={!selectedId}
      >
        Send ↓
      </button>
      <button style={buttonStyle} onClick={handleExport}>Export</button>
    </div>
  );
}
