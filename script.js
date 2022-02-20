/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
let allEpisodes;
let allShows;
const rootElem = document.getElementById('root');
const searchBox = document.getElementById('search');
const searchCount = document.getElementById('search-count');
let currShowID = 82;

const handleError = (err) => {
  console.error(err);
  return new Response(JSON.stringify({
    code: 400,
    message: 'Stupid network Error',
  }));
};

const getAllEpisodesFromAPI = async (showID = currShowID) => {
  let res = await (fetch(`https://api.tvmaze.com/shows/${showID}/episodes`).catch(handleError));
  if (res.ok) {
    res = await res.json();
    return res;
  }
  return Promise.reject(response);
};

// Function to format season and episode numbers (S01E01)
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
  const src = image ? image.medium : '/img/not_found.jpg';
  imgEl.setAttribute('src', src);

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
  let filteredEpisodes = allEpisodes;

  // Search all episodes (if searchById is provided then we should seach by ID)
  if (searchById && e.target.value !== 'All') {
    filteredEpisodes = allEpisodes.filter(({ id }) => id === parseInt(e.target.value));
  } else {
    // Get the search query and lowercase it
    const query = e.target.value.toLowerCase();
    filteredEpisodes = allEpisodes.filter(({ name, summary }) => name.toLowerCase().includes(query) || summary.toLowerCase().includes(query));
  }

  // Render filtered
  renderEpisodes(filteredEpisodes);
};

const createEpisodesSelect = () => {
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

const createShowsSelect = () => {
  const selectEl = document.createElement('select');
  selectEl.classList.add('show-selector');

  // Append all options for shows
  allShows.forEach(({ id, name }) => {
    const optionEl = document.createElement('option');
    if (id === currShowID) {
      optionEl.setAttribute('selected', true);
    }
    optionEl.innerText = name;
    optionEl.value = id;
    selectEl.appendChild(optionEl);
  });
  // Add event listener to search by ID

  selectEl.addEventListener('change', (e) => setup(null, e.target.value));

  // insert the select element before searchbox
  document.querySelector('header').insertBefore(selectEl, document.querySelector('.search-form'));
};

const sortObj = (obj) => obj.sort((a, b) => (a.name >= b.name ? 1 : -1));

const setup = (e, showID = 82) => {
  searchBox.value = '';
  allShows = sortObj(getAllShows());
  if (document.querySelector('.episode-selector')) {
    document.querySelector('.episode-selector').remove();
  }
  if (!document.querySelector('.show-selector')) {
    createShowsSelect();
  }
  currShowID = showID;
  getAllEpisodesFromAPI().then((data) => {
    allEpisodes = data;
    renderEpisodes(allEpisodes);
    searchBox.addEventListener('input', searchEpisodes);
    createEpisodesSelect();
  });
};

window.onload = setup;
