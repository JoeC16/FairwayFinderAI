/**
 * FairwayFit AI Embeddable Widget
 *
 * Usage:
 *   <script src="https://fairwayfit.ai/widget.js" data-retailer="YOUR_RETAILER_ID"></script>
 *   <div id="fairwayfit-widget"></div>
 *
 * Or with custom container ID:
 *   <script src="https://fairwayfit.ai/widget.js"
 *     data-retailer="YOUR_RETAILER_ID"
 *     data-container="my-container-id"
 *     data-mode="button"
 *   ></script>
 */
(function () {
  "use strict";

  var BASE_URL = "https://fairwayfit.ai";

  function getScriptTag() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("widget.js") !== -1) return scripts[i];
    }
    return document.currentScript;
  }

  var scriptTag = getScriptTag();
  var retailerId = scriptTag ? scriptTag.getAttribute("data-retailer") : null;
  var containerId = scriptTag ? (scriptTag.getAttribute("data-container") || "fairwayfit-widget") : "fairwayfit-widget";
  var mode = scriptTag ? (scriptTag.getAttribute("data-mode") || "inline") : "inline";
  var theme = scriptTag ? (scriptTag.getAttribute("data-theme") || "light") : "light";

  if (!retailerId) {
    console.warn("[FairwayFit AI] No data-retailer attribute found on widget script tag.");
    return;
  }

  function loadConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE_URL + "/api/widget/" + retailerId, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var config = JSON.parse(xhr.responseText);
            callback(null, config);
          } catch (e) {
            callback(e, null);
          }
        } else {
          callback(new Error("Failed to load config"), null);
        }
      }
    };
    xhr.send();
  }

  function buildIframe(config) {
    var src = BASE_URL + "/embed/" + retailerId + "?theme=" + theme;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.id = "fairwayfit-iframe";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.style.width = "100%";
    iframe.style.minHeight = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.overflow = "hidden";
    iframe.style.display = "block";
    iframe.title = "Golf Fitting by FairwayFit AI";
    return iframe;
  }

  function buildButton(config) {
    var btn = document.createElement("button");
    btn.id = "fairwayfit-btn";
    btn.textContent = config.ctaText || "Start Free Fitting";
    btn.style.cssText = [
      "display: inline-flex",
      "align-items: center",
      "gap: 8px",
      "padding: 14px 28px",
      "background: " + (config.primaryColor || "#166534"),
      "color: white",
      "border: none",
      "border-radius: 8px",
      "font-size: 16px",
      "font-weight: 600",
      "font-family: system-ui, -apple-system, sans-serif",
      "cursor: pointer",
      "transition: opacity 0.2s",
    ].join(";");

    btn.onmouseover = function () { btn.style.opacity = "0.9"; };
    btn.onmouseout = function () { btn.style.opacity = "1"; };

    btn.addEventListener("click", function () {
      openModal(config);
    });

    return btn;
  }

  function openModal(config) {
    var overlay = document.createElement("div");
    overlay.id = "fairwayfit-overlay";
    overlay.style.cssText = [
      "position: fixed",
      "inset: 0",
      "background: rgba(0,0,0,0.7)",
      "z-index: 999999",
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "padding: 16px",
    ].join(";");

    var modal = document.createElement("div");
    modal.style.cssText = [
      "background: white",
      "border-radius: 16px",
      "width: 100%",
      "max-width: 960px",
      "max-height: 90vh",
      "overflow: hidden",
      "position: relative",
      "display: flex",
      "flex-direction: column",
    ].join(";");

    var closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = [
      "position: absolute",
      "top: 12px",
      "right: 16px",
      "background: none",
      "border: none",
      "font-size: 28px",
      "cursor: pointer",
      "z-index: 1",
      "color: #666",
      "line-height: 1",
    ].join(";");
    closeBtn.addEventListener("click", function () {
      document.body.removeChild(overlay);
    });

    var iframe = buildIframe(config);
    iframe.style.height = "80vh";

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  }

  function resizeIframe(height) {
    var iframe = document.getElementById("fairwayfit-iframe");
    if (iframe) iframe.style.height = height + "px";
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== BASE_URL) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "FAIRWAYFIT_RESIZE") {
      resizeIframe(data.height);
    }
    if (data.type === "FAIRWAYFIT_COMPLETE") {
      document.dispatchEvent(new CustomEvent("fairwayfitComplete", { detail: data.payload }));
    }
  });

  function init() {
    var container = document.getElementById(containerId);
    if (!container) {
      console.warn("[FairwayFit AI] Container #" + containerId + " not found.");
      return;
    }

    loadConfig(function (err, config) {
      if (err) {
        console.error("[FairwayFit AI] Failed to load config:", err);
        return;
      }

      if (mode === "button") {
        container.appendChild(buildButton(config));
      } else {
        container.appendChild(buildIframe(config));
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
