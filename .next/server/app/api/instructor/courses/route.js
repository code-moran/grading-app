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
exports.id = "app/api/instructor/courses/route";
exports.ids = ["app/api/instructor/courses/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Finstructor%2Fcourses%2Froute&page=%2Fapi%2Finstructor%2Fcourses%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finstructor%2Fcourses%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Finstructor%2Fcourses%2Froute&page=%2Fapi%2Finstructor%2Fcourses%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finstructor%2Fcourses%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var C_Users_admin_projects_grading_app_app_api_instructor_courses_route_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/api/instructor/courses/route.ts */ \"(rsc)/./app/api/instructor/courses/route.ts\");\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/instructor/courses/route\",\n        pathname: \"/api/instructor/courses\",\n        filename: \"route\",\n        bundlePath: \"app/api/instructor/courses/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\admin\\\\projects\\\\grading-app\\\\app\\\\api\\\\instructor\\\\courses\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_admin_projects_grading_app_app_api_instructor_courses_route_ts__WEBPACK_IMPORTED_MODULE_2__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/instructor/courses/route\";\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZpbnN0cnVjdG9yJTJGY291cnNlcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGaW5zdHJ1Y3RvciUyRmNvdXJzZXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZpbnN0cnVjdG9yJTJGY291cnNlcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhZG1pbiU1Q3Byb2plY3RzJTVDZ3JhZGluZy1hcHAlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q2FkbWluJTVDcHJvamVjdHMlNUNncmFkaW5nLWFwcCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDOEM7QUFDN0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDaUo7O0FBRWpKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViLWRlc2lnbi1ncmFkaW5nLWFwcC8/M2Q1MSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxwcm9qZWN0c1xcXFxncmFkaW5nLWFwcFxcXFxhcHBcXFxcYXBpXFxcXGluc3RydWN0b3JcXFxcY291cnNlc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvaW5zdHJ1Y3Rvci9jb3Vyc2VzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvaW5zdHJ1Y3Rvci9jb3Vyc2VzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9pbnN0cnVjdG9yL2NvdXJzZXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxwcm9qZWN0c1xcXFxncmFkaW5nLWFwcFxcXFxhcHBcXFxcYXBpXFxcXGluc3RydWN0b3JcXFxcY291cnNlc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9pbnN0cnVjdG9yL2NvdXJzZXMvcm91dGVcIjtcbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Finstructor%2Fcourses%2Froute&page=%2Fapi%2Finstructor%2Fcourses%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finstructor%2Fcourses%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/instructor/courses/route.ts":
/*!*********************************************!*\
  !*** ./app/api/instructor/courses/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n// GET /api/instructor/courses - Get courses assigned to the logged-in instructor\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        const userRole = session.user.role;\n        if (userRole !== \"instructor\") {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Forbidden. Instructor access required.\"\n            }, {\n                status: 403\n            });\n        }\n        // Get instructor profile\n        const instructor = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.instructor.findUnique({\n            where: {\n                userId: session.user.id\n            },\n            include: {\n                courses: {\n                    include: {\n                        course: {\n                            include: {\n                                _count: {\n                                    select: {\n                                        lessons: true,\n                                        subscriptions: true\n                                    }\n                                }\n                            }\n                        }\n                    }\n                }\n            }\n        });\n        if (!instructor) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Instructor profile not found\"\n            }, {\n                status: 404\n            });\n        }\n        // Format courses\n        const courses = instructor.courses.map((ci)=>({\n                id: ci.course.id,\n                title: ci.course.title,\n                description: ci.course.description,\n                isActive: ci.course.isActive,\n                lessonCount: ci.course._count.lessons,\n                subscriberCount: ci.course._count.subscriptions,\n                assignedAt: ci.assignedAt,\n                createdAt: ci.course.createdAt,\n                updatedAt: ci.course.updatedAt\n            }));\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            courses\n        }, {\n            status: 200\n        });\n    } catch (error) {\n        console.error(\"Error fetching instructor courses:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to fetch courses\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2luc3RydWN0b3IvY291cnNlcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBd0Q7QUFDWDtBQUNKO0FBQ0g7QUFFdEMsaUZBQWlGO0FBQzFFLGVBQWVJLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO1FBRWxELElBQUksQ0FBQ0ksU0FBU0MsTUFBTTtZQUNsQixPQUFPUCxrRkFBWUEsQ0FBQ1EsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFlLEdBQ3hCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxNQUFNQyxXQUFXLFFBQVNKLElBQUksQ0FBU0ssSUFBSTtRQUMzQyxJQUFJRCxhQUFhLGNBQWM7WUFDN0IsT0FBT1gsa0ZBQVlBLENBQUNRLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBeUMsR0FDbEQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLHlCQUF5QjtRQUN6QixNQUFNRyxhQUFhLE1BQU1WLCtDQUFNQSxDQUFDVSxVQUFVLENBQUNDLFVBQVUsQ0FBQztZQUNwREMsT0FBTztnQkFBRUMsUUFBUSxRQUFTVCxJQUFJLENBQVNVLEVBQUU7WUFBQztZQUMxQ0MsU0FBUztnQkFDUEMsU0FBUztvQkFDUEQsU0FBUzt3QkFDUEUsUUFBUTs0QkFDTkYsU0FBUztnQ0FDUEcsUUFBUTtvQ0FDTkMsUUFBUTt3Q0FDTkMsU0FBUzt3Q0FDVEMsZUFBZTtvQ0FDakI7Z0NBQ0Y7NEJBQ0Y7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsSUFBSSxDQUFDWCxZQUFZO1lBQ2YsT0FBT2Isa0ZBQVlBLENBQUNRLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBK0IsR0FDeEM7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLGlCQUFpQjtRQUNqQixNQUFNUyxVQUFVTixXQUFXTSxPQUFPLENBQUNNLEdBQUcsQ0FBQyxDQUFDQyxLQUFRO2dCQUM5Q1QsSUFBSVMsR0FBR04sTUFBTSxDQUFDSCxFQUFFO2dCQUNoQlUsT0FBT0QsR0FBR04sTUFBTSxDQUFDTyxLQUFLO2dCQUN0QkMsYUFBYUYsR0FBR04sTUFBTSxDQUFDUSxXQUFXO2dCQUNsQ0MsVUFBVUgsR0FBR04sTUFBTSxDQUFDUyxRQUFRO2dCQUM1QkMsYUFBYUosR0FBR04sTUFBTSxDQUFDQyxNQUFNLENBQUNFLE9BQU87Z0JBQ3JDUSxpQkFBaUJMLEdBQUdOLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDRyxhQUFhO2dCQUMvQ1EsWUFBWU4sR0FBR00sVUFBVTtnQkFDekJDLFdBQVdQLEdBQUdOLE1BQU0sQ0FBQ2EsU0FBUztnQkFDOUJDLFdBQVdSLEdBQUdOLE1BQU0sQ0FBQ2MsU0FBUztZQUNoQztRQUVBLE9BQU9sQyxrRkFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQUVXO1FBQVEsR0FBRztZQUFFVCxRQUFRO1FBQUk7SUFDdEQsRUFBRSxPQUFPRCxPQUFZO1FBQ25CMEIsUUFBUTFCLEtBQUssQ0FBQyxzQ0FBc0NBO1FBQ3BELE9BQU9ULGtGQUFZQSxDQUFDUSxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBMEIsR0FDbkM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWItZGVzaWduLWdyYWRpbmctYXBwLy4vYXBwL2FwaS9pbnN0cnVjdG9yL2NvdXJzZXMvcm91dGUudHM/NWNkYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJztcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJztcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJztcclxuXHJcbi8vIEdFVCAvYXBpL2luc3RydWN0b3IvY291cnNlcyAtIEdldCBjb3Vyc2VzIGFzc2lnbmVkIHRvIHRoZSBsb2dnZWQtaW4gaW5zdHJ1Y3RvclxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKTtcclxuXHJcbiAgICBpZiAoIXNlc3Npb24/LnVzZXIpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICAgIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMSB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXNlclJvbGUgPSAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZTtcclxuICAgIGlmICh1c2VyUm9sZSAhPT0gJ2luc3RydWN0b3InKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnRm9yYmlkZGVuLiBJbnN0cnVjdG9yIGFjY2VzcyByZXF1aXJlZC4nIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMyB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IGluc3RydWN0b3IgcHJvZmlsZVxyXG4gICAgY29uc3QgaW5zdHJ1Y3RvciA9IGF3YWl0IHByaXNtYS5pbnN0cnVjdG9yLmZpbmRVbmlxdWUoe1xyXG4gICAgICB3aGVyZTogeyB1c2VySWQ6IChzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCB9LFxyXG4gICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgY291cnNlczoge1xyXG4gICAgICAgICAgaW5jbHVkZToge1xyXG4gICAgICAgICAgICBjb3Vyc2U6IHtcclxuICAgICAgICAgICAgICBpbmNsdWRlOiB7XHJcbiAgICAgICAgICAgICAgICBfY291bnQ6IHtcclxuICAgICAgICAgICAgICAgICAgc2VsZWN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVzc29uczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFpbnN0cnVjdG9yKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnSW5zdHJ1Y3RvciBwcm9maWxlIG5vdCBmb3VuZCcgfSxcclxuICAgICAgICB7IHN0YXR1czogNDA0IH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3JtYXQgY291cnNlc1xyXG4gICAgY29uc3QgY291cnNlcyA9IGluc3RydWN0b3IuY291cnNlcy5tYXAoKGNpKSA9PiAoe1xyXG4gICAgICBpZDogY2kuY291cnNlLmlkLFxyXG4gICAgICB0aXRsZTogY2kuY291cnNlLnRpdGxlLFxyXG4gICAgICBkZXNjcmlwdGlvbjogY2kuY291cnNlLmRlc2NyaXB0aW9uLFxyXG4gICAgICBpc0FjdGl2ZTogY2kuY291cnNlLmlzQWN0aXZlLFxyXG4gICAgICBsZXNzb25Db3VudDogY2kuY291cnNlLl9jb3VudC5sZXNzb25zLFxyXG4gICAgICBzdWJzY3JpYmVyQ291bnQ6IGNpLmNvdXJzZS5fY291bnQuc3Vic2NyaXB0aW9ucyxcclxuICAgICAgYXNzaWduZWRBdDogY2kuYXNzaWduZWRBdCxcclxuICAgICAgY3JlYXRlZEF0OiBjaS5jb3Vyc2UuY3JlYXRlZEF0LFxyXG4gICAgICB1cGRhdGVkQXQ6IGNpLmNvdXJzZS51cGRhdGVkQXQsXHJcbiAgICB9KSk7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgY291cnNlcyB9LCB7IHN0YXR1czogMjAwIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGluc3RydWN0b3IgY291cnNlczonLCBlcnJvcik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY291cnNlcycgfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsInByaXNtYSIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInVzZXJSb2xlIiwicm9sZSIsImluc3RydWN0b3IiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJ1c2VySWQiLCJpZCIsImluY2x1ZGUiLCJjb3Vyc2VzIiwiY291cnNlIiwiX2NvdW50Iiwic2VsZWN0IiwibGVzc29ucyIsInN1YnNjcmlwdGlvbnMiLCJtYXAiLCJjaSIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJpc0FjdGl2ZSIsImxlc3NvbkNvdW50Iiwic3Vic2NyaWJlckNvdW50IiwiYXNzaWduZWRBdCIsImNyZWF0ZWRBdCIsInVwZGF0ZWRBdCIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/instructor/courses/route.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/yallist","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Finstructor%2Fcourses%2Froute&page=%2Fapi%2Finstructor%2Fcourses%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Finstructor%2Fcourses%2Froute.ts&appDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cadmin%5Cprojects%5Cgrading-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();