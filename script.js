/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
const PAGES = {
  SHOWS: 'shows',
  EPISODES: 'episodes',
};
let allEpisodes;
let currentPage = PAGES.SHOWS;
let allShows;
const rootElem = document.getElementById('root');
const searchBox = document.getElementById('search');
const searchCount = document.getElementById('search-count');
const goBack = document.getElementById('goback');
let currShowID;

const handleError = (err) => {
  console.error(err);
  return new Response(JSON.stringify({
    code: 400,
    message: 'Some network Error',
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

const search = (e, searchById) => {
  let filteredEpisodes;
  let filteredShows;
  const query = e.target.value.toLowerCase();

  if (currentPage === PAGES.EPISODES) {
    // Search all episodes (if searchById is provided then we should seach by ID)
    if (searchById && e.target.value !== 'All') {
      filteredEpisodes = allEpisodes.filter(({ id }) => id === parseInt(e.target.value));
    } else if (!searchById) {
      // Get the search query and lowercase it
      filteredEpisodes = allEpisodes.filter(({ name, summary }) => name.toLowerCase().includes(query) || summary.toLowerCase().includes(query));
    }
    // Render filtered
    renderEpisodes(filteredEpisodes);
  } else {
    filteredShows = allShows.filter(({ name, summary, genres }) => name.toLowerCase().includes(query) || summary.toLowerCase().includes(query) || genres.some((genre) => genre.toLowerCase().includes(query)));
    renderShows(filteredShows);
  }
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

  selectEl.addEventListener('change', (e) => search(e, true));

  // insert the select element before searchbox
  document.querySelector('header').insertBefore(selectEl, document.querySelector('.search-form'));
};

const createShowsSelect = () => {
  const selectEl = document.createElement('select');
  selectEl.classList.add('show-selector');

  // Create Default option
  const defaultOption = document.createElement('option');
  defaultOption.innerText = 'All Shows';
  defaultOption.value = 'All';
  selectEl.appendChild(defaultOption);

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

  selectEl.addEventListener('change', (e) => selectShow(null, e.target.value));

  // insert the select element before searchbox
  document.querySelector('header').insertBefore(selectEl, document.querySelector('.search-form'));
};

const sortObj = (obj) => obj.sort((a, b) => (a.name >= b.name ? 1 : -1));

const selectShow = (e, showID = 82) => {
  if (showID === 'All') {
    currShowID = 'All';
    showsPage();
    return;
  }
  showID = parseInt(showID);

  // Adapt searchbox for episodes
  searchBox.value = '';
  searchBox.setAttribute('placeholder', 'Search Episodes...');
  currShowID = showID;
  currentPage = PAGES.EPISODES;
  goBack.classList.remove('hidden');

  if (document.querySelector('.episode-selector')) {
    document.querySelector('.episode-selector').remove();
  }
  if (document.querySelector('.show-selector')) {
    document.querySelector('.show-selector').remove();
  }
  createShowsSelect();
  getAllEpisodesFromAPI().then((data) => {
    allEpisodes = data;
    renderEpisodes(allEpisodes);
    createEpisodesSelect();
  });
};

const createRatingEl = (key, value) => {
  const ratingEl = document.createElement('li');
  const strongEl = document.createElement('strong');
  strongEl.innerText = `${key}: `;
  ratingEl.appendChild(strongEl);
  ratingEl.appendChild(document.createTextNode(value));
  return ratingEl;
};

const createShowEl = ({
  name, id, image, rating, genres, status, runtime, summary,
}) => {
  // Create a box
  const showEl = document.createElement('li');
  showEl.classList.add('show');
  showEl.setAttribute('show-id', id);

  // Create Episode Title
  const titleEl = document.createElement('h2');
  titleEl.innerText = name;

  // Create box with 3 columns (img | description | details)
  const boxEl = document.createElement('div');
  boxEl.classList.add('show-details');

  // Create image element
  const imgEl = document.createElement('img');
  const src = image ? image.medium : '/img/not_found.jpg';
  imgEl.setAttribute('src', src);
  boxEl.appendChild(imgEl);

  // Create description
  const descriptionEl = document.createElement('span');
  descriptionEl.innerHTML = summary;
  boxEl.appendChild(descriptionEl);

  // Create details
  const detailsEl = document.createElement('ul');
  detailsEl.appendChild(createRatingEl('Rated', rating.average));
  detailsEl.appendChild(createRatingEl('Genres', genres.join(' | ')));
  detailsEl.appendChild(createRatingEl('Status', status));
  detailsEl.appendChild(createRatingEl('Runtime', runtime));
  boxEl.appendChild(detailsEl);

  // Add Everything together
  showEl.appendChild(titleEl);
  showEl.appendChild(boxEl);

  // Add click action to display episisodes
  showEl.addEventListener('click', (e) => selectShow(e, id));

  return showEl;
};

const renderShows = (shows = allShows) => {
  // Create container
  const listEl = document.createElement('ul');
  listEl.classList.add('shows-container');

  // Add shows
  shows.forEach((show) => listEl.appendChild(createShowEl(show)));

  // Render the container with children
  rootElem.innerHTML = '';
  rootElem.appendChild(listEl);

  // Display search count if search used
  if (shows.length !== allShows.length) {
    searchCount.innerText = `Displaying ${shows.length}/${allShows.length} shows`;
  } else {
    searchCount.innerText = '';
  }

  goBack.addEventListener('click', () => {
    currShowID = 'All';
    showsPage();
  });
};

const showsPage = () => {
  goBack.classList.add('hidden');
  if (document.querySelector('.episode-selector')) {
    document.querySelector('.episode-selector').remove();
  }
  searchBox.addEventListener('input', search);
  searchBox.setAttribute('placeholder', 'Search Shows...');
  currentPage = PAGES.SHOWS;
  allShows = sortObj(getAllShows());
  if (document.querySelector('.show-selector')) {
    document.querySelector('.show-selector').remove();
  }
  createShowsSelect();
  renderShows(allShows);
};
window.onload = showsPage;
