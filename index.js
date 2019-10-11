(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const pagination = document.getElementById('pagination')
  const viewMode = document.querySelector('.view-mode')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let displayMode = 'card-mode'
  let currentPage = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(currentPage, data, displayMode)
  }).catch((err) => console.log(err))

  // add show movie event listener
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    getTotalPages(results)
    getPageData(currentPage, results, displayMode)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      currentPage = event.target.dataset.page
      getPageData(currentPage, data, displayMode)
    }
  })

  // listen to view mode click event
	viewMode.addEventListener('click', event => {
    if (event.target.classList.contains('card-mode')) {
      displayMode = 'card-mode'
      getPageData(currentPage, data, displayMode)
    } else if (event.target.classList.contains('list-mode')) {
      displayMode = 'list-mode'
      getPageData(currentPage, data, displayMode)
		}
	})

  function displayDataList (dataList, type) {
    let htmlContent = ''
    dataList.forEach(function (item) {
      if (type === 'card-mode') {
        htmlContent += displayCardMode(item)
      } else if (type === 'list-mode') {
        htmlContent += displayListMode(item)
      }
    })
    dataPanel.innerHTML = htmlContent
  }

  function displayCardMode(item) {
    const displayCardTemplate = `
      <div class="col-sm-3">
        <div class="card mb-2">
          <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
          <div class="card-body movie-item-body">
            <h6 class="card-title">${item.title}</h5>
          </div>

          <!-- "More" button -->
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
            <!-- favorite button -->
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `

    return displayCardTemplate
  }

  function displayListMode(item) {
    const displayListTemplate = `
      <li class="list-group-item col-12 border-right-0 border-left-0 justify-content-between">
        <div class="title d-inline-flex col-10">
          <h5>${item.title}</h5>
        </div>
        <div class="button-group d-inline-flex">
          <button class="btn btn-primary btn-show-movie ml-1" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite ml-1" data-id="${item.id}">+</button>
        </div>
      </li>
    `

    return displayListTemplate
  }

  function showMovie (movieId) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + movieId
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list.`)
    }

    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''

    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }

    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data, mode) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)

    displayDataList(pageData, mode)
  }
})()
