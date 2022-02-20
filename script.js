/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/*
type userShows = {
  id: { favourite: boolean, notes: string}
}
*/
let userShows = JSON.parse(localStorage.getItem('userShows'));
if (!userShows) {
  userShows = {};
}
const PAGES = {
  SHOWS: 'shows',
  EPISODES: 'episodes',
};

let allEpisodes;
let currentPage = PAGES.SHOWS;
let allShows;
let perPage = 4;
let currPageNum = 1;
let showsChunk;
let episodesChunk;
const sortBy = {
  key: 'name',
  direction: 1,
};
let toObserve;
const rootElem = document.getElementById('root');
const searchBox = document.getElementById('search');
const searchCount = document.getElementById('search-count');
const goBack = document.getElementById('goback');
let currShowID;
const showDescLen = 200;
const episodeDescLen = 100;

const stripHTML = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
};

const truncDesc = (text, length) => {
  const descEl = document.createElement('p');
  if (stripHTML(text).length <= length) {
    descEl.innerHTML = text;
    return descEl;
  }
  descEl.innerText = `${stripHTML(text).substring(0, length)}...`;

  const readMoreEl = document.createElement('a');
  readMoreEl.innerText = 'Read More';
  readMoreEl.setAttribute('href', '#');
  readMoreEl.addEventListener('click', (event) => {
    event.preventDefault();
    descEl.innerHTML = text;
  });
  descEl.appendChild(readMoreEl);
  return descEl;
};

const favButton = (ID) => {
  if (!userShows[ID]) {
    userShows[ID] = {};
  }
  const button = document.createElement('button');
  button.classList.add('button');
  button.classList.toggle('favourited', !!userShows[ID].favourite);
  button.innerText = userShows[ID].favourite ? '❤ In Your Favourites ❤' : '🖤 Favourite';
  button.addEventListener('click', (e) => {
    userShows[ID].favourite = !userShows[ID].favourite;
    e.target.innerText = userShows[ID].favourite ? '❤ In Your Favourites ❤' : '🖤 Favourite';
    localStorage.setItem('userShows', JSON.stringify(userShows));
    button.classList.toggle('favourited', !!userShows[ID].favourite);
  });
  return button;
};

const editNotesHandler = (e, inputNotes, ID) => {
  const action = e.target.value;
  if (action === 'Save Notes') {
    userShows[ID].notes = inputNotes.value;
    localStorage.setItem('userShows', JSON.stringify(userShows));
    inputNotes.classList.toggle('hidden');
    e.target.value = userShows[ID].notes ? 'Edit Notes' : 'Add Notes';
    e.target.innerText = userShows[ID].notes ? 'Edit Notes' : 'Add Notes';
  } else if (action !== 'Close') {
    inputNotes.classList.toggle('hidden');
    e.target.value = 'Close';
    e.target.innerText = 'Close';
  } else {
    inputNotes.classList.toggle('hidden');
    e.target.value = userShows[ID].notes ? 'Edit Notes' : 'Add Notes';
    e.target.innerText = userShows[ID].notes ? 'Edit Notes' : 'Add Notes';
  }
};

const editAddNotes = (ID) => {
  if (!userShows[ID]) {
    userShows[ID] = {};
  }
  const buttonBox = document.createElement('div');
  buttonBox.classList.add('notes-box');

  const inputNotes = document.createElement('textarea');
  inputNotes.classList.add('hidden');
  inputNotes.value = userShows[ID].notes || '';

  const button = document.createElement('button');
  inputNotes.addEventListener('input', () => {
    button.value = 'Save Notes';
    button.innerText = 'Save Notes';
  });
  button.classList.add('button');
  button.innerText = userShows[ID].notes ? 'Edit Notes' : 'Add Notes';
  button.addEventListener('click', (e) => editNotesHandler(e, inputNotes, ID));
  buttonBox.appendChild(inputNotes);
  buttonBox.appendChild(button);
  return buttonBox;
};

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    if (currentPage === PAGES.SHOWS) {
      showsChunk = allShows.slice(currPageNum * perPage, (currPageNum + 1) * perPage);
      currPageNum++;
      renderShows(showsChunk, true);
    } else {
      episodesChunk = allEpisodes.slice(currPageNum * perPage, (currPageNum + 1) * perPage);
      currPageNum++;
      renderEpisodes(episodesChunk, true);
    }
  }
});

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
  descriptionEl.appendChild(truncDesc(summary, episodeDescLen));

  // Add Everything together
  episodeEl.appendChild(titleEl);
  episodeEl.appendChild(imgEl);
  episodeEl.appendChild(descriptionEl);

  // Create add notes section
  episodeEl.appendChild(editAddNotes(id));
  toObserve = episodeEl;
  return episodeEl;
};

