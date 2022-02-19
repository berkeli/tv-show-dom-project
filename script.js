/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
let allEpisodes;
const rootElem = document.getElementById('root');
const searchBox = document.getElementById('search');
const searchCount = document.getElementById('search-count');

const createEpisodeEl = ({
  name, season, number, image, summary, id,
}) => {
  // Create a box
  const episodeEl = document.createElement('li');
  episodeEl.classList.add('episode');
  episodeEl.setAttribute('episode-id', id);

  // Create Episode Title
  const titleEl = document.createElement('h3');
  season = season.toString().padStart(2, '0');
  number = number.toString().padStart(2, '0');
  titleEl.innerText = `${name} - S${season}E${number}`;

  // Create image element
  const imgEl = document.createElement('img');
  imgEl.setAttribute('src', image.medium);

  // Create description
  const descriptionEl = document.createElement('span');
  descriptionEl.innerHTML = summary;

  // Add Everything together
  episodeEl.appendChild(titleEl);
  episodeEl.appendChild(imgEl);
  episodeEl.appendChild(descriptionEl);

  return episodeEl;
};

const renderEpisodes = (episodes = allEpisodes) => {
  // Create container
  const listEl = document.createElement('ul');
  listEl.classList.add('episodes-container');

  // Add episodes
  episodes.forEach((episode) => listEl.appendChild(createEpisodeEl(episode)));

  // Render the container with children
  rootElem.innerHTML = '';
  rootElem.appendChild(listEl);

  // Display search count if search used
  if (episodes.length !== allEpisodes.length) {
    searchCount.innerText = `Displaying ${episodes.length}/${allEpisodes.length} episodes`;
  } else {
    searchCount.innerText = '';
  }
};

const searchEpisodes = (e) => {
  // Get the search query and lowercase it
  const query = e.target.value.toLowerCase();

  // Search all episodes
  const filteredEpisodes = allEpisodes.filter(({ name, summary }) => name.toLowerCase().includes(query) || summary.toLowerCase().includes(query));

  // Render filtered
  renderEpisodes(filteredEpisodes);
};

const setup = () => {
  allEpisodes = getAllEpisodes();
  renderEpisodes();
  searchBox.addEventListener('input', searchEpisodes);
};

window.onload = setup;
