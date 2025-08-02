import { useEffect } from "react";
export const FOOD_CRUMB_ID_TYPE = "application/x-browser-pet-food-id";
let currentlyDraggedCrumbId: string | null = null;

// Store for the original text ranges, mapping a crumb ID to its Range object.
const rangeStore = new Map<string, Range>();

/**
 * Finds the range associated with a food crumb ID and deletes its content
 * from the original document.
 * @param crumbId The ID of the food crumb that was "eaten".
 */
export const deleteTextForCrumb = (crumbId: string) => {
  const range = rangeStore.get(crumbId);
  if (range) {
    // This is the key step that removes the text from the page.
    range.deleteContents();
    // Clean up the store to prevent memory leaks.
    rangeStore.delete(crumbId);
  }
};

export const useTextSelection = () => {
  useEffect(() => {
    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault();

      if (currentlyDraggedCrumbId) {
        const crumbElement = document.getElementById(currentlyDraggedCrumbId);
        if (crumbElement) {
          const target = e.target as HTMLElement;

          const isPetTarget =
            target.classList.contains("pet-wrapper") ||
            target.closest(".pet-wrapper");

          if (!isPetTarget) {
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
        target.closest(".pet-wrapper")
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

        // *** MODIFICATION: Store the range before doing anything else.
        rangeStore.set(crumbId, range);

        const foodCrumb = document.createElement("div");
        foodCrumb.id = crumbId;
        foodCrumb.textContent = selectedText;
        foodCrumb.className = "food-crumb";
        foodCrumb.style.top = `${rect.bottom + window.scrollY + 5}px`;
        foodCrumb.style.left = `${rect.left + window.scrollX}px`;
        foodCrumb.draggable = true;

        foodCrumb.addEventListener("dragstart", (e) => {
          if (e.dataTransfer) {
            currentlyDraggedCrumbId = crumbId;
            e.dataTransfer.setData("text/plain", selectedText);
            e.dataTransfer.setData(FOOD_CRUMB_ID_TYPE, crumbId);
            e.dataTransfer.effectAllowed = "copy";
            foodCrumb.style.opacity = "0.7";
            foodCrumb.style.transform = "scale(1.1)";
          }
        });

        foodCrumb.addEventListener("dragend", () => {
          currentlyDraggedCrumbId = null;
          foodCrumb.style.opacity = "1";
          foodCrumb.style.transform = "scale(1)";
        });

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

        setTimeout(() => {
          if (document.getElementById(crumbId)) {
            document.getElementById(crumbId)?.remove();
            // *** MODIFICATION: If the crumb times out, also remove its stored range.
            rangeStore.delete(crumbId);
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
      // *** MODIFICATION: Clear the store on cleanup.
      rangeStore.clear();
    };
  }, []);
};
