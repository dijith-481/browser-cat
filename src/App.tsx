import { Pet } from "./Pet";
import { useTextSelection } from "./useTextSelection";
import { breakdown } from "./Breakdown";
import { useEffect, useState } from "react";

function App() {
  useTextSelection();

  const [isbreakdown, setIsbreakdown] = useState(false);
  const [firstBreakdown, setFirstBreakdown] = useState(false);
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "GET_TAB_COUNT" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          setPetCount(1);
        } else if (response && response.count) {
          setPetCount(response.count);
        } else {
          setPetCount(1);
        }
      });
    } else {
      console.log("Not in an extension context. Defaulting to 1 pet.");
      setPetCount(1);
    }
  }, []);

  useEffect(() => {
    if (isbreakdown && !firstBreakdown) {
      setFirstBreakdown(true);
      breakdown();
    }
  }, [isbreakdown, firstBreakdown]);

  return (
    <div>
      {Array.from({ length: petCount }).map((_, index) => (
        <Pet key={index} setIsbreakdown={setIsbreakdown} />
      ))}
    </div>
  );
}

export default App;
