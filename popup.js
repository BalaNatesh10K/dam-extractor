document.addEventListener("DOMContentLoaded", () => {
  let paths = [];
  const UNSUPPORTED_EXTENSIONS = ["gif", "svg", "ico", "webp"]; // editable

  const outputDiv = document.getElementById("output");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      { target: { tabId: tabs[0].id }, function: extractPaths },
      (results) => {
        if (chrome.runtime.lastError) {
          outputDiv.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
        }

        paths = results[0].result || [];
        displayPaths(paths);
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

    navigator.clipboard.writeText(textToCopy).then(() => showTooltip("Copied to clipboard!"));
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

  function displayPaths(paths) {
    const { supported, unsupported } = segregatePaths(paths);

    outputDiv.innerHTML = ""; // clear previous content

    if (supported.length) {
      outputDiv.innerHTML += "<strong>✅ Scene7 Supported Paths:</strong>\n";
      supported.forEach(p => {
        const div = document.createElement("div");
        div.className = "supported";
        div.textContent = p;
        outputDiv.appendChild(div);
      });
    }

    if (unsupported.length) {
      outputDiv.innerHTML += "<strong>❌ Unsupported Paths:</strong>\n";
      unsupported.forEach(p => {
        const div = document.createElement("div");
        div.className = "unsupported";
        div.textContent = p;
        outputDiv.appendChild(div);
      });
    }

    console.log("Scene7 Supported Paths:", supported);
    console.log("Unsupported Paths:", unsupported);
  }

  function showTooltip(message) {
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = message;
    tooltip.style.display = "block";
    setTimeout(() => { tooltip.style.display = "none"; }, 2000);
  }

  function segregatePaths(paths) {
    const supported = [];
    const unsupported = [];
    paths.forEach((path) => {
      const cleanPath = path.split("?")[0];
      const ext = cleanPath.split(".").pop().toLowerCase();
      if (UNSUPPORTED_EXTENSIONS.includes(ext)) {
        unsupported.push(path);
      } else {
        supported.push(path);
      }
    });
    return { supported, unsupported };
  }

  function extractPaths() {
    const elements = document.querySelectorAll("[src], [srcset]");
    const pathSet = new Set();
    elements.forEach((el) => {
      const src = el.getAttribute("src");
      const srcset = el.getAttribute("srcset");

      if (src && src.startsWith("/content/dam")) pathSet.add(src);
      if (srcset) {
        srcset.split(",").map(s => s.trim().split(" ")[0]).forEach(path => {
          if (path.startsWith("/content/dam")) pathSet.add(path);
        });
      }
    });
    return Array.from(pathSet);
  }
});
