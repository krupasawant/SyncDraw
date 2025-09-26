import './App.css';
import { useState,useRef } from 'react';


import type KonvaType from 'konva';

import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import EditPanel from './components/EditPanel';
import Sidebar from './components/SideBar';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';


import type { BaseObject } from './types/object';
import Navbar from './components/Navbar';
const publishableKey =  import.meta.env.VITE_CLERK_FRONTEND_API;

function App() {
  
  const [selectedDesign, setSelectedDesign] = useState<{
    _id?: string;
    title?: string;
    data: BaseObject[];
  } | null>(null);

  const stageRef = useRef<KonvaType.Stage | null>(null);

  return (
    <ClerkProvider publishableKey={publishableKey}>
       <Navbar></Navbar>
    <SignedIn>
    
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar to load past designs */}
     
      <Sidebar
        
        onSelectDesign={(data, id, title) =>
          setSelectedDesign({ _id: id, title, data })
        }
      />


      {/* Main canvas and controls */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Toolbar stageRef={stageRef}></Toolbar>
        <CanvasEditor stageRef={stageRef}
        selectedDesign={selectedDesign || undefined} />
        <EditPanel />
      </div>
    </div>
    </SignedIn>
    <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}

export default App;
