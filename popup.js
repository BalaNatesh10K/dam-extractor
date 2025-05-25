document.addEventListener("DOMContentLoaded", () => {
  let paths = [];

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
        document.getElementById("output").value = paths.join("\n");
      }
    );
  });

  // Copy to clipboard
  document.getElementById("copy").addEventListener("click", () => {
    if (paths.length === 0) return;

    navigator.clipboard.writeText(paths.join("\n")).then(() => {
      showTooltip("Copied to clipboard!");
    });
  });

  // Save as .txt
  document.getElementById("save").addEventListener("click", () => {
    if (paths.length === 0) return;

    const blob = new Blob([paths.join("\n")], { type: "text/plain" });
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

  const uniquePaths = Array.from(pathSet);
  console.log("Extracted /content/dam paths:");
  console.table(uniquePaths);
  return uniquePaths;
}
