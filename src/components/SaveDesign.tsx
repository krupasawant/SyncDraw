import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveDesign, setCurrentDesign } from '../redux/canvasSlice';
import type { AppDispatch, RootState } from '../redux/store';
import   { useAuth } from "@clerk/clerk-react";



const SaveDesign: React.FC= () => {
  const dispatch = useDispatch<AppDispatch>();
  const objects = useSelector((state: RootState) => state.canvas.objects);
  const currentDesignId = useSelector((state: RootState) => state.canvas.currentDesignId);
  const currentDesignTitle = useSelector((state: RootState) => state.canvas.currentDesignTitle);

  const [title, setTitle] = useState(currentDesignTitle || '');
    const { getToken } = useAuth(); 

  // Sync title when existing design is loaded
  useEffect(() => {
    setTitle(currentDesignTitle || '');
  }, [currentDesignTitle]);

  const handleSave =async () => {
    if (!objects.length) {
      alert('Canvas is empty!');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a name for your design');
      return;
    }

    // Dispatch saveDesign with optional existing design ID
    try {
      const token = await getToken(); // get JWT from Clerk
      if (!token) {
      alert('User not authenticated!');
      return;
    }

      // Dispatch Redux thunk with token
      const res: any = await dispatch(
        saveDesign({ token, title, objects, id: currentDesignId })
      );

      if (res.payload?._id) {
        dispatch(setCurrentDesign({ id: res.payload._id, title }));
        alert('Design saved successfully!');
      } else {
        alert('Failed to save design.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save design.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Design name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          padding: '4px 6px',
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: '13px',
        }}
        disabled={!!currentDesignId} // lock name for existing design
      />
      <button
        onClick={handleSave}
        style={{
          padding: '4px 10px',
          border: '1px solid #ccc',
          borderRadius: 4,
          background: '#f9f9f9',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Save
      </button>
    </div>
  );
};

export default SaveDesign;
