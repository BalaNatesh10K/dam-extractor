document.addEventListener("DOMContentLoaded", () => {
  let paths = [];
  const UNSUPPORTED_EXTENSIONS = ["gif", "svg", "ico", "webp"]; // editable
  const outputDiv = document.getElementById("output");

  // Execute script in active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              const pathSet = new Set();

              // Extract from src and srcset
              document.querySelectorAll("[src], [srcset]").forEach((el) => {
                const src = el.getAttribute("src");
                const srcset = el.getAttribute("srcset");

                if (src && src.startsWith("/content/dam")) pathSet.add(src);
                if (srcset) {
                  srcset
                    .split(",")
                    .map((s) => s.trim().split(" ")[0])
                    .forEach((p) => {
                      if (p.startsWith("/content/dam")) pathSet.add(p);
                    });
                }
              });

              // Also check document.images
              Array.from(document.images).forEach((img) => {
                if (img.src.startsWith("/content/dam")) pathSet.add(img.src);
              });

              resolve(Array.from(pathSet));
            }, 500); // delay to handle dynamic content
          });
        },
      },
      (results) => {
        if (chrome.runtime.lastError) {
          outputDiv.textContent =
            "Error: " + chrome.runtime.lastError.message;
          console.error(chrome.runtime.lastError.message);
          return;
        }

        paths = results[0].result || [];
        console.log("Raw /content/dam paths:", paths);
        displayPaths(paths);

        const { supported, unsupported } = segregatePaths(paths);
        console.log("Scene7 Supported Paths:", supported);
        console.log("Unsupported Paths:", unsupported);
      }
    );
  });

  // Copy to clipboard
  document.getElementById("copy").addEventListener("click", () => {
    if (!paths.length) return;

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
    if (!paths.length) return;

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

  // Tooltip display
  function showTooltip(message) {
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = message;
    tooltip.style.display = "block";
    setTimeout(() => { tooltip.style.display = "none"; }, 2000);
  }

  // Segregate supported vs unsupported
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

  // Display paths in popup div with colors
  function displayPaths(paths) {
    if (!paths || paths.length === 0) {
      outputDiv.textContent = "No paths found...";
      console.log("No /content/dam paths found on this page.");
      return;
    }

    const { supported, unsupported } = segregatePaths(paths);
    outputDiv.innerHTML = "";

    if (supported.length) {
      const header = document.createElement("div");
      header.innerHTML = "<strong>✅ Scene7 Supported Paths:</strong>";
      outputDiv.appendChild(header);
      supported.forEach((p) => {
        const div = document.createElement("div");
        div.className = "supported";
        div.textContent = p;
        outputDiv.appendChild(div);
      });
    }

    if (unsupported.length) {
      const header = document.createElement("div");
      header.innerHTML = "<strong>❌ Unsupported Paths:</strong>";
      outputDiv.appendChild(header);
      unsupported.forEach((p) => {
        const div = document.createElement("div");
        div.className = "unsupported";
        div.textContent = p;
        outputDiv.appendChild(div);
      });
    }
  }
});
