"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import ChangePassword from "@/components/ChangePassword/ChangePassword";
import DeleteAccount from "@/components/DeleteAccount/DeleteAccount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfile, getProfile } from "./service";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed";

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
  });

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name || "",
        email: profileData.data.email || "",
        phone: profileData.data.phone || "",
      });
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.data));
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      alert(
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
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

  const handleCancelEdit = () => {
    const data = profileData?.data || {};
    setIsEditing(false);
    setFormData({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary-600">
          <svg
            className="animate-spin h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  const userData = profileData?.data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches my-bookings / home typography */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/70 via-white to-white pointer-events-none" />
        <div className="absolute -top-20 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 md:pt-12 md:pb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-primary-500 rounded-full" />
              <span className="text-xs tracking-[0.2em] uppercase text-primary-600 font-medium">
                Account
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                Profile
              </span>
            </h1>
            <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed max-w-xl">
              Manage your personal details and keep your Explore World account up to date.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {[
              { icon: "fi fi-rr-user", label: "Personal info", hint: "Name & contact" },
              { icon: "fi fi-rr-envelope", label: userData.email || "Email", hint: "Login email" },
              { icon: "fi fi-rr-shield-check", label: "Secure account", hint: "Password & privacy" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-4 border bg-white/70 backdrop-blur-sm border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border bg-white text-primary-600 border-gray-100 shadow-sm">
                  <i className={`${item.icon} text-base`} />
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal details */}
          <div className="lg:col-span-2 rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                  <i className="fi fi-rr-id-badge text-lg" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                    Personal details
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {userData.name || "Your name"} · {userData.email || "your email"}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  icon={<i className="fi fi-rr-edit" />}
                  className="hover:bg-gray-50 !rounded-full shrink-0"
                >
                  Edit profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                  placeholder="Enter your phone number"
                />
              </div>

              {isEditing && (
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
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
                    Save changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Security */}
          <div className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="flex items-center gap-3 px-5 sm:px-7 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="w-11 h-11 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                <i className="fi fi-rr-lock text-lg" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                  Security
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">Password & account access</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary-600 shrink-0">
                    <i className="fi fi-rr-key text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">Password</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Use a strong password to keep your account secure.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangePassword(true)}
                      className="hover:bg-white !rounded-full mt-3"
                    >
                      Change password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChangePassword
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {showDeleteAccount && (
        <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
