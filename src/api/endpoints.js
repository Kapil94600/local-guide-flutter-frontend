// 🔥 ALL BACKEND APIs (POST ONLY)

export const API = {
  // ================= AUTH =================
  REGISTER: "/user/register",
  LOGIN: "/user/login",
  FORGET_PASSWORD: "/user/forget_password",
  UPDATE_PROFILE: "/user/update_profile",
  GET_PROFILE: "/user/get_profile",
  DELETE_USER: "/user/delete",
  GET_USER_LIST: "/user/get_user_list",
  CHANGE_PASSWORD: "/user/change_password",

  // ================= PHOTOGRAPHER =================
  GET_PHOTOGRAPHERS_ALL: "/photographers/get_all",
  CHANGE_PHOTOGRAPHER_ACTIVE_STATUS: "/photographers/change_active_status",
  UPDATE_PHOTOGRAPHER: "/photographers/update",
  DELETE_PHOTOGRAPHER: "/photographers/delete",
  GET_PHOTOGRAPHERS_REQUESTS: "/photographers/all_requests",

  // ================= GUIDER =================
  GET_GUIDERS_ALL: "/guider/get_all",
  CHANGE_GUIDER_ACTIVE_STATUS: "/guider/change_active_status",
  UPDATE_GUIDER: "/guider/update",
  DELETE_GUIDER: "/guider/delete",

  // ================= PLACES =================
  GET_PLACES: "/places/get",
  ADD_PLACE: "/places/add",
  EDIT_PLACE: "/places/edit",
  DELETE_PLACE: "/places/delete",

  // ================= IMAGES =================
  ADD_IMAGE: "/images/add",
  ALL_IMAGES: "/images/get_all",
  ALL_IMAGES_BY_ID: "/images/get_by_id",
  DELETE_IMAGE: "/images/delete",

  // ================= TRANSACTIONS =================
  GET_TRANSACTION: "/transaction/get",
  DELETE_TRANSACTION: "/transaction/delete",

  // ================= NOTIFICATIONS =================
  GET_NOTIFICATIONS: "/notification/get_by_id",
  CREATE_NOTIFICATION: "/notification/create",

  // ================= SETTINGS =================
  GET_SETTINGS: "/settings/get",
  UPDATE_SETTINGS: "/settings/update",
};
