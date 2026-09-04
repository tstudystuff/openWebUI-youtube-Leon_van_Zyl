// js/ui/toggle-img-sizes.js

import { updatePlayButton } from "./playStepVid.js";
let allMedia = [];

/* =========================================================
   VIDEO SIZE SYNC

   .step-vid is the media wrapper that receives .enlarge.

   On some mobile layouts the wrapper grows but the actual
   <video> keeps its old dimensions. This keeps the video
   synchronized with the wrapper without changing the
   control-button behavior.
   ========================================================= */

function syncVideoSize(media) {
    if (!media?.classList?.contains("step-vid")) {
        return;
    }

    const video = media.querySelector("video");

    if (!video) return;

    const enlarged =
        media.classList.contains("enlarge") ||
        media.classList.contains("first-vid-enlarge");

    if (enlarged) {

        video.style.width = "100%";
        video.style.maxWidth = "100%";
        video.style.height = "auto";
        video.style.display = "block";

    } else {

        /*
         * Restore stylesheet control when no longer enlarged.
         */
        video.style.removeProperty("width");
        video.style.removeProperty("max-width");
        video.style.removeProperty("height");
        video.style.removeProperty("display");

    }
}
/* =========================================================
   ESCAPE — CLOSE ENLARGED MEDIA

   When Escape is pressed:

       - enlarged image returns to normal size
       - enlarged video returns to normal size
       - enlarged video pauses
       - video stays at its current timestamp
       - poster/reset behavior is NOT triggered
   ========================================================= */

function handleEscapeMedia(e) {

    if (e.key !== "Escape") {
        return;
    }


    const enlargedMedia = [
        ...document.querySelectorAll(
            ".step-img.enlarge, " +
            ".step-img.first-vid-enlarge, " +
            ".step-vid.enlarge, " +
            ".step-vid.first-vid-enlarge"
        )
    ];


    /*
     * Nothing enlarged — Escape keeps its
     * normal browser/page behavior.
     */
    if (!enlargedMedia.length) {
        return;
    }


    e.preventDefault();


    enlargedMedia.forEach(media => {

        /*
         * If the enlarged media is a video,
         * pause it before shrinking.
         *
         * IMPORTANT:
         * We intentionally DO NOT call
         * resetVideoToPoster().
         *
         * Escape should pause at the current
         * timestamp, not rewind to zero.
         */
        if (
            media.classList.contains(
                "step-vid"
            )
        ) {

            const video =
                media.querySelector(
                    "video"
                );


            if (video) {

                video.pause();


                updatePlayButton(
                    video
                );

            }

        }


        removeMediaEnlarge(
            media
        );


        /*
         * Reset the remembered media position
         * for this step.
         */
        const step =
            media.closest(
                ".step-float"
            );


        if (step) {

            step.dataset.mediaIndex =
                -1;

        }

    });

}


/*
 * This module loads once, so the listener works
 * for both the original page and dynamically
 * injected lesson content.
 */
document.addEventListener(
    "keydown",
    handleEscapeMedia
);

/* =========================================================
   REMOVE ENLARGE FROM ONE MEDIA ITEM
   ========================================================= */

function removeMediaEnlarge(media) {
    if (!media) return;

    media.classList.remove("enlarge");
    media.classList.remove("first-vid-enlarge");

    syncVideoSize(media);
}


/* =========================================================
   ADD ENLARGE TO ONE MEDIA ITEM
   ========================================================= */

function addMediaEnlarge(media) {
    if (!media) return;

    media.classList.add("enlarge");

    syncVideoSize(media);
}


/* =========================================================
   TOGGLE CURRENT STEP MEDIA
   ========================================================= */

