/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
let allEpisodes;
const APIURL = 'https://api.tvmaze.com/shows/82/episodes';
const rootElem = document.getElementById('root');
const searchBox = document.getElementById('search');
const searchCount = document.getElementById('search-count');

const seasonAndEpisode = (season, episode) => {
  season = season.toString().padStart(2, '0');
  episode = episode.toString().padStart(2, '0');
  return `S${season}E${episode}`;
};

const createEpisodeEl = ({
  name, season, number, image, summary, id,
}) => {
  // Create a box
  const episodeEl = document.createElement('li');
  episodeEl.classList.add('episode');
  episodeEl.setAttribute('episode-id', id);

  // Create Episode Title
  const titleEl = document.createElement('h3');
  titleEl.innerText = `${name} - ${seasonAndEpisode(season, number)}`;

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

const searchEpisodes = (e, searchById) => {
  let filteredEpisodes;

  // Search all episodes (if searchById is provided then we should seach by ID)
  if (searchById && e.target.value !== 'All') {
    filteredEpisodes = allEpisodes.filter(({ id }) => id === parseInt(e.target.value));
  } else if (!searchById) {
    // Get the search query and lowercase it
    const query = e.target.value.toLowerCase();
    filteredEpisodes = allEpisodes.filter(({ name, summary }) => name.toLowerCase().includes(query) || summary.toLowerCase().includes(query));
  }

  // Render filtered
  renderEpisodes(filteredEpisodes);
};

const createSelect = () => {
  const selectEl = document.createElement('select');
  selectEl.classList.add('episode-selector');

  // Create Default option
  const defaultOption = document.createElement('option');
  defaultOption.innerText = 'Select Episode';
  defaultOption.value = 'All';
  selectEl.appendChild(defaultOption);

  // Append all options for episodes
  allEpisodes.forEach(({
    id, name, number, season,
  }) => {
    const optionEl = document.createElement('option');
    optionEl.innerText = `${seasonAndEpisode(season, number)} - ${name}`;
    optionEl.value = id;
    selectEl.appendChild(optionEl);
  });
  // Add event listener to search by ID

  selectEl.addEventListener('change', (e) => searchEpisodes(e, true));

  // insert the select element before searchbox
  document.querySelector('header').insertBefore(selectEl, document.querySelector('.search-form'));
};

const getAllEpisodesFromAPI = async () => fetch(APIURL).then((res) => res.json()).then((data) => data);

const setup = async () => {
  allEpisodes = await getAllEpisodesFromAPI();
  renderEpisodes();
  searchBox.addEventListener('input', searchEpisodes);
  createSelect();
};

window.onload = setup;
