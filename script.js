/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
let allEpisodes;
const rootElem = document.getElementById('root');

const createEpisodeEl = ({
  name, season, number, image, summary,
}) => {
  // Create a box
  const episodeEl = document.createElement('li');
  episodeEl.classList.add('episode');

  // Create Episode Title
  const titleEl = document.createElement('h3');
  season = season.toString().padStart(2, '0');
  episode = number.toString().padStart(2, '0');
  titleEl.innerText = `${name} - S${season}E${episode}`;

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

const renderEpisodes = () => {
  // Create container
  const listEl = document.createElement('ul');
  listEl.classList.add('episodes-container');

  // Add episodes
  allEpisodes.forEach((episode) => listEl.appendChild(createEpisodeEl(episode)));

  // Render the container with children
  rootElem.appendChild(listEl);
};

const setup = () => {
  allEpisodes = getAllEpisodes();
  renderEpisodes();
};

window.onload = setup;
