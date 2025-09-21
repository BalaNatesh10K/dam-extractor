document.addEventListener("DOMContentLoaded", () => {
  let paths = [];
  const UNSUPPORTED_EXTENSIONS = ["gif", "svg", "ico", "webp"]; // editable

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: extractPaths,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          document.getElementById("output").value =
            "Error: " + chrome.runtime.lastError.message;
          return;
        }

        paths = results[0].result || [];
        const { supported, unsupported } = segregatePaths(paths);

        let outputText = "✅ Scene7 Supported Paths:\n";
        outputText += supported.join("\n") || "(none)";
        outputText += "\n\n❌ Unsupported Paths:\n";
        outputText += unsupported.join("\n") || "(none)";

        document.getElementById("output").value = outputText;

        console.log("Scene7 Supported Paths:", supported);
        console.log("Unsupported Paths:", unsupported);
      }
    );
  });

  // Copy to clipboard
  document.getElementById("copy").addEventListener("click", () => {
    if (paths.length === 0) return;

    const { supported, unsupported } = segregatePaths(paths);
    const textToCopy = [
      "✅ Scene7 Supported Paths:",
      ...supported,
      "\n❌ Unsupported Paths:",
      ...unsupported,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      showTooltip("Copied to clipboard!");
    });
  });

  // Save as .txt
  document.getElementById("save").addEventListener("click", () => {
    if (paths.length === 0) return;

    const { supported, unsupported } = segregatePaths(paths);
    const textToSave = [
      "✅ Scene7 Supported Paths:",
      ...supported,
      "\n❌ Unsupported Paths:",
      ...unsupported,
    ].join("\n");

    const blob = new Blob([textToSave], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dam-paths.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

// Tooltip display logic
function showTooltip(message) {
  const tooltip = document.getElementById("tooltip");
  tooltip.textContent = message;
  tooltip.style.display = "block";

  setTimeout(() => {
    tooltip.style.display = "none";
  }, 2000);
}

// Segregate Scene7 supported vs unsupported based on extensions
function segregatePaths(paths) {
  const UNSUPPORTED_EXTENSIONS = ["gif", "svg", "ico", "webp"]; // editable
  const supported = [];
  const unsupported = [];

  paths.forEach((path) => {
    const cleanPath = path.split("?")[0]; // remove query params
    const ext = cleanPath.split(".").pop().toLowerCase();
    if (UNSUPPORTED_EXTENSIONS.includes(ext)) {
      unsupported.push(path);
    } else {
      supported.push(path);
    }
  });

  return { supported, unsupported };
}

// This function runs in the page context
function extractPaths() {
  const elements = document.querySelectorAll("[src], [srcset]");
  const pathSet = new Set();

  elements.forEach((el) => {
    const src = el.getAttribute("src");
    const srcset = el.getAttribute("srcset");

    if (src && src.startsWith("/content/dam")) pathSet.add(src);

    if (srcset) {
      const sources = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      sources.forEach((path) => {
        if (path.startsWith("/content/dam")) pathSet.add(path);
      });
    }
  });

  return Array.from(pathSet);
}
