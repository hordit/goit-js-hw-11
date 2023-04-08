import './sass/index.scss';
import ApiService from './apiService';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    searchForm: document.querySelector('.search-form'),
    galleryItems: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more')
    };
    
const { searchForm, galleryItems, loadMoreBtn }  = refs;
const pixabayRequest = new ApiService();
loadMoreBtn.classList.add('is-hidden');
const lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onFormSubmit(e) {
  e.preventDefault();

  pixabayRequest.resetPage();

  const { elements: { searchQuery } } = e.target;
  const value = searchQuery.value.trim();
  
  if (value === '') {
    return;
  }
  
  pixabayRequest.query = searchQuery.value;
 
  try {
    const data = await pixabayRequest.getData();
     if(!data) {
        return;
     }

    if (data.hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
      cleanGalleryItems();
      appendImagesMarkup(data);
      loadMoreIsVisible();
      lightbox.refresh();
      endOfSearchResultNotify();

      Notify.success(`Hooray! We found ${pixabayRequest.totalHits} images.`);
    }
  } catch(error) {
    console.log(error);
  } finally {
    searchForm.reset();
  }
}
async function onLoadMore() {
    try {
        const data = await pixabayRequest.getData();

        appendImagesMarkup(data);
        loadMoreIsVisible();
        lightbox.refresh();
        endOfSearchResultNotify();

        const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

        window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
        });

    } catch(error) {
        console.log(error);
    } finally {
        searchForm.reset();
    }
}

function loadMoreIsVisible() {
    if (getPagesCount() > pixabayRequest.page - 1) {
      loadMoreBtn.classList.remove('is-hidden');
    } else {
      loadMoreBtn.classList.add('is-hidden');
    }
}
  
function getPagesCount() {
    return Math.ceil(pixabayRequest.totalHits / pixabayRequest.options.params.per_page);
}
  
function endOfSearchResultNotify() {
    if (getPagesCount() === pixabayRequest.page - 1) {
      return Notify.failure("We're sorry, but you've reached the end of search results.");
    }
}

function appendImagesMarkup(data) {
  galleryItems.insertAdjacentHTML('beforeend', createMarkup(data));
}

function cleanGalleryItems() {
    galleryItems.innerHTML = '';
}

function createMarkup({hits}) {
    return hits
    .map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
     }) => `
     <div class="photo-card">
     <a href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" class="image-item"/>
    <div class="info">
        <p class="info-item">
        <b>Likes</b>
        ${likes}
        </p>
        <p class="info-item">
        <b>Views</b>
        ${views}
        </p>
        <p class="info-item">
        <b>Comments</b>
        ${comments}
        </p>
        <p class="info-item">
        <b>Downloads</b>
        ${downloads}
        </p>
     </div>
     </a>
    </div>`
  ).join('');
}








