// export const API_BASE_URL = "https://api.fivlia.in";
export const API_BASE_URL = "http://localhost:8080";
// export const API_BASE_URL = "https://api.fivlia.co.in";

// Define all endpoints here
export const ENDPOINTS = {
  GET_SMS_TYPE: "/getSmsType",

  // Products
  GET_TAX: "/getTax",
  GET_PRODUCTS: "/adminProducts",
  DELETE_PRODUCT: "/deleteProduct",
  TOGGLE_PUBLIC: "/edit-toggle",
  BULK_UPLOAD: "/Product/bulk",

  // Edit Product
  GET_FILTERS: "/getFilter",
  GET_ATTRIBUTES: "/getAttributes",
  ADD_ATTRIBUTE: "/addAtribute",
  GET_UNIT: "/getUnit",

  GET_MAIN_CATEGORY: "/getMainCategory",
  GET_ALL_ZONE: "/getAllZone",
  GET_BRANDS: "/getBrand",

  GET_NOTIFICATION: "/getNotification",
  MARK_ALL_READ: "/markAllRead",
  DELETE_NOTIFICATION: "/deleteNotification",
  UPDATE_ATTRIBUTE: "/updateAt",
  ADD_FILTER_IN_CATEGORY: "/addFilterInCategory",
  EDIT_FILTER: "/editFilter",
  UPDATE_PRODUCT: "/updateProduct",

  GET_DRIVER_REQUEST: "/getDriverRequest",
  DRIVER_APPROVAL: "/acceptDeclineRequest",
  EDIT_DRIVER: "/editDriver",

  GET_SELLER_REQUEST: "/getSellerRequest",
  APPROVAL_UPDATE: "/acceptDeclineRequest",

  GET_CHARITY: "/getCharity",
  ADD_CHARITY: "/addCharity",

  GET_CITY: "/getCity",
  UPDATE_CITY_STATUS: "/updateCityStatus",

  ADD_FILTER: "/addFilter",
  ADD_UNIT: "/unit",

  DELETE_VARIANT: "/deleteVarient",
  DELETE_ATTRIBUTE: "/deleteAttribute",

  GET_FILTER: "/getFilter",
  DELETE_FILTER_VALUE: "/deleteFilterVal",
  DELETE_FILTER: "/deleteFilter",

  GET_ALL_STORE: "getAllStore",

  ADD_BANNER: "/banner",

  GET_DRIVERS: "/getDriver",
  GET_DRIVER_RATING: "/getDriverRating",
  GET_DRIVER_REFERRALS: "/get-driver-referral-seller",
  GET_WITHDRAWAL_REQUESTS: "/getWithdrawalRequest",
  WITHDRAWAL_ACTION: "/withdrawal",
  DELETE_DRIVER: "/deleteDriver",
  GET_DRIVER_TRANSACTIONS: "/transactionList",
};
