"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkmolecule_web"] = self["webpackChunkmolecule_web"] || []).push([["pkg_index_js"],{

/***/ "./pkg/index.js":
/*!**********************!*\
  !*** ./pkg/index.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   get_3dmol_atoms: () => (/* binding */ get_3dmol_atoms),\n/* harmony export */   get_3dmol_bonds: () => (/* binding */ get_3dmol_bonds),\n/* harmony export */   init: () => (/* binding */ init),\n/* harmony export */   initSync: () => (/* binding */ initSync),\n/* harmony export */   parse_pdb: () => (/* binding */ parse_pdb),\n/* harmony export */   prepare_for_3dmol: () => (/* binding */ prepare_for_3dmol)\n/* harmony export */ });\nlet wasm;\n\nconst cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );\n\nif (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };\n\nlet cachedUint8ArrayMemory0 = null;\n\nfunction getUint8ArrayMemory0() {\n    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {\n        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8ArrayMemory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));\n}\n\nfunction logError(f, args) {\n    try {\n        return f.apply(this, args);\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error ? `${e.message}\\n\\nStack:\\n${e.stack}` : e.toString();\n            } catch(_) {\n                return \"<failed to stringify thrown value>\";\n            }\n        }());\n        console.error(\"wasm-bindgen: imported JS function that was not marked as `catch` threw an error:\", error);\n        throw e;\n    }\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nconst cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === 'function'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (typeof(arg) !== 'string') throw new Error(`expected a string argument, found ${typeof(arg)}`);\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length, 1) >>> 0;\n        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len, 1) >>> 0;\n\n    const mem = getUint8ArrayMemory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;\n        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n        if (ret.read !== arg.length) throw new Error('failed to pass whole string');\n        offset += ret.written;\n        ptr = realloc(ptr, len, offset, 1) >>> 0;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nlet cachedDataViewMemory0 = null;\n\nfunction getDataViewMemory0() {\n    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {\n        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);\n    }\n    return cachedDataViewMemory0;\n}\n\nfunction init() {\n    wasm.init();\n}\n\nfunction takeFromExternrefTable0(idx) {\n    const value = wasm.__wbindgen_export_3.get(idx);\n    wasm.__externref_table_dealloc(idx);\n    return value;\n}\n/**\n * @param {string} pdb_content\n * @returns {any}\n */\nfunction parse_pdb(pdb_content) {\n    const ptr0 = passStringToWasm0(pdb_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len0 = WASM_VECTOR_LEN;\n    const ret = wasm.parse_pdb(ptr0, len0);\n    if (ret[2]) {\n        throw takeFromExternrefTable0(ret[1]);\n    }\n    return takeFromExternrefTable0(ret[0]);\n}\n\n/**\n * @param {string} pdb_content\n * @returns {any}\n */\nfunction get_3dmol_atoms(pdb_content) {\n    const ptr0 = passStringToWasm0(pdb_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len0 = WASM_VECTOR_LEN;\n    const ret = wasm.get_3dmol_atoms(ptr0, len0);\n    if (ret[2]) {\n        throw takeFromExternrefTable0(ret[1]);\n    }\n    return takeFromExternrefTable0(ret[0]);\n}\n\n/**\n * @param {string} pdb_content\n * @returns {any}\n */\nfunction get_3dmol_bonds(pdb_content) {\n    const ptr0 = passStringToWasm0(pdb_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len0 = WASM_VECTOR_LEN;\n    const ret = wasm.get_3dmol_bonds(ptr0, len0);\n    if (ret[2]) {\n        throw takeFromExternrefTable0(ret[1]);\n    }\n    return takeFromExternrefTable0(ret[0]);\n}\n\n/**\n * @param {string} pdb_content\n * @returns {any}\n */\nfunction prepare_for_3dmol(pdb_content) {\n    const ptr0 = passStringToWasm0(pdb_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len0 = WASM_VECTOR_LEN;\n    const ret = wasm.prepare_for_3dmol(ptr0, len0);\n    if (ret[2]) {\n        throw takeFromExternrefTable0(ret[1]);\n    }\n    return takeFromExternrefTable0(ret[0]);\n}\n\nasync function __wbg_load(module, imports) {\n    if (typeof Response === 'function' && module instanceof Response) {\n        if (typeof WebAssembly.instantiateStreaming === 'function') {\n            try {\n                return await WebAssembly.instantiateStreaming(module, imports);\n\n            } catch (e) {\n                if (module.headers.get('Content-Type') != 'application/wasm') {\n                    console.warn(\"`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\\n\", e);\n\n                } else {\n                    throw e;\n                }\n            }\n        }\n\n        const bytes = await module.arrayBuffer();\n        return await WebAssembly.instantiate(bytes, imports);\n\n    } else {\n        const instance = await WebAssembly.instantiate(module, imports);\n\n        if (instance instanceof WebAssembly.Instance) {\n            return { instance, module };\n\n        } else {\n            return instance;\n        }\n    }\n}\n\nfunction __wbg_get_imports() {\n    const imports = {};\n    imports.wbg = {};\n    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function() { return logError(function (arg0, arg1) {\n        let deferred0_0;\n        let deferred0_1;\n        try {\n            deferred0_0 = arg0;\n            deferred0_1 = arg1;\n            console.error(getStringFromWasm0(arg0, arg1));\n        } finally {\n            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);\n        }\n    }, arguments) };\n    imports.wbg.__wbg_new_405e22f390576ce2 = function() { return logError(function () {\n        const ret = new Object();\n        return ret;\n    }, arguments) };\n    imports.wbg.__wbg_new_78feb108b6472713 = function() { return logError(function () {\n        const ret = new Array();\n        return ret;\n    }, arguments) };\n    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() { return logError(function () {\n        const ret = new Error();\n        return ret;\n    }, arguments) };\n    imports.wbg.__wbg_set_37837023f3d740e8 = function() { return logError(function (arg0, arg1, arg2) {\n        arg0[arg1 >>> 0] = arg2;\n    }, arguments) };\n    imports.wbg.__wbg_set_3807d5f0bfc24aa7 = function() { return logError(function (arg0, arg1, arg2) {\n        arg0[arg1] = arg2;\n    }, arguments) };\n    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function() { return logError(function (arg0, arg1) {\n        const ret = arg1.stack;\n        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n        const len1 = WASM_VECTOR_LEN;\n        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);\n        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);\n    }, arguments) };\n    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {\n        const ret = BigInt.asUintN(64, arg0);\n        return ret;\n    };\n    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {\n        const ret = new Error(getStringFromWasm0(arg0, arg1));\n        return ret;\n    };\n    imports.wbg.__wbindgen_init_externref_table = function() {\n        const table = wasm.__wbindgen_export_3;\n        const offset = table.grow(4);\n        table.set(0, undefined);\n        table.set(offset + 0, undefined);\n        table.set(offset + 1, null);\n        table.set(offset + 2, true);\n        table.set(offset + 3, false);\n        ;\n    };\n    imports.wbg.__wbindgen_number_new = function(arg0) {\n        const ret = arg0;\n        return ret;\n    };\n    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {\n        const ret = getStringFromWasm0(arg0, arg1);\n        return ret;\n    };\n    imports.wbg.__wbindgen_throw = function(arg0, arg1) {\n        throw new Error(getStringFromWasm0(arg0, arg1));\n    };\n\n    return imports;\n}\n\nfunction __wbg_init_memory(imports, memory) {\n\n}\n\nfunction __wbg_finalize_init(instance, module) {\n    wasm = instance.exports;\n    __wbg_init.__wbindgen_wasm_module = module;\n    cachedDataViewMemory0 = null;\n    cachedUint8ArrayMemory0 = null;\n\n\n    wasm.__wbindgen_start();\n    return wasm;\n}\n\nfunction initSync(module) {\n    if (wasm !== undefined) return wasm;\n\n\n    if (typeof module !== 'undefined') {\n        if (Object.getPrototypeOf(module) === Object.prototype) {\n            ({module} = module)\n        } else {\n            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')\n        }\n    }\n\n    const imports = __wbg_get_imports();\n\n    __wbg_init_memory(imports);\n\n    if (!(module instanceof WebAssembly.Module)) {\n        module = new WebAssembly.Module(module);\n    }\n\n    const instance = new WebAssembly.Instance(module, imports);\n\n    return __wbg_finalize_init(instance, module);\n}\n\nasync function __wbg_init(module_or_path) {\n    if (wasm !== undefined) return wasm;\n\n\n    if (typeof module_or_path !== 'undefined') {\n        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {\n            ({module_or_path} = module_or_path)\n        } else {\n            console.warn('using deprecated parameters for the initialization function; pass a single object instead')\n        }\n    }\n\n    if (typeof module_or_path === 'undefined') {\n        module_or_path = new URL(/* asset import */ __webpack_require__(/*! index_bg.wasm */ \"./pkg/index_bg.wasm\"), __webpack_require__.b);\n    }\n    const imports = __wbg_get_imports();\n\n    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {\n        module_or_path = fetch(module_or_path);\n    }\n\n    __wbg_init_memory(imports);\n\n    const { instance, module } = await __wbg_load(await module_or_path, imports);\n\n    return __wbg_finalize_init(instance, module);\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__wbg_init);\n\n\n//# sourceURL=webpack://molecule-web/./pkg/index.js?");

/***/ }),

/***/ "./pkg/index_bg.wasm":
/*!***************************!*\
  !*** ./pkg/index_bg.wasm ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__.p + \"index_bg.wasm\";\n\n//# sourceURL=webpack://molecule-web/./pkg/index_bg.wasm?");

/***/ })

}]);