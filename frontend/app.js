const form = document.getElementById("shorten-form");
const resultBox = document.getElementById("result-box");
const shortUrlResult = document.getElementById("shortUrlResult");
const copyBtn = document.getElementById("copy-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const longUrl = document.getElementById("longUrl").value;

  try {
    const response = await fetch("/api/v1/urls/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ longUrl }),
    });

    const data = await response.json();

    if (response.ok) {
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

copyBtn.addEventListener("click", () => {
  shortUrlResult.select();
  document.execCommand("copy");

  copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;

  copyBtn.classList.replace("bg-slate-700", "bg-emerald-600");

  setTimeout(() => {
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> <span>Copy</span>`;

    copyBtn.classList.replace("bg-emerald-600", "bg-slate-700");
  }, 2000);
});
