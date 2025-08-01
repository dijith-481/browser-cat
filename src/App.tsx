import { Pet } from "./Pet";
import { useTextSelection } from "./useTextSelection";

function App() {
  useTextSelection();

  return (
    <div>
      <Pet />
      <Pet />
    </div>
  );
}

export default App;
