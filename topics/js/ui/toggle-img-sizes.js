// js/ui/toggle-img-sizes.js

let allMedia = [];


/* =========================================================
   UPDATE MEDIA CACHE
   ========================================================= */

export function updateImgs(root = document) {
    allMedia = [
        ...root.querySelectorAll('.step-img, .step-vid')
    ];
}


/* =========================================================
   REMOVE ENLARGE FROM ALL MEDIA
   ========================================================= */

export function denlargeAllImages() {
    if (!allMedia?.length) return;

    allMedia.forEach(media => {
        media.classList.remove('enlarge');
        media.classList.remove('first-vid-enlarge');
    });
}


/* =========================================================
   ENLARGE ONE MEDIA ITEM
   ========================================================= */

export function enlargeSingleMedia(mediaEl) {
    if (!mediaEl) return;

    const step = mediaEl.closest('.step-float');

    if (!step) return;

    const stepMedia = [
        ...step.querySelectorAll('.step-img, .step-vid')
    ];

    const index = stepMedia.indexOf(mediaEl);

    if (index === -1) return;

    denlargeAllImages();

    mediaEl.classList.add('enlarge');

    step.dataset.mediaIndex = index;
}


/* =========================================================
   CYCLE MEDIA INSIDE CURRENT STEP
   ========================================================= */

export function cycleStepMedia(step) {
    if (!step) return;

    const stepMedia = [
        ...step.querySelectorAll('.step-img, .step-vid')
    ];

    if (!stepMedia.length) return;

    let index = Number(step.dataset.mediaIndex ?? -1);

    denlargeAllImages();

    index++;

    if (index >= stepMedia.length) {
        step.dataset.mediaIndex = -1;
        return null;
    }

    const media = stepMedia[index];

    media.classList.add('enlarge');

    step.dataset.mediaIndex = index;

    return media;
}


/* =========================================================
   CLICK TOGGLE
   ========================================================= */

export function clickToggleEnlarge({ e }) {
    if (!e) return null;

    // Never resize media from video control buttons
    if (e.target.closest('.vid-cntrl-btns')) {
        return null;
    }

    const media =
        e.target.closest('.step-img') ||
        e.target.closest('.step-vid');

    if (!media) return null;

    const step = media.closest('.step-float');

    if (!step) return null;

    const stepMedia = [
        ...step.querySelectorAll('.step-img, .step-vid')
    ];

    const index = stepMedia.indexOf(media);

    const wasEnlarged =
        media.classList.contains('enlarge');

    // Only clear enlarged media in THIS step
    stepMedia.forEach(item => {
        item.classList.remove('enlarge');
        item.classList.remove('first-vid-enlarge');
    });

    if (wasEnlarged) {
        step.dataset.mediaIndex = -1;
        return null;
    }

    media.classList.add('enlarge');

    step.dataset.mediaIndex = index;

    return media;
}