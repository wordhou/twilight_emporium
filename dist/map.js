/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app/views/map.ts":
/*!******************************!*\
  !*** ./src/app/views/map.ts ***!
  \******************************/
/***/ (() => {

eval("\n//import $ from \"jquery\";\nvar _a, _b;\ndocument.querySelectorAll(\".edit-comment-button\").forEach((a) => {\n    const i = parseInt(a.dataset.i);\n    a.addEventListener(\"click\", () => {\n        var _a;\n        const comment = document.getElementById(`comment-${i}`);\n        (_a = comment === null || comment === void 0 ? void 0 : comment.querySelector(\".comment-edit\")) === null || _a === void 0 ? void 0 : _a.classList.toggle(\"on\");\n    });\n});\ndocument.querySelectorAll(\"comment-button\").forEach((a) => {\n    const i = parseInt(a.dataset.i);\n    a.addEventListener(\"click\", () => {\n        var _a;\n        const comment = document.getElementById(`comment-${i}`);\n        (_a = comment === null || comment === void 0 ? void 0 : comment.querySelector(\".comment-edit\")) === null || _a === void 0 ? void 0 : _a.classList.toggle(\"on\");\n    });\n});\nconst mapNameEditor = document.querySelector(\".map-name-editor\");\n(_a = document.getElementById(\"edit-map-name\")) === null || _a === void 0 ? void 0 : _a.addEventListener(\"click\", () => {\n    mapNameEditor.classList.toggle(\"on\");\n});\nconst descriptionEditor = document.querySelector(\".description-editor\");\n(_b = document.getElementById(\"edit-description\")) === null || _b === void 0 ? void 0 : _b.addEventListener(\"click\", () => {\n    descriptionEditor.classList.toggle(\"on\");\n});\n\n\n//# sourceURL=webpack://twilight_emporium/./src/app/views/map.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/app/views/map.ts"]();
/******/ 	
/******/ })()
;