const renderEpisodes = (episodes = allEpisodes, append) => {
  if (append) {
    const listEl = document.querySelector('.episodes-container');
    episodes.forEach((episode) => listEl.appendChild(createEpisodeEl(episode)));
    observer.observe(toObserve);
    return;
  }

  // Create container
  const listEl = document.createElement('ul');
  listEl.classList.add('episodes-container');

  // Add episodes
  episodes.forEach((episode) => listEl.appendChild(createEpisodeEl(episode)));

  observer.observe(toObserve);

  // Render the container with children
  rootElem.innerHTML = '';
  rootElem.appendChild(listEl);

  // Display search count if search used
  if (episodes.length !== allEpisodes.length && searchBox.value) {
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

const sortObj = (a, b) => {
  if (sortBy.key === 'name') return (a.name >= b.name ? sortBy.direction : -sortBy.direction);
  return (a.rating.average >= b.rating.average ? sortBy.direction : -sortBy.direction);
};

const selectShow = (e, showID = 82) => {
  if (showID === 'All') {
    currShowID = 'All';
    showsPage();
    return;
  }
  showID = parseInt(showID);
  currPageNum = 1;
  perPage = 20;
  // Adapt searchbox for episodes
  searchBox.value = '';
  searchBox.setAttribute('placeholder', 'Search Episodes...');
  currShowID = showID;
  currentPage = PAGES.EPISODES;
  goBack.classList.remove('hidden');

  if (document.querySelector('.sort-selector')) {
    document.querySelector('.sort-selector').remove();
  }
  if (document.querySelector('.episode-selector')) {
    document.querySelector('.episode-selector').remove();
  }
  if (document.querySelector('.show-selector')) {
    document.querySelector('.show-selector').remove();
  }
  createShowsSelect();
  getAllEpisodesFromAPI().then((data) => {
    allEpisodes = data;
    episodesChunk = allEpisodes.slice(0, perPage * currPageNum);
    renderEpisodes(episodesChunk);
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
  // Create a list item
  const showEl = document.createElement('li');
  showEl.classList.add('show');
  showEl.setAttribute('show-id', id);

  // Create Episode Title
  const titleEl = document.createElement('h2');
  titleEl.innerText = name;
  titleEl.addEventListener('click', (e) => selectShow(e, id));

  // Create box with 3 columns (img | description | details)
  const boxEl = document.createElement('div');
  boxEl.classList.add('show-details');

  // Create image element
  const imgEl = document.createElement('img');
  const src = image ? image.medium : '/img/not_found.jpg';
  imgEl.addEventListener('click', (e) => selectShow(e, id));
  imgEl.setAttribute('src', src);
  boxEl.appendChild(imgEl);

  // Create description
  const descriptionEl = document.createElement('span');
  descriptionEl.appendChild(truncDesc(summary, showDescLen));
  boxEl.appendChild(descriptionEl);

  // Create details
  const detailsEl = document.createElement('ul');
  detailsEl.appendChild(createRatingEl('Rated', rating.average));
  detailsEl.appendChild(createRatingEl('Genres', genres.join(' | ')));
  detailsEl.appendChild(createRatingEl('Status', status));
  detailsEl.appendChild(createRatingEl('Runtime', runtime));
  boxEl.appendChild(detailsEl);

  // Create a box element for Actions (Favourite & notes)
  const showActions = document.createElement('div');
  showActions.classList.add('show-actions');
  showActions.appendChild(favButton(id));
  showActions.appendChild(editAddNotes(id));

  // Add Everything together
  showEl.appendChild(titleEl);
  showEl.appendChild(boxEl);
  showEl.appendChild(showActions);

  // Add click action to display episisodes
  toObserve = showEl;
  return showEl;
};

const renderShows = (shows = allShows, append = false) => {
  if (append) {
    const listEl = document.querySelector('.shows-container');
    shows.slice(shows.length - perPage, shows.length).forEach((show) => listEl.appendChild(createShowEl(show)));
    observer.observe(toObserve);
    return;
  }

  // Create container
  const listEl = document.createElement('ul');
  listEl.classList.add('shows-container');

  // Add shows
  shows.forEach((show) => listEl.appendChild(createShowEl(show)));

  // Create intersection observer
  if (!searchBox.value) observer.observe(toObserve);

  // Render the container with children
  rootElem.innerHTML = '';
  rootElem.appendChild(listEl);

  // Display search count if search used
  if (shows.length !== allShows.length && searchBox.value) {
    searchCount.innerText = `Displaying ${shows.length}/${allShows.length} shows`;
  } else {
    searchCount.innerText = '';
  }

  goBack.addEventListener('click', () => {
    currShowID = 'All';
    showsPage();
  });
};

const createSelectForSort = () => {
  const container = document.createElement('div');
  container.classList.add('sort-selector');

  const sortLabel = document.createElement('label');
  sortLabel.setAttribute('for', 'sort-selector');
  sortLabel.innerText = 'Sort By:';
  container.appendChild(sortLabel);

  const selectEl = document.createElement('select');
  selectEl.setAttribute('id', 'sort-selector');

  // Create sort by name option
  let optionEl = document.createElement('option');
  optionEl.innerText = 'Name';
  optionEl.value = 'name';
  if (sortBy.key === 'name') {
    optionEl.setAttribute('selected', true);
  }
  selectEl.appendChild(optionEl);

  // Create sort by rating option
  optionEl = document.createElement('option');
  optionEl.innerText = 'Rating';
  optionEl.value = 'rating';
  if (sortBy.key === 'rating') {
    optionEl.setAttribute('selected', true);
  }
  selectEl.appendChild(optionEl);

  const sortArrow = document.createElement('span');
  sortArrow.innerText = sortBy.direction > 0 ? '↑' : '↓';
  sortArrow.addEventListener('click', () => {
    sortBy.direction *= -1;
    showsPage();
  });

  // Add event listener to search by ID
  selectEl.addEventListener('change', (e) => {
    sortBy.key = e.target.value;
    showsPage();
  });
  container.appendChild(selectEl);
  container.appendChild(sortArrow);
  // insert the select element before searchbox
  document.querySelector('header').insertBefore(container, document.querySelector('.search-form'));
};

const showsPage = () => {
  currPageNum = 1;
  perPage = 4;
  goBack.classList.add('hidden');
  if (document.querySelector('.episode-selector')) {
    document.querySelector('.episode-selector').remove();
  }
  searchBox.addEventListener('input', search);
  searchBox.setAttribute('placeholder', 'Search Shows...');
  currentPage = PAGES.SHOWS;
  allShows = getAllShows().sort(sortObj);
  if (document.querySelector('.show-selector')) {
    document.querySelector('.show-selector').remove();
  }
  if (document.querySelector('.sort-selector')) {
    document.querySelector('.sort-selector').remove();
  }
  createShowsSelect();
  createSelectForSort();
  showsChunk = allShows.slice(0, perPage * currPageNum);
  renderShows(showsChunk);
};
window.onload = showsPage;
