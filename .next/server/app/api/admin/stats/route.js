"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/stats/route";
exports.ids = ["app/api/admin/stats/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist\\client\\components\\action-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist\\client\\components\\request-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!*********************************************************************************************!*\
  !*** external "next/dist\\client\\components\\static-generation-async-storage.external.js" ***!
  \*********************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\static-generation-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fstats%2Froute&page=%2Fapi%2Fadmin%2Fstats%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fstats%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fstats%2Froute&page=%2Fapi%2Fadmin%2Fstats%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fstats%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var C_Users_admin_projects_grading_app_app_api_admin_stats_route_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/api/admin/stats/route.ts */ \"(rsc)/./app/api/admin/stats/route.ts\");\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/stats/route\",\n        pathname: \"/api/admin/stats\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/stats/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\admin\\\\projects\\\\grading-app\\\\app\\\\api\\\\admin\\\\stats\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_admin_projects_grading_app_app_api_admin_stats_route_ts__WEBPACK_IMPORTED_MODULE_2__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/admin/stats/route\";\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRnN0YXRzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbiUyRnN0YXRzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW4lMkZzdGF0cyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhZG1pbiU1Q3Byb2plY3RzJTVDZ3JhZGluZy1hcHAlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q2FkbWluJTVDcHJvamVjdHMlNUNncmFkaW5nLWFwcCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDdUM7QUFDdEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDaUo7O0FBRWpKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLWRlc2lnbi1ncmFkaW5nLWFwcC8/ZTJlZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxwcm9qZWN0c1xcXFxncmFkaW5nLWFwcFxcXFxhcHBcXFxcYXBpXFxcXGFkbWluXFxcXHN0YXRzXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hZG1pbi9zdGF0cy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2FkbWluL3N0YXRzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbi9zdGF0cy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGFkbWluXFxcXHByb2plY3RzXFxcXGdyYWRpbmctYXBwXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcc3RhdHNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWRtaW4vc3RhdHMvcm91dGVcIjtcbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fstats%2Froute&page=%2Fapi%2Fadmin%2Fstats%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fstats%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admin/stats/route.ts":
/*!**************************************!*\
  !*** ./app/api/admin/stats/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\n\n\nasync function GET() {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n        // Check if user is admin\n        if (!session?.user || session.user.role !== \"admin\") {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unauthorized. Admin access required.\"\n            }, {\n                status: 403\n            });\n        }\n        if (!_lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Database connection error\"\n            }, {\n                status: 500\n            });\n        }\n        // Get statistics in parallel\n        const [totalUsers, totalStudents, totalInstructors, approvedInstructors, pendingInstructors, totalCourses, activeCourses, totalSubscriptions, recentRegistrations] = await Promise.all([\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.student.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.instructor.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.instructor.count({\n                where: {\n                    isApproved: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.instructor.count({\n                where: {\n                    isApproved: false\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.course.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.course.count({\n                where: {\n                    isActive: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.courseSubscription.count({\n                where: {\n                    status: \"active\"\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findMany({\n                take: 5,\n                orderBy: {\n                    createdAt: \"desc\"\n                },\n                select: {\n                    id: true,\n                    name: true,\n                    email: true,\n                    role: true,\n                    createdAt: true\n                }\n            })\n        ]);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            stats: {\n                totalUsers,\n                totalStudents,\n                totalInstructors,\n                approvedInstructors,\n                pendingInstructors,\n                totalCourses,\n                activeCourses,\n                totalSubscriptions\n            },\n            recentRegistrations\n        });\n    } catch (error) {\n        console.error(\"Error fetching admin stats:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to fetch statistics\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL3N0YXRzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF3RDtBQUNsQjtBQUNPO0FBQ0o7QUFFbEMsZUFBZUk7SUFDcEIsSUFBSTtRQUNGLE1BQU1DLFVBQVUsTUFBTUgsMkRBQWdCQSxDQUFDQyxrREFBV0E7UUFFbEQseUJBQXlCO1FBQ3pCLElBQUksQ0FBQ0UsU0FBU0MsUUFBUSxRQUFTQSxJQUFJLENBQVNDLElBQUksS0FBSyxTQUFTO1lBQzVELE9BQU9QLGtGQUFZQSxDQUFDUSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQXVDLEdBQ2hEO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxJQUFJLENBQUNULCtDQUFNQSxFQUFFO1lBQ1gsT0FBT0Qsa0ZBQVlBLENBQUNRLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBNEIsR0FDckM7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLDZCQUE2QjtRQUM3QixNQUFNLENBQ0pDLFlBQ0FDLGVBQ0FDLGtCQUNBQyxxQkFDQUMsb0JBQ0FDLGNBQ0FDLGVBQ0FDLG9CQUNBQyxvQkFDRCxHQUFHLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQztZQUNwQnBCLCtDQUFNQSxDQUFDSyxJQUFJLENBQUNnQixLQUFLO1lBQ2pCckIsK0NBQU1BLENBQUNzQixPQUFPLENBQUNELEtBQUs7WUFDcEJyQiwrQ0FBTUEsQ0FBQ3VCLFVBQVUsQ0FBQ0YsS0FBSztZQUN2QnJCLCtDQUFNQSxDQUFDdUIsVUFBVSxDQUFDRixLQUFLLENBQUM7Z0JBQUVHLE9BQU87b0JBQUVDLFlBQVk7Z0JBQUs7WUFBRTtZQUN0RHpCLCtDQUFNQSxDQUFDdUIsVUFBVSxDQUFDRixLQUFLLENBQUM7Z0JBQUVHLE9BQU87b0JBQUVDLFlBQVk7Z0JBQU07WUFBRTtZQUN2RHpCLCtDQUFNQSxDQUFDMEIsTUFBTSxDQUFDTCxLQUFLO1lBQ25CckIsK0NBQU1BLENBQUMwQixNQUFNLENBQUNMLEtBQUssQ0FBQztnQkFBRUcsT0FBTztvQkFBRUcsVUFBVTtnQkFBSztZQUFFO1lBQ2hEM0IsK0NBQU1BLENBQUM0QixrQkFBa0IsQ0FBQ1AsS0FBSyxDQUFDO2dCQUFFRyxPQUFPO29CQUFFZixRQUFRO2dCQUFTO1lBQUU7WUFDOURULCtDQUFNQSxDQUFDSyxJQUFJLENBQUN3QixRQUFRLENBQUM7Z0JBQ25CQyxNQUFNO2dCQUNOQyxTQUFTO29CQUFFQyxXQUFXO2dCQUFPO2dCQUM3QkMsUUFBUTtvQkFDTkMsSUFBSTtvQkFDSkMsTUFBTTtvQkFDTkMsT0FBTztvQkFDUDlCLE1BQU07b0JBQ04wQixXQUFXO2dCQUNiO1lBQ0Y7U0FDRDtRQUVELE9BQU9qQyxrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQ3ZCOEIsT0FBTztnQkFDTDNCO2dCQUNBQztnQkFDQUM7Z0JBQ0FDO2dCQUNBQztnQkFDQUM7Z0JBQ0FDO2dCQUNBQztZQUNGO1lBQ0FDO1FBQ0Y7SUFDRixFQUFFLE9BQU9WLE9BQVk7UUFDbkI4QixRQUFROUIsS0FBSyxDQUFDLCtCQUErQkE7UUFDN0MsT0FBT1Qsa0ZBQVlBLENBQUNRLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUE2QixHQUN0QztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1kZXNpZ24tZ3JhZGluZy1hcHAvLi9hcHAvYXBpL2FkbWluL3N0YXRzL3JvdXRlLnRzPzgzNzIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJztcclxuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aCc7XHJcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aCc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdXNlciBpcyBhZG1pblxyXG4gICAgaWYgKCFzZXNzaW9uPy51c2VyIHx8IChzZXNzaW9uLnVzZXIgYXMgYW55KS5yb2xlICE9PSAnYWRtaW4nKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnVW5hdXRob3JpemVkLiBBZG1pbiBhY2Nlc3MgcmVxdWlyZWQuJyB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDMgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcHJpc21hKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvcicgfSxcclxuICAgICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZXQgc3RhdGlzdGljcyBpbiBwYXJhbGxlbFxyXG4gICAgY29uc3QgW1xyXG4gICAgICB0b3RhbFVzZXJzLFxyXG4gICAgICB0b3RhbFN0dWRlbnRzLFxyXG4gICAgICB0b3RhbEluc3RydWN0b3JzLFxyXG4gICAgICBhcHByb3ZlZEluc3RydWN0b3JzLFxyXG4gICAgICBwZW5kaW5nSW5zdHJ1Y3RvcnMsXHJcbiAgICAgIHRvdGFsQ291cnNlcyxcclxuICAgICAgYWN0aXZlQ291cnNlcyxcclxuICAgICAgdG90YWxTdWJzY3JpcHRpb25zLFxyXG4gICAgICByZWNlbnRSZWdpc3RyYXRpb25zLFxyXG4gICAgXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgcHJpc21hLnVzZXIuY291bnQoKSxcclxuICAgICAgcHJpc21hLnN0dWRlbnQuY291bnQoKSxcclxuICAgICAgcHJpc21hLmluc3RydWN0b3IuY291bnQoKSxcclxuICAgICAgcHJpc21hLmluc3RydWN0b3IuY291bnQoeyB3aGVyZTogeyBpc0FwcHJvdmVkOiB0cnVlIH0gfSksXHJcbiAgICAgIHByaXNtYS5pbnN0cnVjdG9yLmNvdW50KHsgd2hlcmU6IHsgaXNBcHByb3ZlZDogZmFsc2UgfSB9KSxcclxuICAgICAgcHJpc21hLmNvdXJzZS5jb3VudCgpLFxyXG4gICAgICBwcmlzbWEuY291cnNlLmNvdW50KHsgd2hlcmU6IHsgaXNBY3RpdmU6IHRydWUgfSB9KSxcclxuICAgICAgcHJpc21hLmNvdXJzZVN1YnNjcmlwdGlvbi5jb3VudCh7IHdoZXJlOiB7IHN0YXR1czogJ2FjdGl2ZScgfSB9KSxcclxuICAgICAgcHJpc21hLnVzZXIuZmluZE1hbnkoe1xyXG4gICAgICAgIHRha2U6IDUsXHJcbiAgICAgICAgb3JkZXJCeTogeyBjcmVhdGVkQXQ6ICdkZXNjJyB9LFxyXG4gICAgICAgIHNlbGVjdDoge1xyXG4gICAgICAgICAgaWQ6IHRydWUsXHJcbiAgICAgICAgICBuYW1lOiB0cnVlLFxyXG4gICAgICAgICAgZW1haWw6IHRydWUsXHJcbiAgICAgICAgICByb2xlOiB0cnVlLFxyXG4gICAgICAgICAgY3JlYXRlZEF0OiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3RhdHM6IHtcclxuICAgICAgICB0b3RhbFVzZXJzLFxyXG4gICAgICAgIHRvdGFsU3R1ZGVudHMsXHJcbiAgICAgICAgdG90YWxJbnN0cnVjdG9ycyxcclxuICAgICAgICBhcHByb3ZlZEluc3RydWN0b3JzLFxyXG4gICAgICAgIHBlbmRpbmdJbnN0cnVjdG9ycyxcclxuICAgICAgICB0b3RhbENvdXJzZXMsXHJcbiAgICAgICAgYWN0aXZlQ291cnNlcyxcclxuICAgICAgICB0b3RhbFN1YnNjcmlwdGlvbnMsXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlY2VudFJlZ2lzdHJhdGlvbnMsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBhZG1pbiBzdGF0czonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggc3RhdGlzdGljcycgfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIkdFVCIsInNlc3Npb24iLCJ1c2VyIiwicm9sZSIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInRvdGFsVXNlcnMiLCJ0b3RhbFN0dWRlbnRzIiwidG90YWxJbnN0cnVjdG9ycyIsImFwcHJvdmVkSW5zdHJ1Y3RvcnMiLCJwZW5kaW5nSW5zdHJ1Y3RvcnMiLCJ0b3RhbENvdXJzZXMiLCJhY3RpdmVDb3Vyc2VzIiwidG90YWxTdWJzY3JpcHRpb25zIiwicmVjZW50UmVnaXN0cmF0aW9ucyIsIlByb21pc2UiLCJhbGwiLCJjb3VudCIsInN0dWRlbnQiLCJpbnN0cnVjdG9yIiwid2hlcmUiLCJpc0FwcHJvdmVkIiwiY291cnNlIiwiaXNBY3RpdmUiLCJjb3Vyc2VTdWJzY3JpcHRpb24iLCJmaW5kTWFueSIsInRha2UiLCJvcmRlckJ5IiwiY3JlYXRlZEF0Iiwic2VsZWN0IiwiaWQiLCJuYW1lIiwiZW1haWwiLCJzdGF0cyIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/stats/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                },\n                role: {\n                    label: \"Role\",\n                    type: \"text\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                try {\n                    // Find user by email\n                    const user = await _prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        },\n                        include: {\n                            studentProfile: true,\n                            instructorProfile: true\n                        }\n                    });\n                    if (!user) {\n                        return null;\n                    }\n                    // Verify password\n                    const passwordMatch = await bcryptjs__WEBPACK_IMPORTED_MODULE_2__[\"default\"].compare(credentials.password, user.password);\n                    if (!passwordMatch) {\n                        return null;\n                    }\n                    // Check if instructor is approved\n                    if (user.role === \"instructor\" && user.instructorProfile) {\n                        if (!user.instructorProfile.isApproved) {\n                            throw new Error(\"Your instructor account is pending approval\");\n                        }\n                    }\n                    // Get additional profile data\n                    let studentId = null;\n                    let registrationNumber = null;\n                    if (user.role === \"student\" && user.studentProfile) {\n                        studentId = user.studentProfile.studentId;\n                        registrationNumber = user.studentProfile.registrationNumber;\n                    }\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role,\n                        studentId: studentId || undefined,\n                        registrationNumber: registrationNumber || undefined\n                    };\n                } catch (error) {\n                    console.error(\"Auth error:\", error);\n                    if (error.message) {\n                        throw error;\n                    }\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.studentId = user.studentId;\n                token.registrationNumber = user.registrationNumber;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n                session.user.studentId = token.studentId;\n                session.user.registrationNumber = token.registrationNumber;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\",\n        error: \"/auth/error\"\n    },\n    secret: process.env.NEXTAUTH_SECRET || \"your-secret-key\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDVyxrQkFBa0IsR0FBR1UsTUFBTVYsa0JBQWtCO1lBQzVEO1lBQ0EsT0FBT007UUFDVDtJQUNGO0lBQ0FNLE9BQU87UUFDTEMsUUFBUTtRQUNSVixPQUFPO0lBQ1Q7SUFDQVcsUUFBUUMsUUFBUUMsR0FBRyxDQUFDQyxlQUFlLElBQUk7QUFDekMsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1kZXNpZ24tZ3JhZGluZy1hcHAvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gXCJuZXh0LWF1dGhcIjtcclxuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIi4vcHJpc21hXCI7XHJcbmltcG9ydCBiY3J5cHQgZnJvbSBcImJjcnlwdGpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcclxuICBwcm92aWRlcnM6IFtcclxuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xyXG4gICAgICBuYW1lOiBcImNyZWRlbnRpYWxzXCIsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiB7XHJcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiIH0sXHJcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXHJcbiAgICAgICAgcm9sZTogeyBsYWJlbDogXCJSb2xlXCIsIHR5cGU6IFwidGV4dFwiIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xyXG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIEZpbmQgdXNlciBieSBlbWFpbFxyXG4gICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfSxcclxuICAgICAgICAgICAgaW5jbHVkZToge1xyXG4gICAgICAgICAgICAgIHN0dWRlbnRQcm9maWxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgIGluc3RydWN0b3JQcm9maWxlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgaWYgKCF1c2VyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFZlcmlmeSBwYXNzd29yZFxyXG4gICAgICAgICAgY29uc3QgcGFzc3dvcmRNYXRjaCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKFxyXG4gICAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcclxuICAgICAgICAgICAgdXNlci5wYXNzd29yZFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXBhc3N3b3JkTWF0Y2gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgaW5zdHJ1Y3RvciBpcyBhcHByb3ZlZFxyXG4gICAgICAgICAgaWYgKHVzZXIucm9sZSA9PT0gJ2luc3RydWN0b3InICYmIHVzZXIuaW5zdHJ1Y3RvclByb2ZpbGUpIHtcclxuICAgICAgICAgICAgaWYgKCF1c2VyLmluc3RydWN0b3JQcm9maWxlLmlzQXBwcm92ZWQpIHtcclxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgaW5zdHJ1Y3RvciBhY2NvdW50IGlzIHBlbmRpbmcgYXBwcm92YWwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEdldCBhZGRpdGlvbmFsIHByb2ZpbGUgZGF0YVxyXG4gICAgICAgICAgbGV0IHN0dWRlbnRJZCA9IG51bGw7XHJcbiAgICAgICAgICBsZXQgcmVnaXN0cmF0aW9uTnVtYmVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBpZiAodXNlci5yb2xlID09PSAnc3R1ZGVudCcgJiYgdXNlci5zdHVkZW50UHJvZmlsZSkge1xyXG4gICAgICAgICAgICBzdHVkZW50SWQgPSB1c2VyLnN0dWRlbnRQcm9maWxlLnN0dWRlbnRJZDtcclxuICAgICAgICAgICAgcmVnaXN0cmF0aW9uTnVtYmVyID0gdXNlci5zdHVkZW50UHJvZmlsZS5yZWdpc3RyYXRpb25OdW1iZXI7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXHJcbiAgICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcclxuICAgICAgICAgICAgc3R1ZGVudElkOiBzdHVkZW50SWQgfHwgdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICByZWdpc3RyYXRpb25OdW1iZXI6IHJlZ2lzdHJhdGlvbk51bWJlciB8fCB1bmRlZmluZWQsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgc2Vzc2lvbjoge1xyXG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXHJcbiAgfSxcclxuICBjYWxsYmFja3M6IHtcclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcclxuICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICB0b2tlbi5yb2xlID0gdXNlci5yb2xlO1xyXG4gICAgICAgIHRva2VuLnN0dWRlbnRJZCA9IHVzZXIuc3R1ZGVudElkO1xyXG4gICAgICAgIHRva2VuLnJlZ2lzdHJhdGlvbk51bWJlciA9IHVzZXIucmVnaXN0cmF0aW9uTnVtYmVyO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0b2tlbjtcclxuICAgIH0sXHJcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xyXG4gICAgICBpZiAodG9rZW4pIHtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5zdWIhO1xyXG4gICAgICAgIHNlc3Npb24udXNlci5yb2xlID0gdG9rZW4ucm9sZSBhcyBzdHJpbmc7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLnN0dWRlbnRJZCA9IHRva2VuLnN0dWRlbnRJZCBhcyBzdHJpbmc7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJlZ2lzdHJhdGlvbk51bWJlciA9IHRva2VuLnJlZ2lzdHJhdGlvbk51bWJlciBhcyBzdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb247XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGFnZXM6IHtcclxuICAgIHNpZ25JbjogXCIvYXV0aC9zaWduaW5cIixcclxuICAgIGVycm9yOiBcIi9hdXRoL2Vycm9yXCIsXHJcbiAgfSxcclxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCB8fCBcInlvdXItc2VjcmV0LWtleVwiLFxyXG59O1xyXG4iXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsInByaXNtYSIsImJjcnlwdCIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsInJvbGUiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaW5jbHVkZSIsInN0dWRlbnRQcm9maWxlIiwiaW5zdHJ1Y3RvclByb2ZpbGUiLCJwYXNzd29yZE1hdGNoIiwiY29tcGFyZSIsImlzQXBwcm92ZWQiLCJFcnJvciIsInN0dWRlbnRJZCIsInJlZ2lzdHJhdGlvbk51bWJlciIsImlkIiwidW5kZWZpbmVkIiwiZXJyb3IiLCJjb25zb2xlIiwibWVzc2FnZSIsInNlc3Npb24iLCJzdHJhdGVneSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwicGFnZXMiLCJzaWduSW4iLCJzZWNyZXQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVEFVVEhfU0VDUkVUIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRW5FLElBQUlJLElBQXlCLEVBQWNILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1kZXNpZ24tZ3JhZGluZy1hcHAvLi9saWIvcHJpc21hLnRzPzk4MjIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xyXG5cclxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHtcclxuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBwcmlzbWEgPSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID8/IG5ldyBQcmlzbWFDbGllbnQoKTtcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xyXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/yallist","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fstats%2Froute&page=%2Fapi%2Fadmin%2Fstats%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fstats%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();