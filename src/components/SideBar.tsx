import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { fetchDesigns } from '../redux/canvasSlice';
import type { BaseObject } from '../types/object';

import { useAuth } from "@clerk/clerk-react";


 

interface SidebarProps {
  
  onSelectDesign?: (data: BaseObject[], id?: string, title?: string) => void;
}

export default function Sidebar({ onSelectDesign }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { getToken } = useAuth();
  
  
  const [designs, setDesigns] = useState<{ _id: string; title: string; data: BaseObject[] }[]>([]);

  useEffect(() => {
    const loadDesigns = async () => {
      const token = await getToken(); 
      if (!token) return;

      const action = await dispatch(fetchDesigns(token));
      if (fetchDesigns.fulfilled.match(action)) {
        
        setDesigns(action.payload);
      }
    };
    loadDesigns();
  }, [getToken, dispatch]);

  const sidebarStyle: React.CSSProperties = {
    width: '180px',
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
    padding: '12px',
    height: '100vh',
    overflowY: 'auto',
    fontFamily: 'sans-serif',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '6px',
    marginBottom: '6px',
    background: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: 4,
    textAlign: 'left',
    fontSize: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 12px',
    color: '#333',
  };

  return (
    <div style={sidebarStyle}>
      <h3 style={titleStyle}>🧠 My Designs</h3>

      {/* New Design button */}
      <button
        style={{ ...buttonStyle, fontWeight: 'bold', background: '#e0f7ff' }}
        onClick={() => onSelectDesign?.([], undefined, undefined)} // blank canvas
        onMouseEnter={(e) => (e.currentTarget.style.background = '#d0f0ff')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#e0f7ff')}
      >
        ➕ New Design
      </button>

      {/* Existing designs */}
      {designs.map((design) => (
        <button
          key={design._id}
          onClick={() => onSelectDesign?.(design.data, design._id, design.title)}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f9f9f9')}
        >
          🗂 {design.title}
        </button>
      ))}

      {designs.length === 0 && (
        <p style={{ fontStyle: 'italic', fontSize: '12px', color: '#666' }}>No designs yet.</p>
      )}
    </div>
  );
}
