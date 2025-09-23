import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BaseObject } from '../types/object';

interface CanvasState {
  objects: BaseObject[];
  selectedObjectId?: string;
  history: BaseObject[][];
  redoHistory: BaseObject[][];
}

const initialState: CanvasState = {
  objects: [],
  selectedObjectId: undefined,
  history: [],
  redoHistory: [],
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addObject: (state, action: PayloadAction<BaseObject>) => {
      state.history.push([...state.objects]);
      if (state.history.length > 10) state.history.shift();
      state.redoHistory = [];
      state.objects.push(action.payload);
    },
    updateObject: (state, action: PayloadAction<{ id: string; changes: Partial<BaseObject> }>) => {
      const idx = state.objects.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) {
        state.history.push([...state.objects]);
        if (state.history.length > 10) state.history.shift();
        state.redoHistory = [];
        state.objects[idx] = { ...state.objects[idx], ...action.payload.changes };
      }
    },
    removeObject: (state, action: PayloadAction<string>) => {
      state.history.push([...state.objects]);
      if (state.history.length > 10) state.history.shift();
      state.redoHistory = [];
      state.objects = state.objects.filter(o => o.id !== action.payload);
      if (state.selectedObjectId === action.payload) state.selectedObjectId = undefined;
    },
    selectObject: (state, action: PayloadAction<string | undefined>) => {
      state.selectedObjectId = action.payload;
    },
    updateObjectsOrder: (state, action: PayloadAction<{ id: string; direction: 'forward' | 'backward' }>) => {
      const idx = state.objects.findIndex(obj => obj.id === action.payload.id);
      if (idx === -1) return;
      if (action.payload.direction === 'forward' && idx < state.objects.length - 1) {
        [state.objects[idx], state.objects[idx + 1]] = [state.objects[idx + 1], state.objects[idx]];
      } else if (action.payload.direction === 'backward' && idx > 0) {
        [state.objects[idx], state.objects[idx - 1]] = [state.objects[idx - 1], state.objects[idx]];
      }
    },
    undo: (state) => {
      const previous = state.history.pop();
      if (previous) {
        state.redoHistory.push([...state.objects]);
        state.objects = previous;
        state.selectedObjectId = undefined;
      }
    },
    redo: (state) => {
      const next = state.redoHistory.pop();
      if (next) {
        state.history.push([...state.objects]);
        state.objects = next;
        state.selectedObjectId = undefined;
      }
    },
  },
});

export const { addObject, updateObject, removeObject, selectObject, updateObjectsOrder, undo, redo } =
  canvasSlice.actions;

export default canvasSlice.reducer;
