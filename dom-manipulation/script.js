const quoteDisplay = document.getElementById("quoteDisplay");
const newOne = document.getElementById("newQuote");

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    category: "Motivational",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    category: "Inspirational",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

let lastQuoteIndex = -1;
const showRandomQuote = function () {
  if (quotes.length === 0) {
    quoteContainer.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * quotes.length);
  } while (quotes.length > 1 && randomIndex === lastQuoteIndex); // avoid repeat if possible

  lastQuoteIndex = randomIndex;
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
   <p><strong>Quote:</strong> ${quote.text}</p>
   <p><em>Category:</em> ${quote.category}</p> 
 `;
};

const createAddQuoteForm = function () {
  const formContainer = document.getElementById("form-container");
  const form = document.createElement("form");

  form.innerHTML = `
    <div>
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input
        id="newQuoteCategory"
        type="text"
        placeholder="Enter quote category"
      />
       <button onclick="addQuote()">Add Quote</button>
    </div>
`;
  formContainer.appendChild(form);
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // ⛔ Stops page reload

    // Now safely add the quote
  });
};

createAddQuoteForm();

function addQuote() {
  let textInput = document.getElementById("newQuoteText");
  let categoryInput = document.getElementById("newQuoteCategory");

  let text = textInput.value.trim();
  let category = categoryInput.value.trim();

  console.log(text, category);
  if (textInput.value !== "" && categoryInput.value !== "") {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // update dropdown
    filterQuotes();
    postQuoteToServer({ text, category });
    alert("Quote added successfully!");
    console.log(quotes);
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please fill in both fields.");
  }
}
newOne.addEventListener("click", showRandomQuote);

const exportBtn = document.getElementById("exportBtn");
exportBtn.addEventListener("click", function () {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert("quotes exported successfully");
});

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}
const filterQuotes = function () {
  const catFilter = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", catFilter);
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";
  let filtered = [];
  if (catFilter === "All Categories") {
    filtered = quotes;
  } else {
    filtered = quotes.filter((q) => q.category === catFilter);
  }
  if (filtered.length === 0) {
    display.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }
  filtered.forEach((quote) => {
    const quoteEl = document.createElement("div");
    quoteEl.innerHTML = `<p><strong>Quote:</strong> "${quote.text}"</p><em>Category:</em> ${quote.category}<hr>`;
    display.appendChild(quoteEl);
  });
};
const populateCategories = function () {
  const categorySet = new Set(quotes.map((q) => q.category));
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="all">All Categories</option>';

  categorySet.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && [...categorySet].includes(savedCategory)) {
    select.value = savedCategory;
    filterQuotes();
  }
};
populateCategories();

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );
    const data = await response.json();
    // Map the data into our quote format
    const apiQuotes = data.map((post) => ({
      text: post.title,
      category: "API",
    }));

    // Merge them with local quotes
    quotes = [...apiQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (error) {
    console.error("API Fetch Error:", error);
  }
}

setInterval(fetchQuotesFromServer, 10000); // every 10 seconds

function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: quote.text,
      body: quote.category,
      userId: 1,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Posted to server:", data))
    .catch((error) => console.error("POST error:", error));
}

function syncQuotes() {
  fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
    .then((response) => response.json())
    .then((serverData) => {
      // Convert server posts to quote format
      const serverQuotes = serverData.map((post) => ({
        id: post.id,
        text: post.title,
        category: "API",
      }));

      // Load current local quotes
      let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

      // Remove local quotes with same id/text as server ones (conflict resolution)
      const updatedQuotes = localQuotes.filter((local) => {
        return !serverQuotes.some(
          (server) =>
            server.id && (local.id === server.id || local.text === server.text)
        );
      });

      // Merge and save (server quotes take priority)
      const mergedQuotes = [...serverQuotes, ...updatedQuotes];
      localStorage.setItem("quotes", JSON.stringify(mergedQuotes));

      // Update global array + UI
      quotes = mergedQuotes;
      populateCategories();
      filterQuotes();

      console.log("Quotes synchronized with server.");

      let resolvedQuotes = [...localQuotes];
      let conflictCount = 0;

      serverQuotes.forEach((serverQuote) => {
        const index = localQuotes.findIndex(
          (local) =>
            local.text === serverQuote.text || local.id === serverQuote.id
        );

        if (index !== -1) {
          // Conflict detected
          conflictCount++;

          // Manual conflict resolution UI
          const useServer = confirm(
            `Conflict detected:\n\nLocal: "${localQuotes[index].text}"\nServer: "${serverQuote.text}"\n\nUse SERVER version?`
          );

          if (useServer) {
            resolvedQuotes[index] = serverQuote;
          }
          // else keep local
        } else {
          // No conflict, just add
          resolvedQuotes.push(serverQuote);
        }
      });

      quotes = resolvedQuotes;
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();

      if (conflictCount > 0) {
        showNotification(`${conflictCount} conflict(s) resolved`, "orange");
      } else {
        showNotification("Quotes synced with server!", "green");
      }
    })
    .catch((error) => {
      console.error("Failed to fetch server quotes:", error);
      showNotification("Failed to sync quotes", "red");
    });
}

// 🔁 Auto-sync with server every 30 seconds
syncQuotes(); // Initial sync
setInterval(syncQuotes, 30000);

function showNotification(message, color = "green") {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.style.background = color;
  note.style.display = "block";

  // Auto-hide after 3 seconds
  setTimeout(() => {
    note.style.display = "none";
  }, 3000);
}
