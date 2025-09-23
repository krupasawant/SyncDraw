import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateObject } from '../redux/canvasSlice';
import type { RootState } from '../redux/store';

export default function EditPanel() {
  const dispatch = useDispatch();
  const selectedObjectId = useSelector((state: RootState) => state.canvas.selectedObjectId);
  const obj = useSelector((state: RootState) =>
    state.canvas.objects.find(o => o.id === selectedObjectId)
  );

  if (!obj) return null;

  const handleChange = (key: string, value: any) => {
    dispatch(updateObject({ id: obj.id, changes: { [key]: value } }));
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '80px 1fr', 
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 4,
    fontSize: 14,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 240,
        background: '#f5f5f5',
        padding: 10,
        border: '1px solid #ccc',
        borderRadius: 6,
        zIndex: 1000,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Edit Properties</h4>

      {/* Shape properties */}
      {obj.type === 'shape' && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>Fill</label>
            <input
              type="color"
              value={obj.fillColor || '#ffffff'}
              onChange={e => handleChange('fillColor', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Stroke</label>
            <input
              type="color"
              value={obj.strokeColor || '#000000'}
              onChange={e => handleChange('strokeColor', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Width</label>
            <input
              type="number"
              value={obj.strokeWidth || 2}
              onChange={e => handleChange('strokeWidth', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Rotation</label>
            <input
              type="number"
              value={obj.rotation || 0}
              onChange={e => handleChange('rotation', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Text properties */}
      {obj.type === 'text' && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>Text</label>
            <input
              type="text"
              value={obj.text || ''}
              onChange={e => handleChange('text', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Font Size</label>
            <input
              type="number"
              value={obj.fontSize || 20}
              onChange={e => handleChange('fontSize', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Color</label>
            <input
              type="color"
              value={obj.color || '#000000'}
              onChange={e => handleChange('color', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Rotation</label>
            <input
              type="number"
              value={obj.rotation || 0}
              onChange={e => handleChange('rotation', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Image properties */}
      {obj.type === 'image' && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={obj.opacity || 1}
              onChange={e => handleChange('opacity', parseFloat(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Rotation</label>
            <input
              type="number"
              value={obj.rotation || 0}
              onChange={e => handleChange('rotation', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
        </>
      )}
    </div>
  );
}
