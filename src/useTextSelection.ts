import { useEffect } from "react";

export const FOOD_CRUMB_ID_TYPE = "application/x-browser-pet-food-id";

let currentlyDraggedCrumbId: string | null = null;

export const useTextSelection = () => {
  useEffect(() => {
    // Helper function to get the path to a node
    const getNodePath = (node: Node): number[] => {
      const path: number[] = [];
      let current = node;

      while (current.parentNode) {
        const parent = current.parentNode;
        const siblings = Array.from(parent.childNodes);
        const index = siblings.indexOf(current as ChildNode);
        path.unshift(index);
        current = parent;
      }

      return path;
    };

    // Helper function to get a node from its path
    const getNodeFromPath = (path: number[]): Node | null => {
      let current: Node = document;

      for (const index of path) {
        if (current.childNodes[index]) {
          current = current.childNodes[index];
        } else {
          return null;
        }
      }

      return current;
    };

    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault();

      // Only handle positioning if food crumb was NOT dropped on the pet
      if (currentlyDraggedCrumbId) {
        const crumbElement = document.getElementById(currentlyDraggedCrumbId);
        if (crumbElement) {
          // Check if the drop target is the pet or its container
          const target = e.target as HTMLElement;
          const isPetTarget =
            target.classList.contains("pet-container") ||
            target.closest(".pet-container");

          if (!isPetTarget) {
            // Only reposition if NOT dropped on pet
            crumbElement.style.left = `${e.clientX - 20}px`;
            crumbElement.style.top = `${e.clientY - 10}px`;
          }
        }
      }
    };

    document.addEventListener("dragover", handleDocumentDragOver);
    document.addEventListener("drop", handleDocumentDrop);

    const handleMouseUp = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.classList.contains("food-crumb") ||
        target.classList.contains("pet-container")
      ) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const crumbId = `food-crumb-${Date.now()}`;

        const foodCrumb = document.createElement("div");
        foodCrumb.id = crumbId;
        foodCrumb.textContent = selectedText;
        foodCrumb.className = "food-crumb";
        foodCrumb.style.top = `${rect.bottom + window.scrollY + 5}px`;
        foodCrumb.style.left = `${rect.left + window.scrollX}px`;
        foodCrumb.draggable = true;

        // Store the original range for text removal later
        const originalRange = range.cloneRange();

        // Add visual feedback for dragging
        foodCrumb.addEventListener("dragstart", (e) => {
          if (e.dataTransfer) {
            currentlyDraggedCrumbId = crumbId;
            e.dataTransfer.setData("text/plain", selectedText);
            e.dataTransfer.setData(FOOD_CRUMB_ID_TYPE, crumbId);
            e.dataTransfer.setData(
              "text/range-data",
              JSON.stringify({
                startContainerPath: getNodePath(originalRange.startContainer),
                endContainerPath: getNodePath(originalRange.endContainer),
                startOffset: originalRange.startOffset,
                endOffset: originalRange.endOffset,
                selectedText: selectedText,
              }),
            );
            e.dataTransfer.effectAllowed = "copy";

            // Add visual feedback during drag
            foodCrumb.style.opacity = "0.7";
            foodCrumb.style.transform = "scale(1.1)";
          }
        });

        foodCrumb.addEventListener("dragend", (e) => {
          currentlyDraggedCrumbId = null;
          // Reset visual feedback
          foodCrumb.style.opacity = "1";
          foodCrumb.style.transform = "scale(1)";
        });

        // Add hover effects
        foodCrumb.addEventListener("mouseenter", () => {
          foodCrumb.style.transform = "scale(1.05)";
          foodCrumb.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
        });

        foodCrumb.addEventListener("mouseleave", () => {
          if (!currentlyDraggedCrumbId || currentlyDraggedCrumbId !== crumbId) {
            foodCrumb.style.transform = "scale(1)";
            foodCrumb.style.boxShadow = "none";
          }
        });

        document.body.appendChild(foodCrumb);
        selection.removeAllRanges();

        // Auto-remove food crumbs after 30 seconds to prevent clutter
        setTimeout(() => {
          if (document.getElementById(crumbId)) {
            document.getElementById(crumbId)?.remove();
          }
        }, 30000);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("dragover", handleDocumentDragOver);
      document.removeEventListener("drop", handleDocumentDrop);
      document.querySelectorAll(".food-crumb").forEach((e) => e.remove());
    };
  }, []);
};
