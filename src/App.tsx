import { Pet } from "./Pet";
import { useTextSelection } from "./useTextSelection";
import { breakdown } from "./Breakdown";
import { useEffect, useState } from "react";

function App() {
  useTextSelection();

  const [isbreakdown, setIsbreakdown] = useState(false);
  const [firstBreakdown, setFirstBreakdown] = useState(false);

  useEffect(() => {
    if (isbreakdown && !firstBreakdown) {
      setFirstBreakdown(true);
      breakdown();
    }
  }, [isbreakdown, firstBreakdown]);

  return (
    <div>
      <Pet setIsbreakdown={setIsbreakdown} />
      <Pet setIsbreakdown={setIsbreakdown} />
    </div>
  );
}

export default App;
