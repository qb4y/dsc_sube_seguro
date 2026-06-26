/* @ds-bundle: {"namespace":"SubeSeguroDS","components":[{"name":"Badge","sourcePath":"components/general/Badge/Badge.jsx"},{"name":"Button","sourcePath":"components/general/Button/Button.jsx"},{"name":"ChoiceButton","sourcePath":"components/general/ChoiceButton/ChoiceButton.jsx"},{"name":"MatchConfirm","sourcePath":"components/general/MatchConfirm/MatchConfirm.jsx"},{"name":"PlateInput","sourcePath":"components/general/PlateInput/PlateInput.jsx"},{"name":"ShareButton","sourcePath":"components/general/ShareButton/ShareButton.jsx"},{"name":"StatusRow","sourcePath":"components/general/StatusRow/StatusRow.jsx"},{"name":"VehicleCard","sourcePath":"components/general/VehicleCard/VehicleCard.jsx"},{"name":"VerdictCard","sourcePath":"components/general/VerdictCard/VerdictCard.jsx"}],"sourceHashes":{"components/general/Badge/Badge.jsx":"27fb4c36c7fb","components/general/Badge/Badge.d.ts":"d5a2edc62127","components/general/Badge/Badge.prompt.md":"22351cb35b82","components/general/Button/Button.jsx":"f5b7f90be310","components/general/Button/Button.d.ts":"d1fb466cb146","components/general/Button/Button.prompt.md":"2f79b6e5220a","components/general/ChoiceButton/ChoiceButton.jsx":"090fb9fb090c","components/general/ChoiceButton/ChoiceButton.d.ts":"de4bc861b3ba","components/general/ChoiceButton/ChoiceButton.prompt.md":"bbdde971e3b8","components/general/MatchConfirm/MatchConfirm.jsx":"04344eeb475d","components/general/MatchConfirm/MatchConfirm.d.ts":"fc41ed29108f","components/general/MatchConfirm/MatchConfirm.prompt.md":"389e066f94a0","components/general/PlateInput/PlateInput.jsx":"543ca500dd8c","components/general/PlateInput/PlateInput.d.ts":"3e1fee6f86d7","components/general/PlateInput/PlateInput.prompt.md":"92f6c0e9c8ba","components/general/ShareButton/ShareButton.jsx":"a0786c5c70aa","components/general/ShareButton/ShareButton.d.ts":"87a738667530","components/general/ShareButton/ShareButton.prompt.md":"30be53c00c78","components/general/StatusRow/StatusRow.jsx":"68839ee4444f","components/general/StatusRow/StatusRow.d.ts":"1e133d2f0b75","components/general/StatusRow/StatusRow.prompt.md":"e6586a0486d6","components/general/VehicleCard/VehicleCard.jsx":"0fecfd69cd1f","components/general/VehicleCard/VehicleCard.d.ts":"38c433e004bb","components/general/VehicleCard/VehicleCard.prompt.md":"d342bf81c673","components/general/VerdictCard/VerdictCard.jsx":"e467069e4afb","components/general/VerdictCard/VerdictCard.d.ts":"eec838073ccb","components/general/VerdictCard/VerdictCard.prompt.md":"0719d69b2a9e"},"inlinedExternals":["lucide-react"],"builtBy":"cc-design-sync"} */
"use strict";
var SubeSeguroDS = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function jsx9(t, p, k) {
        return R.createElement(t, k === void 0 ? p : Object.assign({ key: k }, p));
      }
      module.exports = R;
      module.exports.jsx = jsx9;
      module.exports.jsxs = jsx9;
      module.exports.jsxDEV = jsx9;
      module.exports.Fragment = R.Fragment;
    }
  });

  // design-system/dist/index.es.js
  var index_es_exports = {};
  __export(index_es_exports, {
    Badge: () => Badge,
    Button: () => Button,
    ChoiceButton: () => ChoiceButton,
    MatchConfirm: () => MatchConfirm,
    PlateInput: () => PlateInput,
    ShareButton: () => ShareButton,
    StatusRow: () => StatusRow,
    VehicleCard: () => VehicleCard,
    VerdictCard: () => VerdictCard,
    tokens: () => tokens,
    verdictColors: () => verdictColors,
    verdictLabels: () => verdictLabels
  });
  init_define_import_meta_env();

  // design-system/node_modules/lucide-react/dist/esm/lucide-react.mjs
  init_define_import_meta_env();

  // design-system/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
  init_define_import_meta_env();
  var import_react3 = __toESM(require_react_shim(), 1);

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
  init_define_import_meta_env();
  var mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
  }).join(" ").trim();

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
  init_define_import_meta_env();
  var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
  init_define_import_meta_env();

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
  init_define_import_meta_env();
  var toCamelCase = (string) => string.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
  );

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
  var toPascalCase = (string) => {
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  };

  // design-system/node_modules/lucide-react/dist/esm/Icon.mjs
  init_define_import_meta_env();
  var import_react2 = __toESM(require_react_shim(), 1);

  // design-system/node_modules/lucide-react/dist/esm/defaultAttributes.mjs
  init_define_import_meta_env();
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  // design-system/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
  init_define_import_meta_env();
  var hasA11yProp = (props) => {
    for (const prop in props) {
      if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
        return true;
      }
    }
    return false;
  };

  // design-system/node_modules/lucide-react/dist/esm/context.mjs
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim(), 1);
  var LucideContext = (0, import_react.createContext)({});
  var useLucideContext = () => (0, import_react.useContext)(LucideContext);

  // design-system/node_modules/lucide-react/dist/esm/Icon.mjs
  var Icon = (0, import_react2.forwardRef)(
    ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
      const {
        size: contextSize = 24,
        strokeWidth: contextStrokeWidth = 2,
        absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
        color: contextColor = "currentColor",
        className: contextClass = ""
      } = useLucideContext() ?? {};
      const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
      return (0, import_react2.createElement)(
        "svg",
        {
          ref,
          ...defaultAttributes,
          width: size ?? contextSize ?? defaultAttributes.width,
          height: size ?? contextSize ?? defaultAttributes.height,
          stroke: color ?? contextColor,
          strokeWidth: calculatedStrokeWidth,
          className: mergeClasses("lucide", contextClass, className),
          ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
          ...rest
        },
        [
          ...iconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
          ...Array.isArray(children) ? children : [children]
        ]
      );
    }
  );

  // design-system/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
  var createLucideIcon = (iconName, iconNode) => {
    const Component = (0, import_react3.forwardRef)(
      ({ className, ...props }, ref) => (0, import_react3.createElement)(Icon, {
        ref,
        iconNode,
        className: mergeClasses(
          `lucide-${toKebabCase(toPascalCase(iconName))}`,
          `lucide-${iconName}`,
          className
        ),
        ...props
      })
    );
    Component.displayName = toPascalCase(iconName);
    return Component;
  };

  // design-system/node_modules/lucide-react/dist/esm/icons/car.mjs
  init_define_import_meta_env();
  var __iconNode = [
    [
      "path",
      {
        d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
        key: "5owen"
      }
    ],
    ["circle", { cx: "7", cy: "17", r: "2", key: "u2ysq9" }],
    ["path", { d: "M9 17h6", key: "r8uit2" }],
    ["circle", { cx: "17", cy: "17", r: "2", key: "axvx0g" }]
  ];
  var Car = createLucideIcon("car", __iconNode);

  // design-system/node_modules/lucide-react/dist/esm/icons/check.mjs
  init_define_import_meta_env();
  var __iconNode2 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
  var Check = createLucideIcon("check", __iconNode2);

  // design-system/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
  init_define_import_meta_env();
  var __iconNode3 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
  var ChevronRight = createLucideIcon("chevron-right", __iconNode3);

  // design-system/node_modules/lucide-react/dist/esm/icons/clock.mjs
  init_define_import_meta_env();
  var __iconNode4 = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
  ];
  var Clock = createLucideIcon("clock", __iconNode4);

  // design-system/node_modules/lucide-react/dist/esm/icons/scan-line.mjs
  init_define_import_meta_env();
  var __iconNode5 = [
    ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
    ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
    ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
    ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
    ["path", { d: "M7 12h10", key: "b7w52i" }]
  ];
  var ScanLine = createLucideIcon("scan-line", __iconNode5);

  // design-system/node_modules/lucide-react/dist/esm/icons/share-2.mjs
  init_define_import_meta_env();
  var __iconNode6 = [
    ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
    ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
    ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
    ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
    ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
  ];
  var Share2 = createLucideIcon("share-2", __iconNode6);

  // design-system/node_modules/lucide-react/dist/esm/icons/shield-alert.mjs
  init_define_import_meta_env();
  var __iconNode7 = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y"
      }
    ],
    ["path", { d: "M12 8v4", key: "1got3b" }],
    ["path", { d: "M12 16h.01", key: "1drbdi" }]
  ];
  var ShieldAlert = createLucideIcon("shield-alert", __iconNode7);

  // design-system/node_modules/lucide-react/dist/esm/icons/shield-check.mjs
  init_define_import_meta_env();
  var __iconNode8 = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y"
      }
    ],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
  ];
  var ShieldCheck = createLucideIcon("shield-check", __iconNode8);

  // design-system/node_modules/lucide-react/dist/esm/icons/shield-x.mjs
  init_define_import_meta_env();
  var __iconNode9 = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y"
      }
    ],
    ["path", { d: "m14.5 9.5-5 5", key: "17q4r4" }],
    ["path", { d: "m9.5 9.5 5 5", key: "18nt4w" }]
  ];
  var ShieldX = createLucideIcon("shield-x", __iconNode9);

  // design-system/node_modules/lucide-react/dist/esm/icons/x.mjs
  init_define_import_meta_env();
  var __iconNode10 = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
  ];
  var X = createLucideIcon("x", __iconNode10);

  // design-system/dist/index.es.js
  var import_jsx_runtime = __toESM(require_react_shim());
  var import_jsx_runtime2 = __toESM(require_react_shim());
  var import_jsx_runtime3 = __toESM(require_react_shim());
  var import_jsx_runtime4 = __toESM(require_react_shim());
  var import_jsx_runtime5 = __toESM(require_react_shim());
  var import_jsx_runtime6 = __toESM(require_react_shim());
  var import_jsx_runtime7 = __toESM(require_react_shim());
  var import_jsx_runtime8 = __toESM(require_react_shim());
  var tokens = {
    colorBackground: "#0E1116",
    colorSurface: "#171C24",
    colorSurfaceElevated: "#1F2630",
    colorLine: "rgba(255,255,255,0.08)",
    colorText: "#EAEEF5",
    colorTextMuted: "#8B95A7",
    colorBrand: "#2FD6C6",
    colorSuccess: "#34D27B",
    colorWarning: "#F4B740",
    colorDanger: "#FF5D5D"
  };
  var verdictColors = {
    green: tokens.colorSuccess,
    amber: tokens.colorWarning,
    red: tokens.colorDanger
  };
  var verdictLabels = {
    green: "Seguro",
    amber: "Precauci\xF3n",
    red: "Riesgo"
  };
  var icons = { green: ShieldCheck, amber: ShieldAlert, red: ShieldX };
  function Badge({ verdict, label }) {
    const color = verdictColors[verdict];
    const Icon2 = icons[verdict];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      background: color + "22",
      border: `1px solid ${color}55`,
      color,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon2, { size: 14, strokeWidth: 2.5 }),
      label ?? verdictLabels[verdict]
    ] });
  }
  function Button({ variant = "primary", loading, disabled, children, onClick }) {
    const isPrimary = variant === "primary";
    const inactive = disabled || loading;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        onClick,
        disabled: !!inactive,
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 20px",
          borderRadius: 14,
          border: "none",
          cursor: inactive ? "not-allowed" : "pointer",
          background: isPrimary ? inactive ? tokens.colorSurfaceElevated : tokens.colorBrand : tokens.colorSurfaceElevated,
          color: isPrimary ? inactive ? tokens.colorTextMuted : tokens.colorBackground : tokens.colorText,
          fontWeight: 800,
          fontSize: 15,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          transition: "background .15s",
          width: "100%"
        },
        children: loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ScanLine, { size: 18 }),
          " Revisando\u2026"
        ] }) : children
      }
    );
  }
  function ChoiceButton({ active, color, Icon: Icon2 = Check, label, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        onClick,
        style: {
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: "11px 10px",
          borderRadius: 11,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13.5,
          background: active ? color + "22" : tokens.colorSurfaceElevated,
          border: `1.5px solid ${active ? color : tokens.colorLine}`,
          color: active ? color : tokens.colorText,
          transition: "all .12s",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon2, { size: 17 }),
          " ",
          label
        ]
      }
    );
  }
  function MatchConfirm({ match, onMatch }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ChoiceButton, { active: match === true, color: tokens.colorSuccess, Icon: Check, label: "S\xED, coincide", onClick: () => onMatch(true) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ChoiceButton, { active: match === false, color: tokens.colorDanger, Icon: X, label: "No coincide", onClick: () => onMatch(false) })
    ] });
  }
  function PlateInput({ value, onChange, onSubmit, loading, placeholder = "ABC-123" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: {
      position: "relative",
      borderRadius: 14,
      overflow: "hidden",
      border: `2px solid ${tokens.colorLine}`,
      display: "flex",
      background: "#F3F4F0"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: {
        width: 38,
        background: "#1B4FA0",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1,
        flexShrink: 0
      }, children: "PE" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          value,
          onChange: (e) => onChange(e.target.value.toUpperCase().slice(0, 8)),
          onKeyDown: (e) => e.key === "Enter" && onSubmit?.(),
          placeholder,
          "aria-label": "Placa del veh\xEDculo",
          style: {
            flex: 1,
            border: "none",
            background: "transparent",
            padding: "16px 14px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "#15171C",
            outline: "none"
          }
        }
      ),
      loading && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: {
        position: "absolute",
        left: 38,
        right: 0,
        top: 0,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${tokens.colorBrand}, transparent)`,
        animation: "scan 1.1s linear infinite"
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: `@keyframes scan { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }` })
    ] });
  }
  function ShareButton({ shareUrl, shared, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "a",
      {
        href: shareUrl,
        target: "_blank",
        rel: "noreferrer",
        onClick,
        style: {
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "15px 16px",
          borderRadius: 14,
          background: shared ? tokens.colorSurfaceElevated : tokens.colorBrand,
          color: shared ? tokens.colorText : tokens.colorBackground,
          fontWeight: 800,
          fontSize: 14.5,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Share2, { size: 19 }),
          shared ? "Viaje compartido \u2713" : "Comparte tu viaje con un contacto",
          !shared && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ChevronRight, { size: 18, style: { marginLeft: "auto" } })
        ]
      }
    );
  }
  var icons2 = { green: ShieldCheck, amber: Clock, red: ShieldX };
  function StatusRow({ verdict, title, big, sub, note }) {
    const color = verdictColors[verdict];
    const Icon2 = icons2[verdict];
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: {
      borderRadius: 16,
      padding: 16,
      background: tokens.colorSurface,
      border: `1px solid ${tokens.colorLine}`,
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 11,
        flexShrink: 0,
        background: color + "1F",
        display: "grid",
        placeItems: "center"
      }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon2, { size: 20, color, strokeWidth: 2.4 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: tokens.colorTextMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }, children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.01em" }, children: big }),
        sub && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 13, color: tokens.colorTextMuted }, children: sub }),
        note && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12.5, color: tokens.colorText, opacity: 0.82, marginTop: 6, lineHeight: 1.45 }, children: note })
      ] })
    ] });
  }
  var icons3 = { green: ShieldCheck, amber: ShieldAlert, red: ShieldX };
  function VerdictCard({ verdict, placa }) {
    const color = verdictColors[verdict];
    const Icon2 = icons3[verdict];
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: {
      borderRadius: 18,
      padding: 18,
      background: color + "14",
      border: `1px solid ${color}55`,
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: {
        width: 52,
        height: 52,
        borderRadius: 14,
        flexShrink: 0,
        background: color + "22",
        display: "grid",
        placeItems: "center"
      }, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon2, { size: 28, color, strokeWidth: 2.4 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { fontSize: 12, color: tokens.colorTextMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Veredicto" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.02em" }, children: verdictLabels[verdict] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { marginLeft: "auto", fontFamily: "ui-monospace, monospace", fontSize: 13, color: tokens.colorTextMuted, fontWeight: 700 }, children: placa })
    ] });
  }
  function VehicleCard({ vehicle, match, onMatch }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
      borderRadius: 16,
      padding: 16,
      background: tokens.colorSurface,
      border: `1px solid ${tokens.colorLine}`,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Car, { size: 18, color: tokens.colorTextMuted }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 12, color: tokens.colorTextMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }, children: "Veh\xEDculo registrado" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: tokens.colorText }, children: [
        vehicle.marca,
        " ",
        vehicle.modelo
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { fontSize: 14, color: tokens.colorTextMuted, marginBottom: 14 }, children: [
        "Color ",
        vehicle.color
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: tokens.colorText }, children: [
        "\xBFEl auto frente a ti es un ",
        vehicle.marca,
        " ",
        vehicle.modelo,
        " ",
        vehicle.color.toLowerCase(),
        "?"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MatchConfirm, { match, onMatch }),
      match === false && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
        marginTop: 12,
        fontSize: 13,
        color: tokens.colorDanger,
        background: tokens.colorDanger + "12",
        border: `1px solid ${tokens.colorDanger}44`,
        borderRadius: 10,
        padding: "10px 12px",
        lineHeight: 1.45
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { children: "Alerta." }),
        " La placa no corresponde a este auto. Podr\xEDa ser una placa clonada o cambiada. No subas."
      ] })
    ] });
  }
  return __toCommonJS(index_es_exports);
})();
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-react/dist/esm/defaultAttributes.mjs:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-react/dist/esm/context.mjs:
lucide-react/dist/esm/Icon.mjs:
lucide-react/dist/esm/createLucideIcon.mjs:
lucide-react/dist/esm/icons/car.mjs:
lucide-react/dist/esm/icons/check.mjs:
lucide-react/dist/esm/icons/chevron-right.mjs:
lucide-react/dist/esm/icons/clock.mjs:
lucide-react/dist/esm/icons/scan-line.mjs:
lucide-react/dist/esm/icons/share-2.mjs:
lucide-react/dist/esm/icons/shield-alert.mjs:
lucide-react/dist/esm/icons/shield-check.mjs:
lucide-react/dist/esm/icons/shield-x.mjs:
lucide-react/dist/esm/icons/x.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.21.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
window.SubeSeguroDS=SubeSeguroDS.__dsMainNs?Object.assign({},SubeSeguroDS,SubeSeguroDS.__dsMainNs,{__dsMainNs:undefined}):SubeSeguroDS;
