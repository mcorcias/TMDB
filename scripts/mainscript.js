const API_KEY = 'api_key=2c46288716a18fb7aadcc2a801f3fc6b'
const BASE_URL = 'https://api.themoviedb.org/3/'
let myFavoritesHashSet = new Set()
let myFavoritesArr = []


// Fetch data with timeout, if the data dosn't get on time this function close abort the controller  
async function fetchWithTimeout(resource, options = {}) {
    document.querySelector('.time-out-error').style.display='none'
    const { timeout = 5000 } = options;
    
    const abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);

    const response = await fetch(resource, {
      ...options,
      signal: abortController.signal  
    });
    clearTimeout(id);
    return response;
}

// Show spinner when the data is coming
const showLoader = (element) => {
    element.innerHTML = `
        <div class="lds-spinner">
            <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
    `
}

// Return name of color according number
const getVotColor = (vote) => {
    if(vote >= 8){
        return 'success'
    }
    if(vote >= 7){
        return 'warning'
    }
    return 'danger'
}

// When the Images will reload it'll take a while so 
// this function make sure to make the effect for this time 
const loadImage = (img) => {
    const big = document.createElement('img')
    
    big.onload = function(){ 
      img.src = this.src
      img.className = 'noblur'
    }
    
    big.src = img.dataset.src 
}

// Initial the favorites movies id's from local storage
const favoritesInitial = () => {
    const storageFavs = localStorage.getItem('favorites')
    if(storageFavs){
        const convertToArr = JSON.parse(storageFavs)
        if(Array.isArray(convertToArr) && convertToArr.length > 0){
            myFavoritesArr = convertToArr
            myFavoritesHashSet = new Set(convertToArr)
        }
    }
}

// Check if movie marked as favorite 
const isFavorites = (id) => {
    if(myFavoritesHashSet)
        return myFavoritesHashSet.has(id.toString())
    return false
}

// Add favorite to local storage
const addFavorite = (id) => {
    myFavoritesHashSet.add(id)
    myFavoritesArr.push(id)
    localStorage.setItem('favorites',JSON.stringify(myFavoritesArr))
}

// Remove favorite and update local storage
const removeFavorite = (id) => {
    myFavoritesHashSet.delete(id)
    myFavoritesArr = [...myFavoritesHashSet]
    localStorage.setItem('favorites',JSON.stringify(myFavoritesArr))
}





