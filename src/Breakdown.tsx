import "./gravityFall.css";

export const breakdown = () => {
  const topLevelElements = Array.from(document.body.children) as HTMLElement[];
  const fallingPieces: HTMLElement[] = [];

  const fallContainer = document.createElement("div");
  fallContainer.style.position = "absolute";
  fallContainer.style.top = "0";
  fallContainer.style.left = "0";
  fallContainer.style.width = "100%";
  fallContainer.style.height = "100%";
  fallContainer.style.overflow = "hidden";

  fallContainer.style.zIndex = "999998";

  const restorationClosures: (() => void)[] = [];

  topLevelElements.forEach((el) => {
    if (!el.classList.contains("pet-wrapper")) {
      const originalVisibility = el.style.visibility;

      restorationClosures.push(() => {
        el.style.visibility = originalVisibility;
      });

      el.style.visibility = "hidden";
    }
  });

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const textContent = node.textContent;
      const words = textContent.trim().split(/\s+/);
      let currentIndex = 0;
      words.forEach((word) => {
        const wordRange = document.createRange();
        const start = textContent.indexOf(word, currentIndex);
        if (start === -1) return;
        const end = start + word.length;
        currentIndex = end;
        wordRange.setStart(node, start);
        wordRange.setEnd(node, end);
        const rect = wordRange.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const piece = document.createElement("span");
        piece.textContent = word;
        piece.className = "falling-item";
        const parentStyle = window.getComputedStyle(node.parentElement!);
        piece.style.font = parentStyle.font;
        piece.style.color = parentStyle.color;
        piece.style.position = "absolute";
        piece.style.top = `${rect.top + window.scrollY}px`;
        piece.style.left = `${rect.left + window.scrollX}px`;
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.animationDuration = `${1.2 + Math.random() * 1.5}s`;
        fallingPieces.push(piece);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (
        element.nodeName === "SCRIPT" ||
        element.nodeName === "STYLE" ||
        element.classList.contains("pet-wrapper") ||
        element.closest(".pet-wrapper")
      ) {
        return;
      }
      if (["IMG", "VIDEO", "CANVAS", "SVG"].includes(element.nodeName)) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const piece = element.cloneNode(true) as HTMLElement;
        piece.className = "falling-item";
        piece.style.position = "absolute";
        piece.style.top = `${rect.top + window.scrollY}px`;
        piece.style.left = `${rect.left + window.scrollX}px`;
        piece.style.width = `${rect.width}px`;
        piece.style.height = `${rect.height}px`;
        piece.style.margin = "0";
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.animationDuration = `${1.2 + Math.random() * 1.5}s`;
        fallingPieces.push(piece);
      } else {
        element.childNodes.forEach(processNode);
      }
    }
  };

  document.body.childNodes.forEach(processNode);

  fallingPieces.forEach((piece) => fallContainer.appendChild(piece));

  document.body.appendChild(fallContainer);

  const messageDiv = document.createElement("div");
  messageDiv.className = "breakdown-message";
  messageDiv.textContent = "You let everything fall apart... even your pet.";

  setTimeout(() => {
    document.body.appendChild(messageDiv);
  }, 1000);

  setTimeout(() => {}, 4500);
};
