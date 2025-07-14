document.getElementById("formalizerBtn").addEventListener("click", () => {
  document.getElementById("formalizerTool").scrollIntoView({ behavior: 'smooth' });
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  const text = document.getElementById("inputText").value.trim();
  const conversion = document.getElementById("conversion").value;
  const spiciness = parseInt(document.getElementById("spiciness").value);
  const outputEl = document.getElementById("output");
  const outputContainer = document.getElementById("outputContainer");

  if (!text) {
    outputEl.textContent = "Please enter some text.";
    outputContainer.classList.remove("hidden");
    return;
  }

  outputEl.textContent = "Converting...";
  outputContainer.classList.remove("hidden");

  try {
    const response = await fetch("https://goblin.tools/api/Formalizer", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Origin": "https://goblin.tools",
        "Referer": "https://goblin.tools/Formalizer"
      },
      body: JSON.stringify({
        Text: text,
        Conversion: conversion,
        Spiciness: spiciness
      })
    });

    if (!response.ok) throw new Error("API Error: " + response.status);

    const result = await response.text();
    outputEl.textContent = result;
  } catch (err) {
    outputEl.textContent = "Error: " + err.message;
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const outputText = document.getElementById("output").textContent;

  navigator.clipboard.writeText(outputText).then(() => {
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
    }, 2000);
  });
});
