const quoteDisplay = document.getElementById("quoteDisplay");
const newOne = document.getElementById("newQuote");

const quotes = JSON.parse(localStorage.getItem("quotes")) || [
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
});

document.body.appendChild(exportBtn);

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

document.body.appendChild(importInput);
