module.exports = {

	gallery: function (content, name) {
		return `
		<div>
			<div class="gallery" id="gallery-${name}--responsive-images">
				<ul>
					${content}
				</ul>
			</div>
			<script type="module">
				import PhotoSwipeLightbox from '/assets/js/modules/PhotoSwipe/dist/photoswipe-lightbox.esm.min.js';
				import PhotoSwipe from '/assets/js/modules/PhotoSwipe/dist/photoswipe.esm.min.js';
				import '/assets/js/modules/PhotoSwipe/dist/photoswipe.css';
				const lightbox = new PhotoSwipeLightbox({
					gallery: '#gallery-${name}--responsive-images',
					children: 'a',
					pswpModule: PhotoSwipe,
					preload: [1, 1]
				});
				lightbox.init();
			</script>
		</div>
		`.replace(/(\r\n|\n|\r)/gm, "")
	},
}