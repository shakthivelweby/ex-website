import apiMiddleware from "@/app/api/apiMiddleware";
import axios from "axios";

export const getProfile = async () => {
  const response = await apiMiddleware.get("/current-user");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiMiddleware.post("/update-profile?_method=PUT", data);
  return response.data;
};

export const updateProfileImage = async (data) => {
  const response = await apiMiddleware.post("/update-profile-image?_method=PUT", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const changePassword = async (data) => {
    const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/auth/change-password", data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
  });
  return response.data;
};