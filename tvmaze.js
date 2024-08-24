"use strict";

const $showsList = $("#showsList");
// const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios({
      baseURL: "http://api.tvmaze.com/", 
      url: "search/shows", 
      method: "GET", 
      params: { q: term}, //has to be term from searchForShowandDisplay function
     }
);
  return response.data.map(searchResult => {
    const show = searchResult.show; 
    return { 
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : "https://tinyurl.com/missing-tv", //like an if statement
  };
});}



/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
         <ul class = "episode-list" style ="display: none;"></ul>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


async function displayEpisodes(event) {
  const $button = $(event.target);
  const showId = $button.closest("[data-show-id]").data("show-id");
  const episodes = await getEpisodesOfShow(showId);

  const $episodesList = $button.closest(".Show").find(".episode-list");
  populateEpisodes(episodes, $episodesList);
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios({
    baseURL: "http://api.tvmaze.com/", 
    url: `shows/${id}/episodes`,  //template literal syntax backticks ``
    method: "GET", 
   }
);
return response.data.map(episode => ({
  id: episode.id,
  name: episode.name,
  season: episode.season,
  number: episode.number,

}));
}
/** Write a clear docstring for this function... */

function populateEpisodes(episodes, $episodesList) { 
  $episodesList.empty(); 

  
  $episodesList.append('<br><h3>Episodes</h3>');
  for(let episode of episodes) {
    const $tvShow = $(`<li> ${episode.name} (season ${episode.season}, number ${episode.number}) </li>`);
    // <li>Pilot (season 1, number 1)</li>
    $episodesList.append($tvShow);
  }
  // $episodesArea.show();
  $episodesList.slideDown();
  
}
$showsList.on("click", ".Show-getEpisodes", displayEpisodes);

