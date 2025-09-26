import { useRef, useEffect, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Arrow,
  Text as KonvaText,
  Image as KonvaImage,
  Transformer,
} from 'react-konva';
import useImage from 'use-image';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import {
  selectObject,
  updateObject,
  loadDesign,
  setCurrentDesign,
  newDesign,
  addCollaborator,
} from '../redux/canvasSlice';
import SaveDesign from './SaveDesign';
import type { BaseObject } from '../types/object';
import { useAuth } from '@clerk/clerk-react';

import Konva from 'konva';

interface CanvasEditorProps {
   stageRef: React.RefObject<Konva.Stage | null>;
  selectedDesign?: {
    _id?: string;
    title?: string;
    data: BaseObject[];
    ownerId?: string;
  };
  currentUserId?: string;
}

function ImageObject({ obj, commonProps, handleTransformEnd }: any) {
  const [img] = useImage(obj.src || '');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (img) {
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      setDimensions({ width: img.width * scale, height: img.height * scale });
    }
  }, [img]);

  if (!img || !dimensions) return null;

  return (
    <KonvaImage
      {...commonProps}
      image={img}
      width={dimensions.width}
      height={dimensions.height}
      opacity={obj.opacity || 1}
      onTransformEnd={(e) => handleTransformEnd(obj.id, e.target)}
    />
  );
}

