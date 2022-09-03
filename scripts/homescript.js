
/*
    Very important:
    ==================
    There is an infinity scroll in all 3 categories:
    'Popular','Now Playind' and 'Favorites'
    in Favorites the scroll reload 7 movies every single time - It can be changed by the variables startSlice and endSlice
    and all the rest of categories 20 movies in every single time 

    The favorites id's movies store in local storage
    when the movie checked if it's favories this is done by 
    using in hash set to make sure the checking will take 0(1) complexity time  
*/

const sortBy = document.querySelector('.sortBy')
const scrollBtn = document.querySelector('.scroll-up-btn')
const scrollLoading = document.querySelector('.scrollLoader')

// start on page one, increment every single fetch - avery page includes 20 movies
let page = 1

// type of catgory
let type = 'popular'

// make sure that the user not fetch data again ehen scroll
let allowScroll = true

// For favorites
let startSlice = 0
let endSlice = 7
// To know when all the data displayed and stop try to fetch again
let isEndScroll = false

// Get the correct url for Api
const getApiUrl = (id) => {
    switch (type) {
        case 'popular':
            return BASE_URL + `movie/popular?${API_KEY}&language=en-US&page=${page}`
        case 'now':
            return BASE_URL + `movie/now_playing?${API_KEY}&language=en-US&page=${page}`
        case 'favorites':
            return BASE_URL + `movie/${id}?${API_KEY}&language=en-US`
    }
}

// get the movies from Api
const getMovies = async(isScroll=false) => {
    if (!isScroll) showLoader(main)
    try{
        const res = await fetchWithTimeout(getApiUrl(), {
            timeout: 6000
        });
        if(!res.ok) throw new Error('Somthing Wrong - Could not fetch the data!')
        const data = await res.json()
        if(data.results.length == 0 || page > 500){
            isEndScroll = true
            scrollLoading.classList.remove('show');
        } 
        else showMovies(data.results,isScroll)
    } catch(error){
        console.error(error);
        if(error.message == 'Somthing Wrong - Could not fetch the data!'){
            document.querySelector('.time-out-error h3').textContent = 'Somthing Wrong - Could not fetch the data!'
        }else{
            document.querySelector('.time-out-error h3').textContent = 'check your internet connection!'
        }
        document.querySelector('.time-out-error').style.display='flex'
        setTimeout(() => {
            document.querySelector('.time-out-error').style.display='none' 
            allowScroll = true
            scrollLoading.classList.remove('show');
        }, 2500);
    }
}

const getFavoritesMovies = async(isScroll=false) => {
    if(myFavoritesHashSet.size == 0){
        main.innerHTML = `<h1 data-text='danger'>You have not favorites movies<h1>` 
    }else{
        const favList = []
        if (!isScroll) showLoader(main)
        const sliceFavArr = myFavoritesArr.slice(startSlice,endSlice)
        if(sliceFavArr.length == 0) isEndScroll = true
        
        for(const id of sliceFavArr){
            try{
                const res = await fetchWithTimeout(getApiUrl(id), {
                    timeout: 6000
                });
                if(!res.ok) throw new Error('Somthing Wrong - Could not fetch the data!')
                const data = await res.json() 
                favList.push(data)
            }catch(error){
                console.error(error);
                if(error.message == 'Somthing Wrong - Could not fetch the data!'){
                    document.querySelector('.time-out-error h3').textContent = 'Somthing Wrong - Could not fetch the data!'
                }else{
                    document.querySelector('.time-out-error h3').textContent = 'check your internet connection!'
                }
                document.querySelector('.time-out-error').style.display='flex'
                setTimeout(() => {
                    document.querySelector('.time-out-error').style.display='none' 
                    allowScroll = true
                    scrollLoading.classList.remove('show');
                }, 2500);

                break
            }
        }
        showMovies(favList,isScroll)
        
    }
}

// Build the ui
const showMovies = (data,isScroll=false) => {
    if(!isScroll) main.innerHTML = ''
    data.forEach(movie => {
        const {poster_path,title,vote_average,overview} = movie
        const movieEl = document.createElement('div')
        movieEl.classList.add('movie')
        movieEl.innerHTML = `
            <img class="blur" data-src="https://image.tmdb.org/t/p/w500/${poster_path}" src="/poster-min.jpg" alt="Image">

            <div class="movie-info">
                <h3>${title}</h3>
                <span data-text="${getVotColor(vote_average)}">${vote_average.toFixed(1)}</span>
            </div>

            <div class="overview">
                <h3>Overview</h3>
                ${overview}
            </div>
            <div class="favorite-icon">
                <i class="ri-star-fill"></i>
            </div>
            <a href="movie-page.html?id=${movie.id}" class="info">
                <i class="ri-information-line"></i>
            </a>
        `
        main.appendChild(movieEl)
        const img = movieEl.querySelector('img')
        loadImage(img)
        if(isFavorites(movie.id)){
            movieEl.querySelector('.favorite-icon').classList.add('show')
        }
    });
    allowScroll=true
    scrollLoading.classList.remove('show');
}

// Show the scroll animation and make sure to fetch the next data
const showScrollLoading = () => {
    allowScroll = false
    scrollLoading.classList.add('show');
  
    setTimeout(() => {
        if(type!='favorites'){
            page++;
            getMovies(true)
        }else{
            const jump = endSlice - startSlice
            startSlice+=jump
            endSlice+=jump
            getFavoritesMovies(true)
        }
    }, 500);
}

// Scroll up by click
const handleScrollUP = () => {
    const header = document.querySelector('header');
    header.scrollIntoView({ behavior: "smooth", block: "start" });
}

// reset values
const reset = () => {
    page = 1
    startSlice = 0
    isEndScroll = 5
    isEndScroll = false
}

// Listener to scroll page
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if(scrollTop < 700){
        scrollBtn.classList.remove('show')
    }
    else{
        scrollBtn.classList.add('show')
    }
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isEndScroll) {
        if(allowScroll){
            showScrollLoading()
        }
    }

});

// Listener of the user's choice
sortBy.addEventListener('change',(e)=>{
    type = e.target.value
    reset()
    if(type!='favorites'){
        getMovies()
    }else{
        getFavoritesMovies()
    }
})


getMovies()
favoritesInitial()


