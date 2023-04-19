//import '/assets/css/main.scss'

// Focus Visible Polyfill
import 'focus-visible'

// Internal Modules
import './modules/nav'

// video.js
import videojs from 'video.js'
import 'videojs-youtube'

// pagefind-ui
import '../../_pagefind/pagefind-ui.js'
const initSearch = () => {
    new PagefindUI({ element: '#search', showImages: false })
      const inputSearch = document.querySelector("input")
      inputSearch.setAttribute("id","site-search")
  }
const isHome = document.querySelector('.home')
if (isHome) initSearch()

// photoswipe
import PhotoSwipe from 'photoswipe'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
const galleries = document.querySelectorAll('.gallery')
galleries.forEach(galleryX => {
    const lightbox = new PhotoSwipeLightbox({
        gallery: galleryX,
        children: 'a',
        showHideAnimationType: 'zoom',
        pswpModule: PhotoSwipe,
        preload: [1, 1]
    });
    lightbox.init();
})