export default function CanvasEditor({ stageRef,selectedDesign, currentUserId }: CanvasEditorProps) {
  const { getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const objects = useSelector((state: RootState) => state.canvas.objects);
  const selectedId = useSelector((state: RootState) => state.canvas.selectedObjectId);
  const currentDesignId = useSelector((state: RootState) => state.canvas.currentDesignId);
  const currentDesignTitle = useSelector(
    (state: RootState) => state.canvas.currentDesignTitle
  );

  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [collabEmail, setCollabEmail] = useState('');

  

  // --- Socket connection ---
  /*
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("connect", () => console.log("Socket connected:", socketRef.current?.id));
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);*/

  // --- Attach transformer ---
  useEffect(() => {
    const selectedNode = layerRef.current?.findOne(`#${selectedId}`);
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, objects]);

  // --- Load design ---
  useEffect(() => {
    if (selectedDesign) {
      dispatch(loadDesign(selectedDesign.data));
      dispatch(setCurrentDesign({ id: selectedDesign._id, title: selectedDesign.title }));
    } else {
      dispatch(newDesign());
    }
  }, [selectedDesign, dispatch]);

  // --- Join socket room & receive updates ---
  /*
  useEffect(() => {
  if (currentDesignId && socketRef.current) {
    socketRef.current.emit('join-design', currentDesignId);

    const handleRemoteUpdate = (data: { objects: BaseObject[]; updatedBy?: string }) => {
      dispatch(loadDesign(data.objects));
    };

    socketRef.current.on('remote-canvas-update', handleRemoteUpdate);

    // cleanup
    return () => {
      socketRef.current?.off('remote-canvas-update', handleRemoteUpdate);
    };
  }

  // Always return a noop cleanup to satisfy TypeScript
  return () => {};
}, [currentDesignId, dispatch]);


  // --- Emit updates ---
  const emitUpdate = (updatedObjects: BaseObject[]) => {
    if (!socketRef.current || !currentDesignId) return;
    socketRef.current.emit('canvas-update', {
      designId: currentDesignId,
      objects: updatedObjects,
      updatedBy: currentUserId,
    });
  };*/

  const handleSelect = (id: string | undefined) => dispatch(selectObject(id));

  const handleDragEnd = (id: string, x: number, y: number) => {
    dispatch(updateObject({ id, changes: { x, y } }));
    //const updatedObjects = objects.map(o => o.id === id ? { ...o, x, y } : o);
    //emitUpdate(updatedObjects);
  };

  const handleTransformEnd = (id: string, node: any) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const updatedObject = {
      x: node.x(),
      y: node.y(),
      width: (node.width() || 0) * scaleX,
      height: (node.height() || 0) * scaleY,
      rotation: node.rotation(),
    };

    dispatch(updateObject({ id, changes: updatedObject }));

    //const updatedObjects = objects.map(o => o.id === id ? { ...o, ...updatedObject } : o);
   // emitUpdate(updatedObjects);
  };

  const handleDoubleClickText = (obj: BaseObject) => {
    if (obj.type === 'text') {
      setEditingTextId(obj.id);
      setEditingTextValue(obj.text || '');
    }
  };

  const handleTextBlur = (obj: BaseObject) => {
    dispatch(updateObject({ id: obj.id, changes: { text: editingTextValue } }));
    //const updatedObjects = objects.map(o => o.id === obj.id ? { ...o, text: editingTextValue } : o);
    //emitUpdate(updatedObjects);
    setEditingTextId(null);
  };

  const handleAddCollaboratorClick = async () => {
    const token = await getToken(); 
    if (!token || !collabEmail || !currentDesignId) return;
    dispatch(addCollaborator({ designId: currentDesignId, email: collabEmail, token }));
    setCollabEmail('');
  };

  return (
    <div style={{ flex: 1, position: 'relative', background: '#fdfdfd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, fontWeight: 600, fontSize: 16, background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: 4, zIndex: 1000 }}>
        {currentDesignTitle || 'New Design'}
      </div>

      {selectedDesign?.ownerId === currentUserId && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="email" placeholder="Add collaborator" value={collabEmail} onChange={e => setCollabEmail(e.target.value)} style={{ padding: 4, borderRadius: 4 }} />
          <button onClick={handleAddCollaboratorClick} style={{ padding: '4px 8px', cursor: 'pointer' }}>Add</button>
        </div>
      )}

      <Stage width={window.innerWidth - 400} height={window.innerHeight - 40} onMouseDown={e => e.target === e.target.getStage() && handleSelect(undefined)} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6 }} ref={stageRef}>
        <Layer ref={layerRef}>
          {objects.map(obj => {
            const commonProps = { id: obj.id, key: obj.id, x: obj.x, y: obj.y, draggable: true, onClick: () => handleSelect(obj.id), onDragEnd: (e: { target: { x: () => number; y: () => number; }; }) => handleDragEnd(obj.id, e.target.x(), e.target.y()), rotation: obj.rotation || 0 };

            switch (obj.type) {
              case 'shape':
                switch (obj.shapeType) {
                  case 'rectangle':
                    return <Rect {...commonProps} width={obj.width || 100} height={obj.height || 100} fill={obj.fillColor || '#fff'} stroke={obj.strokeColor || '#000'} strokeWidth={obj.strokeWidth || 2} onTransformEnd={e => handleTransformEnd(obj.id, e.target)} />;
                  case 'circle':
                    return <Circle {...commonProps} radius={obj.width ? obj.width / 2 : 50} fill={obj.fillColor || '#fff'} stroke={obj.strokeColor || '#000'} strokeWidth={obj.strokeWidth || 2} onTransformEnd={e => handleTransformEnd(obj.id, e.target)} />;
                  case 'triangle':
                    return <Line {...commonProps} points={[0, obj.height || 100, (obj.width || 100)/2,0,obj.width ||100,obj.height||100]} closed fill={obj.fillColor || '#fff'} stroke={obj.strokeColor || '#000'} strokeWidth={obj.strokeWidth||2} onTransformEnd={e => handleTransformEnd(obj.id, e.target)} />;
                  case 'arrow':
                    return <Arrow {...commonProps} points={[0,0,obj.width||100,obj.height||0]} pointerLength={10} pointerWidth={10} fill={obj.fillColor||'#000'} stroke={obj.strokeColor||'#000'} strokeWidth={obj.strokeWidth||2} />;
                  case 'line':
                    return <Line {...commonProps} points={[0,0,obj.width||100,obj.height||0]} stroke={obj.strokeColor||'#000'} strokeWidth={obj.strokeWidth||2} />;
                  default: return null;
                }
              case 'text':
                return (
                  <>
                    <KonvaText {...commonProps} text={obj.text || 'Sample Text'} fontSize={obj.fontSize || 20} fill={obj.color || '#000'} onDblClick={() => handleDoubleClickText(obj)} onTransformEnd={e => handleTransformEnd(obj.id, e.target)} />
                    {editingTextId === obj.id && (
                      <input style={{ position:'absolute', top: obj.y, left: obj.x, fontSize: obj.fontSize, color: obj.color, background:'transparent', border:'1px solid #ccc', padding:2, zIndex:2000 }}
                        value={editingTextValue}
                        onChange={e => setEditingTextValue(e.target.value)}
                        onBlur={() => handleTextBlur(obj)}
                        autoFocus
                      />
                    )}
                  </>
                );
              case 'image':
                return <ImageObject key={obj.id} obj={obj} commonProps={commonProps} handleTransformEnd={handleTransformEnd} />;
              default: return null;
            }
          })}
          <Transformer ref={transformerRef} rotateEnabled enabledAnchors={['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center']} />
        </Layer>
      </Stage>

      <div style={{ position:'absolute', bottom:15, right:15, zIndex:100, background:'#fff', border:'1px solid #ddd', borderRadius:6, padding:'6px 10px', boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }}>
        <SaveDesign />
      </div>
    </div>
  );
}
