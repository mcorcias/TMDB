
const data = {
    movieId:'',
    logo:'',
    actors:'',
    directos:'',
    genres:'',
    overview:'',
    language:'',
    title:'', year:'',
    released:'', imgMovie:'',vote:0
}

// Get the url params to get the movie id
const getUrlParam = () => {
    const url  = window.location.search
    const queries = new URLSearchParams(url)
    const id = queries.get('id')
    if(id){
        data.movieId = id
        //make ui
        fetchData(id)
    }else{
        window.location.href = "index.html"
    }
}

// movie details
const getDetails = (id) => {
    const url =  BASE_URL + `movie/${id}?${API_KEY}&language=en-US`
    return fetchWithTimeout(url)
}

// Logo Image
const getLogo = (id) => {
    const url = BASE_URL + `movie/${id}/images?${API_KEY}`
    return fetchWithTimeout(url)    
}

// Movie Cast Details
const getCast = (id) => {
    const url = BASE_URL + `movie/${id}/casts?${API_KEY}` 
    return fetchWithTimeout(url) 
}

const showErrorAndExit = ()=>{
    document.querySelector('.time-out-error > h3').textContent = 'Somthing Wrong!'
    document.querySelector('.time-out-error').style.display='flex'
    setTimeout(()=>{
        window.location.href = "index.html"
    },1500)
}

const builtUI = () => {
    if(data.logo) document.querySelector('.logo img').src = data.logo 
    
    main.innerHTML = `
        <div class="movie-image">
            <img class="blur" data-src="https://image.tmdb.org/t/p/w500/${data.imgMovie}" src="/poster-min.jpg">
            <div onclick="handleMarkAsFavorite()" class="favorite-icon">
                <i data-favorite="${isFavorites(data.movieId)}" class="ri-star-fill"></i>
            </div>
        </div>
        <div class="movie-details">
            <div class="details">
                <h1 data-text="warning" class="title">${data.title}</h1>
                <br>
                <h4><span data-text="warning">Year:</span> <span>${data.year}</span> <span data-text="warning">Released:</span> <span>${data.released}</span></h4>
                <br>
                <h4><span data-text="warning">Language:</span> <span>${data.language}</span></h4>
                <br>
                <h4><span data-text="warning">Genres:</span> <span>${data.genres}</span></h4>
                <br>
                <h4><span data-text="warning">Actors:</span> <span>${data.actors}</span></h4>
                <br>
                <h4><span data-text="warning">Directors:</span> <span>${data.directos}</span></h4>
                <br>
                <h4><span data-text="warning">Rating:</span> <span data-text="${getVotColor(data.vote)}">${data.vote.toFixed(1)}</span></h4>
                <br>
                <h2 data-text="warning">Overview</h2>
                <p>
                    ${data.overview}
                </p>
            </div>
        </div>
    `
    loadImage(document.querySelector('#main img'))
}

const handleGoBack = () => {
    window.location.href = "index.html"
}

// Fetch all data from 3 diffrents urls by Promies all
const fetchData = (id) =>{
    showLoader(main)
    Promise.all([getDetails(id),getLogo(id),getCast(id)])
    .then(async values=>{
        if(values.some(val=>!val.ok)){
            showErrorAndExit()
        }
        else{
            for(const val of values){
                try{
                    const res = await val.json()
                    if(res.overview){
                        data.overview = res.overview
                        data.genres = res.genres.map(g=>g.name)
                        data.title = res.title
                        data.year = new Date(res.release_date).getFullYear()
                        data.released = `${new Date(res.release_date).getDay()} ${new Intl.DateTimeFormat('en-US', { month: 'long'}).format(new Date(res.release_date))} ${new Date(res.release_date).getFullYear()}`
                        data.language = res.original_language
                        data.imgMovie = res.poster_path
                        data.vote = res.vote_average
                    }
                    else if(res.cast && res.crew){
                        data.actors = res.cast.slice(0,4).map(actor=>actor.name).join(',')
                        data.directos = res.crew.filter(c=>c.job && c.job == 'Director').map(d=>d.name).join(',')
                    }
                    else if(res.logos && res.logos[0]){
                        data.logo = 'https://image.tmdb.org/t/p/w185'+res.logos[0].file_path
                    }
                }catch(error){
                    console.error(error);
                    showErrorAndExit()
                }
            }
       

            builtUI()
            
        }
    })
}


const handleMarkAsFavorite = () =>{
   const element = document.querySelector('[data-favorite]')
   const state =  JSON.parse(element.dataset.favorite)
   if(!state){
    element.dataset.favorite = 'true'
    addFavorite(data.movieId)
   }else{
    element.dataset.favorite = 'false'
    removeFavorite(data.movieId)
   }
}


getUrlParam()
favoritesInitial()
