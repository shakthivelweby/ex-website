"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/app/profile/service";
import Button from "@/components/common/Button";

const ChangePassword = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      alert("Password changed successfully");
      onClose();
      // Reset form
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError("");
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    // Validate password length
    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Submit only old_password and new_password
    const payload = {
      old_password: formData.old_password,
      new_password: formData.new_password,
    };

    changePasswordMutation.mutate(payload);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fi fi-rr-cross text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fi fi-rr-lock text-gray-400 group-focus-within:text-primary-500"></i>
              </div>
              <input
                type="password"
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all"
                required
                placeholder="Enter your current password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fi fi-rr-lock text-gray-400 group-focus-within:text-primary-500"></i>
              </div>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all"
                required
                placeholder="Enter your new password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <i className="fi fi-rr-lock text-gray-400 group-focus-within:text-primary-500"></i>
              </div>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all"
                required
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-50 !rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={changePasswordMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700 !rounded-full"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 