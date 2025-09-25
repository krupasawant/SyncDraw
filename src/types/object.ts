
export interface BaseObject {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  selected?: boolean;
  rotation?: number;

  // Text-specific props
  text?: string;
  fontSize?: number;
  fontStyle? : string;
  fontWeight? : number;
  color?: string;

  // Shape-specific props
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;

  // Image-specific props
  src?: string;
  opacity?: number;
  crop?: { x: number; y: number; width: number; height: number };
}


export interface Design {
  _id: string;
  title: string;
  userId: string;
  data: BaseObject[];
}
