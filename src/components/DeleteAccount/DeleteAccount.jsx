"use client";

import { useState } from "react";
import Button from "@/components/common/Button";

const DeleteAccount = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.clear();
        window.location.href = "/";
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account failed:", error);
      alert(error.message || "Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="absolute right-4 top-4 size-8 inline-flex justify-center items-center rounded-full border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>

          <div className="p-6 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <i className="fi fi-rr-trash text-red-500 text-3xl"></i>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Account
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
    

            {/* Buttons */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="hover:bg-gray-50 !rounded-full w-full"
              >
                Keep My Account
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isLoading}
                className="hover:bg-red-700 !rounded-full w-full"
              >
                Delete My Account
                {/* {isLoading ? "Deleting..." : "Delete Account"} */}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
