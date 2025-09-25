import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BaseObject, Design } from '../types/object';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/designs';



export const fetchDesigns = createAsyncThunk(
  'canvas/fetchDesigns',
  async (token: string) => {
    console.log(API_URL); 
    const res = await axios.get(`${API_URL}`, 
      {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as Design[];
  }
);

// Save current canvas as a new design
export const saveDesign = createAsyncThunk(
  'canvas/saveDesign',
  async (payload: { token: string; title: string; objects: BaseObject[]; id?: string }) => {
    const { token, title, objects, id } = payload;

    if (id) {
      // Update existing design
      const res = await axios.put(`${API_URL}/${id}`, {
        title,
        data: objects,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data as Design;
    } else {
      // Create new design
      const res = await axios.post(API_URL, {
        title,
        data: objects,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data as Design;
    }
  }
);

export const addCollaborator = createAsyncThunk<
  Design, // return type
  { designId: string; email: string; token: string }, // payload
  { rejectValue: string }
>(
  'canvas/addCollaborator',
  async ({ designId, email, token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/${designId}/collaborators`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data as Design;
    } catch (err: any) {
      console.error(err);
      return rejectWithValue(err.response?.data?.error || 'Failed to add collaborator');
    }
  }
);


interface CanvasState {
  objects: BaseObject[];
  selectedObjectId?: string;
  history: BaseObject[][];
  redoHistory: BaseObject[][];
  previousDesigns: Design[];
  loading: boolean;
  error?: string;
  currentDesignId?: string;
  currentDesignTitle?: string;
}

const initialState: CanvasState = {
  objects: [],
  selectedObjectId: undefined,
  history: [],
  redoHistory: [],
  previousDesigns: [],
  loading: false,
  error: undefined,

};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setObjects: (state, action: PayloadAction<BaseObject[]>) => {
      state.objects = action.payload;
      state.selectedObjectId = undefined;
      state.history = [];
      state.redoHistory = [];
    },
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
    loadDesign: (state, action: PayloadAction<BaseObject[]>) => {
      state.objects = action.payload;
      state.history = [];
      state.redoHistory = [];
      state.selectedObjectId = undefined;
    },
    newDesign: (state) => {
      state.objects = [];
      state.history = [];
      state.redoHistory = [];
      state.selectedObjectId = undefined;
      state.currentDesignId = undefined;
      state.currentDesignTitle = undefined;
    },
    setCurrentDesign: (
      state,
      action: PayloadAction<{ id?: string; title?: string }>
    ) => {
      state.currentDesignId = action.payload.id;
      state.currentDesignTitle = action.payload.title;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.previousDesigns = action.payload;
        state.objects = action.payload[0]?.data || [];
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch designs';
      })
      .addCase(saveDesign.fulfilled, (state, action) => {
        state.previousDesigns.unshift(action.payload);
        if (state.previousDesigns.length > 10) state.previousDesigns.pop();
        console.log('Design saved:', action.payload._id);
      })
      .addCase(saveDesign.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save design';
      })
      .addCase(addCollaborator.fulfilled, (state, action) => {
      // Update the design in previousDesigns
      const idx = state.previousDesigns.findIndex(d => d._id === action.payload._id);
      if (idx !== -1) {
        state.previousDesigns[idx] = action.payload;
      }
      // If currently open design, update it too
      if (state.currentDesignId === action.payload._id) {
        state.objects = action.payload.data;
      }
    })
    .addCase(addCollaborator.rejected, (state, action) => {
      state.error = action.payload || 'Failed to add collaborator';
    });


  },


});



export const { newDesign, setCurrentDesign, loadDesign, setObjects, addObject, updateObject, removeObject, selectObject, updateObjectsOrder, undo, redo } =
  canvasSlice.actions;

export default canvasSlice.reducer;
