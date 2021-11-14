const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12
// 新增currentPage變數，將event.target.dataset.page抽出變成可用變數
let currentPage = 1

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
// 新增控制變換模式的變數
const changeMode = document.querySelector("#change-mode")

function renderMovieList(data) {
  // if mode = card
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-3">
    <div class="mb-4">
      <div class="card">
        <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
        }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") { // if mode = list
    // 新增清單模式的html
    let rawHTML = `<ul class="list-group col mb-4">`
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  // movies ? "movies" : "filterMovies"
  const data = filteredMovies.length ? filteredMovies : movies
  // 計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  // 清空先前點選more時殘留的內容，加上loading讓載入時間感覺變短
  modalTitle.innerText = 'Loading...'
  modalDate.innerText = ''
  modalDescription.innerText = ''
  modalImage.innerHTML = ''
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  //在addToFavorite傳入一個id
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find((movie) => movie.id === id)
  // 請find去電影總表中查看，找出id相同的電影物件回傳，暫存在movie
  if (list.some((movie) => movie.id === id)) {
    return alert("This movie is already in the favorite list!")
  } // 已經在收藏清單的電影，不應被重複加入
  list.push(movie) // 把movie推進收藏清單
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
  // 呼叫localStorage.setItem，把更新後的收藏清單同步到local storage
}

// 新增切換模式的函式
function switchDisplayMode(displayMode) {
  dataPanel.dataset.mode = displayMode
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  const page = Number(event.target.dataset.page)
  // 將event.target.dataset.page抽出變成可用變數
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))

  const pageList = document.querySelectorAll(".page-item")
  // 以迴圈尋找有沒有已經變成active的頁碼，有則消除
  for (let page of pageList) {
    page.classList.remove("active")
  }
  // 在li element上加active class以呈現對比
  event.target.parentElement.classList.add("active")
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return alert("Your keyword is not valid!")
  }

  // 篩選電影方法: fliter
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`Cannot find any movie with the keyword "${keyword}"`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
});

// 新增監聽清單模式與卡片模式的按鈕
changeMode.addEventListener("click", function onChangeModeClicked(event) {
  if (event.target.id === "card-mode-button") {
    switchDisplayMode("card-mode")
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.id === "list-mode-button") {
    switchDisplayMode("list-mode")
    renderMovieList(getMoviesByPage(currentPage))
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))
