import { loadTemplate } from "./loadTemplate.js";
import { fillTemplate, fillGlobals } from "./templating.js";


const API_URL="https://auditcom.onrender.com/api"



const urls = {
    pdfs: `${API_URL}/pdfs`,
    submit: `${API_URL}/submit`
}

const container = document.querySelector("#teamList");
const form = document.querySelector("#downloadForm");
const messageContainer = document.querySelector("#messageContainer");

const template = await loadTemplate("./templates/teamItem.html");
const messageTemplate = await loadTemplate("./templates/messageItem.html");

const response = await fetch(urls.pdfs);
const payload = await response.json();

// global metadata
fillGlobals({
  count: payload.count
});

// repeated items
const items = Array.isArray(payload.pdfs) ? payload.pdfs : [];

for (const p of items) {
  container.append(
    fillTemplate(template, {
      teamName: p.teamName ?? "—",
      title: p.title ?? "",
      uploadedAt: formatDate(p.uploadedAt)
    })

  );
}

function formatDate(s) {
  if (!s) return "";
  const iso = s.replace(" ", "T");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString();
}


function showMessage(message, type = "success") {
  // Clear previous messages
  messageContainer.innerHTML = "";
  
  // Create and display message
  const messageElement = fillTemplate(messageTemplate, {
    message: message,
    messageClass: type
  });
  
  messageContainer.appendChild(messageElement);
  
  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      messageContainer.innerHTML = "";
    }, 5000);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Clear any previous messages
  messageContainer.innerHTML = "";
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.newsletterAgreement = data.newsletterAgreement ? "true" : "false";
  console.log(data);
  
  try {
    const response = await fetch(urls.submit, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    // Handle PDF response
    if (!response.ok) {
      showMessage("le formulaire contient des champs invalides", "error");
      console.error("Error:", response.status, response.statusText);
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport-auditcom.pdf"; // You can customize the filename
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success message
    showMessage("PDF téléchargé avec succès !", "success");
    
  } catch (error) {
    showMessage("Le formulaire contient des champs invalides", "error");
    console.error("Error:", error);
  }
});

