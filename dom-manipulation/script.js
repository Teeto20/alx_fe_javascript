const quoteDisplay = document.getElementById("quoteDisplay");
const newOne = document.getElementById("newQuote");
const btn = document.getElementsByTagName("button");
const quotes = [
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


const CreateAddQuoteForm = function () {
  
  let textInput = document.getElementById("newQuoteText");
  let categoryInput = document.getElementById("newQuoteCategory");
  
  let text = document.getElementById("newQuoteText").value;
  let category = document.getElementById("newQuoteCategory").value;

 console.log (text, category);
  if (text !== "" && category !== "") {
    quotes.push({text, category});
    alert("Quote added successfully!");
    console.log(quotes);
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please fill in both fields.");
  }
};
newOne.addEventListener("click", showRandomQuote);
btn.onclick = CreateAddQuoteForm();