export function toggleStepMedia(step) {
    if (!step) return null;

    const stepMedia = [
        ...step.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];

    if (!stepMedia.length) {
        return null;
    }


    /*
     * Prefer the currently enlarged media.
     */
    const enlargedMedia =
        step.querySelector(
            ".step-img.enlarge, .step-vid.enlarge"
        );


    /*
     * If something is already enlarged,
     * shrink it.
     */
    if (enlargedMedia) {

        removeMediaEnlarge(
            enlargedMedia
        );

        step.dataset.mediaIndex = -1;

        return null;
    }


    /*
     * Otherwise enlarge remembered media,
     * falling back to the first media item.
     */
    let index =
        Number(
            step.dataset.mediaIndex ?? 0
        );


    if (
        index < 0 ||
        index >= stepMedia.length
    ) {
        index = 0;
    }


    const media =
        stepMedia[index];


    /*
     * Clear media only within this step.
     */
    stepMedia.forEach(item => {
        removeMediaEnlarge(item);
    });


    addMediaEnlarge(
        media
    );


    step.dataset.mediaIndex =
        index;


    return media;
}


/* =========================================================
   UPDATE MEDIA CACHE
   ========================================================= */

export function updateImgs(root = document) {

    allMedia = [
        ...root.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    /*
     * Make sure existing video state matches
     * its wrapper if content was dynamically loaded.
     */
    allMedia.forEach(media => {
        syncVideoSize(media);
    });

}


/* =========================================================
   REMOVE ENLARGE FROM ALL MEDIA
   ========================================================= */

export function denlargeAllImages() {

    if (!allMedia?.length) {
        return;
    }


    allMedia.forEach(media => {
        removeMediaEnlarge(media);
    });

}


/* =========================================================
   ENLARGE ONE MEDIA ITEM
   ========================================================= */

export function enlargeSingleMedia(mediaEl) {

    if (!mediaEl) return;


    const step =
        mediaEl.closest(
            ".step-float"
        );


    if (!step) return;


    const stepMedia = [
        ...step.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    const index =
        stepMedia.indexOf(
            mediaEl
        );


    if (index === -1) return;


    denlargeAllImages();


    addMediaEnlarge(
        mediaEl
    );


    step.dataset.mediaIndex =
        index;

}


/* =========================================================
   CYCLE MEDIA INSIDE CURRENT STEP
   ========================================================= */

export function cycleStepMedia(step) {

    if (!step) return null;


    const stepMedia = [
        ...step.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    if (!stepMedia.length) {
        return null;
    }


    let index =
        Number(
            step.dataset.mediaIndex ?? -1
        );


    denlargeAllImages();


    index++;


    /*
     * Reaching the end returns everything
     * to its normal size.
     */
    if (
        index >= stepMedia.length
    ) {

        step.dataset.mediaIndex = -1;

        return null;
    }


    const media =
        stepMedia[index];


    addMediaEnlarge(
        media
    );


    step.dataset.mediaIndex =
        index;


    return media;
}


/* =========================================================
   CLICK TOGGLE
   ========================================================= */

export function clickToggleEnlarge({
    e
}) {

    if (!e) return null;


    /*
     * Video controls must NEVER resize media.
     */
    if (
        e.target.closest(
            ".vid-cntrl-btns"
        )
    ) {
        return null;
    }


    const media =
        e.target.closest(".step-img") ||
        e.target.closest(".step-vid");


    if (!media) {
        return null;
    }


    const step =
        media.closest(
            ".step-float"
        );


    if (!step) {
        return null;
    }


    const stepMedia = [
        ...step.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    const index =
        stepMedia.indexOf(
            media
        );


    const wasEnlarged =
        media.classList.contains(
            "enlarge"
        );


    /*
     * Only clear media inside THIS step.
     */
    stepMedia.forEach(item => {
        removeMediaEnlarge(item);
    });


    /*
     * Clicking already enlarged media
     * returns it to normal size.
     */
    if (wasEnlarged) {

        step.dataset.mediaIndex = -1;

        return null;
    }


    addMediaEnlarge(
        media
    );


    step.dataset.mediaIndex =
        index;


    return media;
}