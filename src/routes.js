/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Table from "layouts/servicearea/ServiceTable";
import Demo from "layouts/dashboard/Demo";
import Icon from "@mui/material/Icon";
import CityTable from "layouts/City Management/CityTable";
import UserData from "layouts/Users/Users";
import BanerManagement from "layouts/Banner/Banner";
import Categories from "layouts/Categories/Categories";
import BrandTable from "layouts/Brand/BrandTable";
import AttributeTable from "layouts/Attribute/AttributeArray";
import Tax from "layouts/Attribute/Tax";
import Product from "layouts/Products/Product";
import Stock from "layouts/Store/StoreRoutes/Stock";
import ProductTable from "layouts/Products/ProductTable";
import User from "layouts/User/User";
import CreateStore from "layouts/Store/Store";
import SellerTable from "layouts/Store/sellerTable";
import UnitsTable from "layouts/Attribute/Units";
import VarientTabel from "layouts/Attribute/Varient";
import Setting from "Setting/Setting";
import PagesTable from "Setting/pageTable";
import OrderSetting from "Setting/OrderSetting";
import LoginPage from "Login/Login";
import button from "assets/theme/components/button";
import StoreTabel from "layouts/Store/StoreTable";
import DeliveryStatusDropdown from "layouts/Attribute/Delievery";
import { Collapse } from "@mui/material";
import def from "ajv/dist/vocabularies/applicator/additionalItems";
import Filter from "layouts/Attribute/Filter";
import DashBoard from "layouts/Store/StoreRoutes/DashBoard";
import Drivers from "layouts/Drivers/Drivers";
import DeliveryStatus from "layouts/DeliveryStatus/DeliveryStatus";
import Orders from "layouts/Orders/Order";
import BulkOrders from "layouts/bulkOrders/bulkOrders";
import Notification from "layouts/Notification/Notification";
import StoreOrder from "layouts/Store/StoreRoutes/StoreOrder";
import StoreCategories from "layouts/Store/StoreRoutes/Categories";
import StoreProduct from "layouts/Store/StoreRoutes/StoreProduct";
import Wallet from "layouts/Wallet/Wallet";
import DriversWithdrawal from "layouts/Withdrawal/driverWithdraw";
import SellerWithdrawal from "layouts/Withdrawal/sellerWithdraw";
import SetCommisson from "layouts/Commission/commisson";
import Festival from "layouts/Festival/Festival";
import Blog from "layouts/Blogs/Blog";
import DriversRequest from "layouts/Approvals/DriverApproval";
import SellerRequest from "layouts/Approvals/SellerApproval";
import Sitemap from "layouts/SEO/Sitemap";
import Schema from "layouts/SEO/Schema";
import Etc from "layouts/SEO/Etc";
import SalesReport from "layouts/Reports/SalesReport";

