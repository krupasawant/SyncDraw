
import './App.css'
import  CanvasEditor  from './components/CanvasEditor'
import Toolbar from './components/Toolbar'
import EditPanel from './components/EditPanel'


function App() {
  

  return (
    <div>
      <Toolbar></Toolbar>
      <CanvasEditor></CanvasEditor>
       <EditPanel />
    </div>
    
  )
}

export default App
