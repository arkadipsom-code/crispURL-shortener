const form = document.getElementById("shorten-form");
const resultBox = document.getElementById("result-box");
const shortUrlResult = document.getElementById("shortUrlResult");
const copyBtn = document.getElementById("copy-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const longUrl = document.getElementById("longUrl").value;

  try {
    // Hit our backend creation endpoint
    const response = await fetch("/api/v1/urls/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ longUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      // Reveal the result box and insert the generated link
      shortUrlResult.value = data.shortUrl;
      resultBox.classList.remove("hidden");
    } else {
      alert(`Error: ${data.error || "Something went wrong"}`);
    }
  } catch (error) {
    console.error("Frontend Error:", error);
    alert("Failed to connect to the backend server.");
  }
});

// Copy Button Logic with FontAwesome Icon Support
copyBtn.addEventListener("click", () => {
  // Select and copy the text inside the input field
  shortUrlResult.select();
  document.execCommand("copy");

  // 1. Swap text and add the checkmark icon
  copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;

  // 2. Turn the button green using Tailwind color utilities
  copyBtn.classList.replace("bg-slate-700", "bg-emerald-600");

  // Reset the button back to its default look after 2 seconds
  setTimeout(() => {
    // 3. Revert back to the copy icon and text
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> <span>Copy</span>`;

    // 4. Swap the color back to original slate gray
    copyBtn.classList.replace("bg-emerald-600", "bg-slate-700");
  }, 2000);
});
