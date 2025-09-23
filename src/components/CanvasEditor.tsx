
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
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { selectObject, updateObject } from '../redux/canvasSlice';
import useImage from 'use-image';
import type { BaseObject } from '../types/object';

// Wrapper component for uploaded images
function ImageObject({ obj, commonProps, handleTransformEnd }: any) {
  const [img, status] = useImage(obj.src || '');
  const [dimensions, setDimensions] = useState<{width:number,height:number}|null>(null);

  useEffect(() => {
    if (img) {
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      setDimensions({ width: img.width * scale, height: img.height * scale });
    }
  }, [img]);

  if (!img || !dimensions) return null; // still loading

  return (
    <KonvaImage
      {...commonProps}
      image={img}
      width={dimensions.width}
      height={dimensions.height}
      opacity={obj.opacity || 1}
      onTransformEnd={e => handleTransformEnd(obj.id, e.target)}
    />
  );
}


export default function CanvasEditor() {
  const objects = useSelector((state: RootState) => state.canvas.objects);
  const selectedId = useSelector((state: RootState) => state.canvas.selectedObjectId);
  const dispatch = useDispatch();

  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');

  // Update transformer when selection changes
  useEffect(() => {
    const selectedNode = layerRef.current?.findOne(`#${selectedId}`);
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, objects]);

  const handleSelect = (id: string | undefined) => dispatch(selectObject(id));
  const handleDragEnd = (id: string, x: number, y: number) =>
    dispatch(updateObject({ id, changes: { x, y } }));

  const handleTransformEnd = (id: string, node: any) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    dispatch(
      updateObject({
        id,
        changes: {
          x: node.x(),
          y: node.y(),
          width: (node.width() || 0) * scaleX,
          height: (node.height() || 0) * scaleY,
          rotation: node.rotation(),
        },
      })
    );
  };

  const handleDoubleClickText = (obj: BaseObject) => {
    if (obj.type === 'text') {
      setEditingTextId(obj.id);
      setEditingTextValue(obj.text || '');
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={e => {
        // deselect when clicking on empty canvas
        if (e.target === e.target.getStage()) handleSelect(undefined);
      }}
    >
      <Layer ref={layerRef}>
        {objects.map(obj => {
          const commonProps = {
            id: obj.id,
            key: obj.id,
            x: obj.x,
            y: obj.y,
            draggable: true,
            onClick: () => handleSelect(obj.id),
            onDragEnd: (e: any) => handleDragEnd(obj.id, e.target.x(), e.target.y()),
            rotation: obj.rotation || 0,
          };

          switch (obj.type) {
            case 'shape':
              switch (obj.shapeType) {
                case 'rectangle':
                  return (
                    <Rect
                      {...commonProps}
                      width={obj.width || 100}
                      height={obj.height || 100}
                      fill={obj.fillColor || '#fff'}
                      stroke={obj.strokeColor || '#000'}
                      strokeWidth={obj.strokeWidth || 2}
                      onTransformEnd={e => handleTransformEnd(obj.id, e.target)}
                    />
                  );
                case 'circle':
                  return (
                    <Circle
                      {...commonProps}
                      radius={obj.width ? obj.width / 2 : 50}
                      fill={obj.fillColor || '#fff'}
                      stroke={obj.strokeColor || '#000'}
                      strokeWidth={obj.strokeWidth || 2}
                      onTransformEnd={e => handleTransformEnd(obj.id, e.target)}
                    />
                  );
                case 'triangle':
                  return (
                    <Line
                      {...commonProps}
                      points={[0, obj.height || 100, (obj.width || 100) / 2, 0, obj.width || 100, obj.height || 100]}
                      closed
                      fill={obj.fillColor || '#fff'}
                      stroke={obj.strokeColor || '#000'}
                      strokeWidth={obj.strokeWidth || 2}
                      onTransformEnd={e => handleTransformEnd(obj.id, e.target)}
                    />
                  );
                case 'arrow':
                  return (
                    <Arrow
                      {...commonProps}
                      points={[0, 0, obj.width || 100, obj.height || 0]}
                      pointerLength={10}
                      pointerWidth={10}
                      fill={obj.fillColor || '#000'}
                      stroke={obj.strokeColor || '#000'}
                      strokeWidth={obj.strokeWidth || 2}
                    />
                  );
                case 'line':
                  return (
                    <Line
                      {...commonProps}
                      points={[0, 0, obj.width || 100, obj.height || 0]}
                      stroke={obj.strokeColor || '#000'}
                      strokeWidth={obj.strokeWidth || 2}
                    />
                  );
                default:
                  return null;
              }

            case 'text':
              return (
                <>
                  <KonvaText
                    {...commonProps}
                    text={obj.text || 'Sample Text'}
                    fontSize={obj.fontSize || 20}
                    fill={obj.color || '#000'}
                    onDblClick={() => handleDoubleClickText(obj)}
                    onTransformEnd={e => handleTransformEnd(obj.id, e.target)}
                  />
                  {editingTextId === obj.id && (
                    <input
                      style={{
                        position: 'absolute',
                        top: obj.y,
                        left: obj.x,
                        fontSize: obj.fontSize,
                        color: obj.color,
                        background: 'transparent',
                        border: '1px solid #ccc',
                        padding: 2,
                      }}
                      value={editingTextValue}
                      onChange={e => setEditingTextValue(e.target.value)}
                      onBlur={() => {
                        dispatch(updateObject({ id: obj.id, changes: { text: editingTextValue } }));
                        setEditingTextId(null);
                      }}
                      autoFocus
                    />
                  )}
                </>
              );

            case 'image':
              return <ImageObject key={obj.id} obj={obj} commonProps={commonProps} handleTransformEnd={handleTransformEnd} />;

            default:
              return null;
          }
        })}

        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
          ]}
        />
      </Layer>
    </Stage>
  );
}
