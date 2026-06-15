"use client";

import axios from "axios";

/** Public web API client — never attaches Authorization (pricing/checkout preview). */
const publicApiMiddleware = axios.create({
  baseURL: "/api/web",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

export default publicApiMiddleware;