const isLoggedIn = () => {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  return username === "admin" && password === "admin";
};

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Demo />,
  },
  {
    type: "collapse",
    name: "Wallet",
    key: "wallet",
    icon: <Icon fontSize="small">wallet</Icon>,
    route: "/wallet",
    component: <Wallet />,
  },
  {
    type: "collapse",
    name: "Festival",
    key: "festival",
    icon: <Icon fontSize="small">festival</Icon>,
    route: "/festival",
    component: <Festival />,
  },
  {
    type: "collapse",
    name: "Commisson",
    key: "commisson",
    icon: <Icon fontSize="small">payments</Icon>,
    route: "/commisson",
    component: <SetCommisson />,
  },
  {
    type: "collapse",
    name: "Withdraw Request",
    key: "withdrawal-request",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>,
    collapse: [
      {
        name: "Driver Request",
        key: "driver-request",
        icon: <Icon fontSize="small">local_shipping</Icon>,
        route: "/driver-request",
        component: <DriversWithdrawal />,
      },
      {
        name: "Sellers Request",
        key: "sellers-request",
        route: "/sellers-request",
        component: <SellerWithdrawal />,
        icon: <Icon fontSize="small">seller</Icon>,
      },
    ],
  },
  {
    type: "collapse",
    name: "Approvals",
    key: "approvals",
    icon: <Icon fontSize="small">approval</Icon>,
    collapse: [
      {
        name: "Driver Applications",
        key: "driver-approvals",
        icon: <Icon fontSize="small">local_shipping</Icon>,
        route: "/driver-approvals",
        component: <DriversRequest />,
      },
      {
        name: "Sellers Applications",
        key: "seller-approvals",
        route: "/seller-approvals",
        component: <SellerRequest />,
        icon: <Icon fontSize="small">seller</Icon>,
      },
    ],
  },
  {
    type: "collapse",
    name: "City Management",
    key: "city-management",
    icon: <Icon fontSize="small">location_city</Icon>,
    route: "/citytable",
    component: <CityTable />,
  },
  {
    type: "collapse",
    name: "Zone Management",
    key: "zone-management",
    icon: <Icon fontSize="small">location_on</Icon>,
    route: "/serviceArea",
    component: <Table />,
  },
  {
    type: "collapse",
    name: "Categories",
    key: "servicearea",
    icon: <Icon fontSize="small">storefront</Icon>,
    route: "/categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Banner-Management",
    key: "banner",
    icon: <Icon fontSize="small">add_photo_alternate</Icon>,
    route: "/banner-manage",
    component: <BanerManagement />,
  },
  {
    type: "collapse",
    name: "Brands",
    key: "brands",
    icon: <Icon fontSize="small">diamond_shine</Icon>,
    route: "/brands-table",
    component: <BrandTable />,
  },
  {
    type: "collapse",
    name: "Attributes",
    key: "Attributes",
    icon: <Icon fontSize="small">format_list_bulleted</Icon>,
    collapse: [
      {
        name: "Item-Attributes",
        key: "Item-Attributes",
        route: "/attribute-table",
        component: <AttributeTable />,
        icon: <Icon fontSize="small">view_array</Icon>,
      },
      {
        name: "Item-Units",
        key: "Item-units",
        route: "/units-table",
        component: <UnitsTable />,
        icon: <Icon fontSize="small">view_array</Icon>,
      },
      //   {
      //   name: "Item-Varients",
      //   key: "Item-Attributes",
      //   route: "/varients-table",
      //   component: <VarientTabel />,
      //   icon: <Icon fontSize="small">view_array</Icon>,
      // },

      // {
      //   name: "Delivery-Status",
      //   key: "delivery-status",
      //   route: "/del-status",
      //   component: <DeliveryStatusDropdown />,
      //   icon: <Icon fontSize="small">view_array</Icon>,
      // },
      {
        name: "Tax",
        key: "attribute-tax",
        route: "/attribute-tax",
        component: <Tax />,
        icon: <Icon fontSize="small">account_balance</Icon>,
      },
      {
        name: "Filter Type",
        key: "filter-type",
        route: "/filter-type",
        component: <Filter />,
        icon: <Icon fontSize="small">account_balance</Icon>,
      },
    ],
  },
  {
    type: "collapse",
    name: "Products",
    key: "product",
    icon: <Icon fontSize="small">shopping_bag</Icon>,
    route: "/producttable",
    component: <ProductTable />,
  },

  {
    type: "collapse",
    name: "Stores",
    key: "storeList",
    icon: <Icon fontSize="small">storefront</Icon>,
    collapse: [
      {
        name: "Fivlia Stores",
        key: "store-list",
        icon: <Icon fontSize="small">store</Icon>,
        route: "/store-table",
        component: <StoreTabel />,
      },
      {
        name: "Sellers",
        key: "sellers",
        route: "/seller-table",
        component: <SellerTable />,
        icon: <Icon fontSize="small">person</Icon>,
      },
    ],
  },

  {
    type: "collapse",
    name: "User",
    key: "user",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/user",
    component: <User />,
  },
  {
    type: "collapse",
    name: "Drivers",
    key: "drivers",
    icon: <Icon fontSize="small">drive_eta</Icon>,
    route: "drivers",
    component: <Drivers />,
  },
  {
    type: "collapse",
    name: "DeliveryStatus",
    key: "deliveryStatus",
    icon: <Icon fontSize="small">track_changes</Icon>,
    route: "deliveryStatus",
    component: <DeliveryStatus />,
  },
  {
    type: "collapse",
    name: "Orders",
    key: "orders",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "orders",
    component: <Orders />,
  },
  {
    type: "collapse",
    name: "Bulk Orders",
    key: "bulk-orders",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/bulk-orders",
    component: <BulkOrders />,
  },
  {
    type: "collapse",
    name: "Notification",
    key: "notification",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notification",
    component: <Notification />,
  },
  {
    type: "collapse",
    name: "Blog",
    key: "blog",
    icon: <Icon fontSize="small">article</Icon>,
    route: "/blog",
    component: <Blog />,
  },
  {
    type: "collapse",
    name: "SEO Settings",
    key: "seo-settings",
    icon: <Icon fontSize="small">search</Icon>,
    collapse: [
      {
        name: "Sitemap",
        key: "sitemap",
        route: "/seo/sitemap",
        component: <Sitemap />,
        icon: <Icon fontSize="small">map</Icon>,
      },
      {
        name: "Schema",
        key: "schema",
        route: "/seo/schema",
        component: <Schema />,
        icon: <Icon fontSize="small">data_object</Icon>,
      },
      {
        name: "Etc",
        key: "seo-etc",
        route: "/seo/etc",
        component: <Etc />,
        icon: <Icon fontSize="small">settings</Icon>,
      },
    ],
  },
  {
    type: "collapse",
    name: "Reports",
    key: "Reports",
    icon: <Icon fontSize="small">store</Icon>,
    collapse: [
      {
        name: "Sales Report",
        key: "sales-report",
        icon: <Icon fontSize="small">track_changes</Icon>,
        route: "sales-report",
        component: <SalesReport />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Setting",
    key: "Setting",
    icon: <Icon fontSize="small">store</Icon>,
    collapse: [
      {
        name: "Settings",
        key: "Settings",
        route: "/setting",
        component: <Setting />,
        icon: <Icon fontSize="small">view_array</Icon>,
      },
      {
        name: "Pages",
        key: "Pages",
        route: "/pages",
        component: <PagesTable />,
        icon: <Icon fontSize="small">view_array</Icon>,
      },
      {
        name: "Order Settings",
        key: "order-settings",
        route: "/order-settings",
        component: <OrderSetting />,
        icon: <Icon fontSize="small">view_array</Icon>,
      },
    ],
  },
  {
    type: "collapse",
    name: "Log-Out",
    key: "log-out",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "#",
  },

  // {
  //   type: "collapse",
  //   name: "UserData",
  //   key: "userdata",
  //   icon: <Icon fontSize="small">diversity_3</Icon>,
  //   route: "/user-data",
  //   component: <UserData />,
  // },
  // {
  //   type: "collapse",
  //   name: "Tables",
  //   key: "tables",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/tables",
  //   component: <Tables />,
  // },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },

  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
];

const StoreRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard1",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/dashboard1",
    component: <DashBoard />,
  },
  {
    type: "collapse",
    name: "Categories",
    key: "categories",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/storecat",
    component: <StoreCategories />,
  },
  {
    type: "collapse",
    name: "Products",
    key: "products",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/storeproduct",
    component: <StoreProduct />,
  },
  {
    type: "collapse",
    name: "Stock",
    key: "stock",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/stock",
    component: <Stock />,
  },
  {
    type: "collapse",
    name: "Orders",
    key: "orders",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/store-orders",
    component: <StoreOrder />,
  },
  {
    type: "collapse",
    name: "Log-Out",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "#",
  },
];
export default routes;
export { StoreRoutes };
