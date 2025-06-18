import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/app/profile/service";
import Button from "../common/Button";

const ChangePassword = ({ show, onClose }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      alert("Password changed successfully!");
      onClose();
      // Reset form
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to change password. Please try again.");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      alert("New passwords don't match!");
      return;
    }

    if (formData.new_password.length < 8) {
      alert("Password must be at least 8 characters long");
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
              <button
                onClick={onClose}
                className="p-2  hover:bg-gray-100 rounded-full transition-colors !flex !items-center !justify-center w-10 h-10"
              >
                <i className="fi fi-rr-cross-small text-gray-600 text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fi fi-rr-lock text-gray-400"></i>
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="old_password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-none outline-none transition-colors"
                    required
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fi ${showCurrentPassword ? "fi-rr-eye" : "fi-rr-eye-crossed"}`}></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fi fi-rr-lock text-gray-400"></i>
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-none outline-none transition-colors"
                    required
                    placeholder="Create a new password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fi ${showNewPassword ? "fi-rr-eye" : "fi-rr-eye-crossed"}`}></i>
                  </button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fi fi-rr-lock text-gray-400"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-none outline-none transition-colors"
                    required
                    placeholder="Confirm your new password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fi ${showConfirmPassword ? "fi-rr-eye" : "fi-rr-eye-crossed"}`}></i>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={changePasswordMutation.isPending}
                  className="w-full !rounded-full"
                >
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;