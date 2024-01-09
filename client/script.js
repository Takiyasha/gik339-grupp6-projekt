let currentEditingId = null;

async function fetchMovies() {
  try {
    const response = await fetch("http://localhost:3000/movies");
    const movies = await response.json();
    displayMovies(movies);
  } catch (error) {
    console.error("Fel vid hämtning av filmer:", error);
  }
}

function displayMovies(movies) {
  const listContainer = document.getElementById("movies-list");
  listContainer.innerHTML = ""; // Rensa befintlig lista

  movies.forEach((movie, index) => {
    const colorIndex = index % borderColors.length; // Detta ser till att färgerna loopar om när de tar slut
    const listItem = document.createElement("div");
    listItem.className = "movie-item bg-white shadow-md rounded p-4 mb-4";
    listItem.style.borderColor = borderColors[colorIndex]; // Använd färgen från vår array
    listItem.innerHTML = `
      <h3 class="font-bold text-lg">${movie.title}</h3>
      <p class="text-gray-700">Regissör: ${movie.director}</p>
      <p class="text-gray-700">Utgivningsår: ${movie.releaseYear}</p>
      <p class="text-gray-700">Genre: ${movie.genre}</p>
      <button class="edit-button bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline" onclick="onEditButtonClick(${movie.id})">
          Redigera
      </button>
      <button class="delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded foc us:outline-none focus:shadow-outline" onclick="onDeleteButtonClick(${movie.id})">
          Ta bort
      </button>
    `;
    listContainer.appendChild(listItem);
  });
}

document.getElementById("movie-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const director = document.getElementById("director").value.trim();
  const releaseYear = document.getElementById("releaseYear").value.trim();
  const genre = document.getElementById("genre").value.trim();

  // Grundläggande validering för att se till att alla fält är ifyllda
  if (!title || !director || !releaseYear || !genre) {
    alert("fyll i alla fält först :-)");
    return;
  }

  const movieData = { title, director, releaseYear, genre };

  const method = currentEditingId ? "PUT" : "POST";
  const url = currentEditingId
    ? `http://localhost:3000/movies/${currentEditingId}`
    : "http://localhost:3000/movies";

  try {
    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });

    document.getElementById("movie-form").reset();
    currentEditingId = null;
    fetchMovies();
  } catch (error) {
    console.error("Fel vid tillägg/uppdatering av film:", error);
  }
});

async function onEditButtonClick(movieId) {
  currentEditingId = movieId;
  try {
    const response = await fetch(`http://localhost:3000/movies/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const movie = await response.json();
    document.getElementById("title").value = movie.title;
    document.getElementById("director").value = movie.director;
    document.getElementById("releaseYear").value = movie.releaseYear;
    document.getElementById("genre").value = movie.genre;
    window.scrollTo(0, 0); // Scrolla till toppen av sidan
  } catch (error) {
    console.error("Fel vid hämtning av film för redigering:", error);
    alert("Ett fel inträffade vid hämtning av filmdata.");
  }
}

async function onDeleteButtonClick(movieId) {
  if (confirm("Är du säker på att du vill ta bort filmen?")) {
    try {
      const response = await fetch(`http://localhost:3000/movies/${movieId}`, {
        method: "DELETE",
      });
      console.log(movieId);
      if (!response.ok) {
        // Logga felmeddelandet om svaret inte är OK (t.ex. 200 statuskod)
        const message = await response.text();
        throw new Error(
          `Servern svarade med felstatus: ${response.status}. Meddelande: ${message}`
        );
      }
      console.log("Film borttagen");
      fetchMovies(); // Uppdatera listan
    } catch (error) {
      console.error("Fel vid borttagning av film:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchMovies);

function generateRandomColor() {
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  console.log("Generated random color:", randomColor);
  return randomColor;
}

function updateGlow() {
  const form = document.querySelector("form");
  const newColor = generateRandomColor();
  form.style.boxShadow = `0 0 10px 5px ${newColor}`;
  console.log("Updated form glow with new color"); // Log glow update
}

setInterval(updateGlow, 1100);
console.log("Set interval for updating form glow");

////// BOARDER STYLING ////////
const borderColors = [
  "#FFADAD",
  "#FFD6A5",
  "#FDFFB6",
  "#CAFFBF",
  "#9BF6FF",
  "#A0C4FF",
  "#BDB2FF",
  "#FFC6FF",
]; // Lägg till fler färger
