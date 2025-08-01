import { useState, useEffect, useRef, useCallback } from "react";
import type { PetState } from "./animations";
import { PET_SIZE, animations } from "./animations";
import "./Pet.css";
import { FOOD_CRUMB_ID_TYPE } from "./useTextSelection";

const PET_SCALE = 2.5;
const VISUAL_PET_SIZE = PET_SIZE * PET_SCALE;

type Timeout = ReturnType<typeof setTimeout>;
interface PetProps {
  setIsbreakdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Pet: React.FC<PetProps> = ({ setIsbreakdown }) => {
  const [currentState, setCurrentState] = useState<PetState>("idle");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight - VISUAL_PET_SIZE,
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [happiness, setHappiness] = useState(100);
  const [happinessAnimTarget, setHappinessAnimTarget] = useState(100);
  const [message, setMessage] = useState<string | null>(null);

  const getHappinessClass = () => {
    if (happiness > 70) return "mood-happy";
    if (happiness > 30) return "mood-content";
    return "mood-sad";
  };

  const [stuntClass, setStuntClass] = useState("");
  const [movementSpeedClass, setMovementSpeedClass] = useState("walk-speed");

  const stateTimeoutRef = useRef<Timeout | null>(null);
  const messageTimeoutRef = useRef<Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const dragStartPos = useRef({ x: 0, y: 0 });

  const showMessage = useCallback((text: string, duration: number = 3000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage(text);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
      messageTimeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    const anim = animations[currentState];
    if (!anim) {
      setCurrentState("idle");
      return;
    }
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % anim.frameCount);
      if (!anim.loop && currentFrame >= anim.frameCount - 1) {
        setCurrentState(anim.nextState || "idle");
      }
    }, anim.frameRate);
    return () => clearInterval(frameInterval);
  }, [currentState, currentFrame]);

  useEffect(() => {
    console.log("useEffect");
    const happinessDecayInterval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      const decayRate = timeSinceLastInteraction > 10000 ? 2 : 1;
      setHappiness((prev) => {
        const newHappiness = Math.max(0, prev - decayRate);
        console.log(newHappiness);
        if (newHappiness == 95) {
          setIsbreakdown(true);
        }
        setHappinessAnimTarget(newHappiness);
        return newHappiness;
      });
    }, 1000);
    return () => clearInterval(happinessDecayInterval);
  }, [setIsbreakdown]);

  const moveToRandomPoint = useCallback(
    (speedClass: string) => {
      const newX = Math.random() * (window.innerWidth - VISUAL_PET_SIZE);
      const newY = Math.random() * (window.innerHeight - VISUAL_PET_SIZE);
      setIsFlipped(newX < position.x);
      setMovementSpeedClass(speedClass);
      setPosition({ x: newX, y: newY });
    },
    [position.x],
  );

  const performRandomStunt = useCallback(() => {
    const stunts = ["flip", "roll", "spin", "bounce"];
    const randomStunt = stunts[Math.floor(Math.random() * stunts.length)];
    setStuntClass(randomStunt);
    setTimeout(() => setStuntClass(""), 800);
  }, []);

  useEffect(() => {
    if (stateTimeoutRef.current !== null) {
      clearTimeout(stateTimeoutRef.current);
    }

    const decideNextAction = () => {
      if (currentState === "eat" || isDragging) return;

      if (!message) {
        if (happiness < 30 && Math.random() < 0.25) {
          showMessage("No one loves me...", 4000);
        } else if (happiness > 70 && Math.random() < 0.15) {
          const happyMessages = ["Purrrrrr...", "Meow!", "I love this!"];
          const randomMsg =
            happyMessages[Math.floor(Math.random() * happyMessages.length)];
          showMessage(randomMsg, 3000);
        }
      }

      const mood =
        happiness > 70 ? "happy" : happiness > 30 ? "content" : "sad";
      const actionRoll = Math.random();

      switch (mood) {
        case "sad":
          setMovementSpeedClass("prowl-speed");
          if (actionRoll < 0.6) {
            setCurrentState(Math.random() < 0.5 ? "sleep" : "idle");
          } else {
            setCurrentState("walk");
            moveToRandomPoint("prowl-speed");
          }
          break;
        case "content":
          setMovementSpeedClass("walk-speed");
          if (actionRoll < 0.5) {
            setCurrentState("walk");
            moveToRandomPoint("walk-speed");
          } else if (actionRoll < 0.8) {
            setCurrentState("jump");
            if (Math.random() < 0.3) performRandomStunt();
          } else {
            setCurrentState("idle");
          }
          break;
        case "happy":
          setMovementSpeedClass("zoomies-speed");
          if (actionRoll < 0.6) {
            setCurrentState("walk");
            moveToRandomPoint("zoomies-speed");
          } else {
            setCurrentState("jump");
            performRandomStunt();
          }
          break;
      }
    };

    const delay =
      happiness > 70
        ? 500 + Math.random() * 1000
        : happiness > 30
          ? 1500 + Math.random() * 2000
          : 3000 + Math.random() * 3000;

    stateTimeoutRef.current = setTimeout(decideNextAction, delay);

    return () => {
      if (stateTimeoutRef.current !== null) {
        clearTimeout(stateTimeoutRef.current);
      }
    };
  }, [
    currentState,
    happiness,
    isDragging,
    moveToRandomPoint,
    performRandomStunt,
    showMessage,
    message,
  ]);

  const increaseHappiness = (amount: number) => {
    lastInteractionRef.current = Date.now();
    setHappiness((prev) => {
      const newHappiness = Math.min(100, prev + amount);
      setHappinessAnimTarget(newHappiness);
      return newHappiness;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    if (stateTimeoutRef.current !== null) {
      clearTimeout(stateTimeoutRef.current);
    }

    const foodCrumbId = e.dataTransfer.getData(FOOD_CRUMB_ID_TYPE);
    if (foodCrumbId) {
      // Check for overfeeding
      if (happiness >= 100) {
        showMessage("I'm already full!", 3000);
        document.getElementById(foodCrumbId)?.remove();
        return; // Exit before increasing happiness
      }

      const droppedText = e.dataTransfer.getData("text/plain");
      increaseHappiness(Math.min(Math.floor(droppedText.length / 3), 25));
      setCurrentState("eat");
      document.getElementById(foodCrumbId)?.remove();
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes(FOOD_CRUMB_ID_TYPE.toLowerCase())) {
      setIsHovered(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setCurrentState("pet");
    increaseHappiness(2);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      if (Math.abs(deltaX) > 1) setIsFlipped(deltaX < 0);
      setPosition({ x: position.x + deltaX, y: position.y + deltaY });
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const anim = animations[currentState];
  if (!anim) return null;

  const backgroundPosition = `0px -${
    (anim.startFrame + currentFrame) * PET_SIZE
  }px`;

  const wrapperClasses = ["pet-wrapper", movementSpeedClass]
    .filter(Boolean)
    .join(" ");

  const spriteTransform = `scale(${
    isHovered ? PET_SCALE * 1.1 : PET_SCALE
  }) ${isFlipped ? "scaleX(-1)" : ""}`;

  return (
    <div
      className={wrapperClasses}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* New message bubble element */}
      {message && <div className="pet-message-bubble">{message}</div>}

      <div className="happiness-bar">
        <div
          className={`happiness-bar__fill ${getHappinessClass()}`}
          style={{
            width: `${happinessAnimTarget}%`,
          }}
        />
      </div>

      <div className={["pet-sprite-container", stuntClass].join(" ")}>
        <div
          className={isHovered ? "pet-sprite drag-over" : "pet-sprite"}
          style={{
            backgroundImage: `url('${chrome.runtime.getURL("pet-sprite.png")}')`,
            backgroundPosition,
            transform: spriteTransform,
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={handleDragEnter}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsHovered(false);
          }}
        />
      </div>
    </div>
  );
};
