"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/common/Button";
import ChangePassword from "@/components/ChangePassword/ChangePassword";
import DeleteAccount from "@/components/DeleteAccount/DeleteAccount";
import axios from "axios";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      avatar: parsedUser.avatar || "",
    });
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        // Update local storage with new user data
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setUser(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        const updatedUser = { ...user, avatar: response.data.data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setFormData(prev => ({ ...prev, avatar: response.data.data.avatar }));
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row justify-center">
          {/* Main Content Area */}
          <div className="flex-1 p-6 flex justify-center">
            <div className="max-w-2xl w-full">
              {/* Profile Information Section */}
              <div className="mb-8" id="profile">
                <div className="md:flex items-center justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tighter">Profile Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details and profile picture</p>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      icon={<i className="fi fi-rr-edit"></i>}
                      className="hover:bg-gray-50 !rounded-full"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex  items-center text-center gap-4 pb-6 border-b border-gray-200">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden border-2 border-primary-100">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <i className="fi fi-rr-user text-primary-600 text-3xl"></i>
                        )}
                      </div>
                      {isEditing && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("avatar").click()}
                            disabled={uploadingImage}
                            className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <i className="fi fi-rr-camera text-[10px]"></i>
                            <span>{uploadingImage ? "Uploading..." : "Change"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900 text-left">{user.name}</h4>
                      <p className="text-sm text-gray-500 text-left">{user.email}</p>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square image, at least 400x400 pixels
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <i className="fi fi-rr-user text-gray-400 group-focus-within:text-primary-500"></i>
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <i className="fi fi-rr-envelope text-gray-400 group-focus-within:text-primary-500"></i>
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <i className="fi fi-rr-phone-call text-gray-400 group-focus-within:text-primary-500"></i>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="pl-10 w-full h-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:ring-none focus:outline-none focus:border-primary-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            avatar: user.avatar || "",
                          });
                        }}
                        className="hover:bg-gray-50 !rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        className="bg-primary-600 hover:bg-primary-700 !rounded-full"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>

              {/* Security Section */}
              <div className="mb-8 pt-8 border-t border-gray-200" id="security">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tighter">Security Settings</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your account security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Password Change */}
                  <div className="md:flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <i className="fi fi-rr-lock text-primary-600"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangePassword(true)}
                      className="hover:bg-gray-50 !rounded-full mt-4 md:mt-0"
                    >
                      Change Password
                    </Button>
                  </div>
                   <div className="border-t border-gray-200"></div>
                  {/* Delete Account */}
                  <div className="md:flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <i className="fi fi-rr-trash text-red-600"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowDeleteAccount(true);
                      }}
                      className="border border-red-300 !text-red-600 bg-white  hover:bg-red-100 !rounded-full mt-4 md:mt-0"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePassword 
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)} 
      />

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
      )}
    </main>
  );
};

export default ProfilePage;
