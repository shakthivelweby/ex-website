"use client";

import { useState } from "react";
import Popup from "./index";

export default function PopupExample() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <div className="p-4">
      <button
        onClick={openPopup}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Open Popup
      </button>

      <Popup isOpen={isOpen} onClose={closePopup} title="Example Popup">
        <p className="text-gray-600">
          This is an example of the reusable popup component. You can add any
          content here.
        </p>

        <div className="mt-6 flex space-x-2">
          <button
            onClick={closePopup}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert("Action confirmed!");
              closePopup();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </Popup>
    </div>
  );
}
