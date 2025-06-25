"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/common/Button";
import ChangePassword from "@/components/ChangePassword/ChangePassword";
import DeleteAccount from "@/components/DeleteAccount/DeleteAccount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfile, updateProfileImage, getProfile } from "./service";

const ProfilePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profile_image: "",
  });

  // Fetch profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // Update form data when profile data changes
  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name || "",
        email: profileData.data.email || "",
        phone: profileData.data.phone || "",
        profile_image: profileData.data.profile_image || "",
      });
    }
  }, [profileData]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(response.data));
      setIsEditing(false);
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to update profile. Please try again.");
    }
  });

  // Update Profile Image Mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (response) => {
      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(response.data));
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to upload image. Please try again.");
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
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
    updateProfileMutation.mutate(formData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_image", file);
      await updateProfileImageMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const userData = profileData?.data || {};

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-center">
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
                  <div className="flex flex-col items-center text-center gap-4 pb-6 border-b border-gray-200">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden border-2 border-primary-100">
                        {userData.profile_image ? (
                          <Image
                            src={userData.profile_image}
                            alt={userData.name}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <i className="fi fi-rr-user text-primary-600 text-4xl"></i>
                        )}
                      </div>
                      {isEditing && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <input
                            type="file"
                            id="profile_image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("profile_image").click()}
                            disabled={updateProfileImageMutation.isPending}
                            className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <i className="fi fi-rr-camera text-[10px]"></i>
                            <span>{updateProfileImageMutation.isPending ? "Uploading..." : "Change"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-semibold text-gray-900">{userData.name}</h4>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square image, at least 400x400 pixels
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full h-12 px-4 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight border-gray-300 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full h-12 px-4 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight border-gray-300 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full h-12 px-4 border-b text-[16px] text-gray-800 bg-white placeholder:text-[16px] focus:outline-none focus:ring-0 transition-colors font-medium tracking-tight border-gray-300 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                            name: userData.name || "",
                            email: userData.email || "",
                            phone: userData.phone || "",
                            profile_image: userData.profile_image || "",
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
                        isLoading={updateProfileMutation.isPending}
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
