import { useState } from "react";
import axios from "axios";
import Button from "../common/Button";
import Popup from "../Popup";

const ChangePassword = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      alert("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/auth/change-password",
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        alert("Password changed successfully!");
        onClose();
        setFormData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (error) {
      console.error("Change password failed:", error);
      alert(
        error.response?.data?.message || "Failed to change password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popup
      isOpen={show}
      onClose={onClose}
      title="Change Password"
      pos="right"
      className="!max-w-md"
      draggable={true}
    >
      <div className="p-6">
        <p className="text-gray-600 mb-8">
          Please enter your current password and choose a new password to update your credentials.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fi fi-rr-lock text-gray-400"></i>
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors"
                required
                placeholder="Enter current password"
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
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors"
                required
                placeholder="Enter new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className={`fi ${showNewPassword ? "fi-rr-eye" : "fi-rr-eye-crossed"}`}></i>
              </button>
            </div>
            <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
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
                className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:border-primary-500 focus:ring-0 transition-colors"
                required
                placeholder="Confirm new password"
                minLength={6}
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

          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              className="!rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="!rounded-lg"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </Popup>
  );
};

export default ChangePassword;