// js/nav/step-nav.js

import {
    cycleStepMedia,
    denlargeAllImages,
    updateImgs,
    clickToggleEnlarge
} from "../ui/toggle-img-sizes.js";

import {
    videoControls,
    pauseAllVideos
} from "../ui/playStepVid.js";

import { changeTutorialLink } from "../ui/change-tutorial-link.js";
import { tutorialLink } from "../app.js";
import { lastClickedSideBarLink } from "./side-bar-nav.js";
import { mainContainer } from "../ui/toggle-side-bar.js";


let steps = [];
let copyCodes = [];

let iSteps = 0;
let iCopyCodes = 0;

export let lastStep;
export let lastFocusedMainEl;

let allStepImgVids = [];
let allVids = [];

let stepFocused = false;
let stepClicked = false;


/* =========================================================
   STATE HELPERS
   ========================================================= */

export function removeLastStep() {
    lastStep = null;
}

function updateCurrentCopyCodes({ step }) {
    copyCodes = [
        ...step.querySelectorAll(".copy-code")
    ];
}


/* =========================================================
   INITIALIZE STEP NAVIGATION
   ========================================================= */

export function initStepNavigation({ mainTargetDiv }) {
    if (!mainTargetDiv) return;

    steps = [
        ...mainTargetDiv.querySelectorAll(".step-float")
    ];

    allStepImgVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];

    updateImgs(mainTargetDiv);

    allVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-vid > video"
        )
    ];


    /* =====================================================
       CLICK OUTSIDE MEDIA
       ===================================================== */

    document.addEventListener("pointerdown", e => {
        const media = e.target.closest(
            ".step-img, .step-vid"
        );

        if (media) return;

        denlargeAllImages();
    });


    /* =====================================================
       VIDEO EVENTS
       ===================================================== */

    allVids.forEach(vid => {

        const stepVid = vid.closest(".step-vid");

        if (!stepVid) return;


        /* CLICK VIDEO */

        vid.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            videoControls({
                vid,
                e
            });
        });


        /* VIDEO KEYBOARD */

        vid.addEventListener("keydown", e => {
            e.stopPropagation();

            videoControls({
                vid,
                e
            });
        });


        /* CUSTOM VIDEO CONTROL BUTTONS */

        const controlButtons =
            stepVid.querySelectorAll(
                ".vid-cntrl-btns button"
            );

        controlButtons.forEach(button => {

            button.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();

                videoControls({
                    vid,
                    e
                });
            });

        });

    });


    /* =====================================================
       IMAGE / VIDEO WRAPPER CLICK
       ===================================================== */

    allStepImgVids.forEach(media => {

        media.addEventListener("click", e => {

            // Never resize from video controls
            if (
                e.target.closest(
                    ".vid-cntrl-btns"
                )
            ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            clickToggleEnlarge({ e });
        });

    });


    /* =====================================================
       STEP EVENTS
       ===================================================== */

    steps.forEach((step, index) => {

        if (step.dataset.listenerAdded) {
            return;
        }

        step.setAttribute("tabindex", "0");


        /* -------------------------------------------------
           STEP FOCUS
           ------------------------------------------------- */

        step.addEventListener("focus", e => {

            stepClicked = true;

            iSteps = index;
            iCopyCodes = 0;

            denlargeAllImages();

            lastStep = step;

            stepClicked = false;


            step.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            if (
                e.target === steps[steps.length - 1] &&
                steps.length > 3
            ) {
                mainContainer?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    container: "all"
                });
            }


            pauseAllVideos({
                allVids
            });

        });


        /* -------------------------------------------------
           STEP FOCUS IN
           ------------------------------------------------- */

        step.addEventListener("focusin", () => {
            iSteps = index;
        });


        /* -------------------------------------------------
           STEP FOCUS OUT
           ------------------------------------------------- */

        step.addEventListener("focusout", e => {

            if (
                step.contains(
                    e.relatedTarget
                )
            ) {
                return;
            }

            denlargeAllImages();
        });


        /* -------------------------------------------------
           STEP KEYBOARD
           ------------------------------------------------- */

        step.addEventListener("keydown", e => {

            const key = e.key;

            const stepFloat =
                e.target.closest(
                    ".step-float"
                );

            if (!stepFloat) return;


            /* =============================================
               ENTER / SHIFT + ENTER
               ============================================= */

            if (key === "Enter") {

                // Never cycle media from control buttons
                if (
                    e.target.closest(
                        ".vid-cntrl-btns"
                    )
                ) {
                    return;
                }

                changeTutorialLink(e);


                /* -----------------------------------------
                   NORMAL ENTER
                   ----------------------------------------- */

                if (!e.shiftKey) {

                    updateCurrentCopyCodes({
                        step: stepFloat
                    });

                    stepClicked = true;


                    const enlargedMedia =
                        cycleStepMedia(
                            stepFloat
                        );


                    /*
                     * If Enter lands on a video,
                     * start playing it.
                     */
                    if (
                        enlargedMedia?.classList.contains(
                            "step-vid"
                        )
                    ) {

                        const vid =
                            enlargedMedia.querySelector(
                                "video"
                            );

                        if (vid) {
                            videoControls({
                                vid,
                                e
                            });
                        }
                    }


                    const firstCopyCode =
                        stepFloat.querySelector(
                            ".copy-code"
                        );


                    if (firstCopyCode) {
                        firstCopyCode.focus();
                    }


                    lastStep = stepFloat;

                }


                /* -----------------------------------------
                   SHIFT + ENTER
                   Restart video from 0:00
                   ----------------------------------------- */

                else {

                    stepFloat.focus();


                    const enlargedMedia =
                        cycleStepMedia(
                            stepFloat
                        );


                    if (
                        enlargedMedia?.classList.contains(
                            "step-vid"
                        )
                    ) {

                        const vid =
                            enlargedMedia.querySelector(
                                "video"
                            );

                        if (vid) {

                            // Always restart video
                            vid.currentTime = 0;

                            videoControls({
                                vid,
                                e
                            });
                        }
                    }

                }

                return;
            }


            /* =============================================
               VIDEO KEYBOARD CONTROLS
               ============================================= */

            const stepVid =
                stepFloat.querySelector(
                    ".step-vid"
                );

            if (!stepVid) return;


            const vid =
                stepVid.querySelector(
                    "video"
                );

            if (!vid) return;


            if (
                key === " " ||
                key === "ArrowLeft" ||
                key === "ArrowRight"
            ) {
                videoControls({
                    vid,
                    e
                });
            }

        });


        /* -------------------------------------------------
           STEP CLICK
           ------------------------------------------------- */

        step.addEventListener("click", e => {
            changeTutorialLink(e);
        });


        step.dataset.listenerAdded = "true";
    });


    /* =====================================================
       COPY CODE EVENTS
       ===================================================== */

    copyCodes.forEach((el, i) => {

        el.addEventListener("focus", e => {

            iCopyCodes = i;

            lastFocusedMainEl =
                e.target;

        });

    });


    /* =====================================================
       MAIN CONTENT KEYBOARD
       ===================================================== */

    mainTargetDiv.addEventListener(
        "keydown",
        e => {

            const key =
                e.key.toLowerCase();


            /* M */

            if (key === "m") {

                const step =
                    e.target.closest(
                        ".step-float"
                    );

                if (step) {

                    e.preventDefault();

                    stepClicked = false;

                    step.focus();

                    return;
                }
            }


            /* COPY-CODE ENTER */

            if (
                e.target.classList.contains(
                    "copy-code"
                ) &&
                e.key === "Enter"
            ) {

                e.preventDefault();
                e.stopPropagation();

                return;
            }


            /* NUMBER NAV */

            if (
                !Number.isNaN(
                    Number(key)
                )
            ) {
                numStepNav(
                    Number(key)
                );
            }

        }
    );

}


/* =========================================================
   NUMBER STEP NAVIGATION
   ========================================================= */

function numStepNav(intLet) {

    if (!steps.length) return;


    if (intLet >= steps.length) {

        steps[
            steps.length - 1
        ]?.focus();

        return;
    }


    if (!stepClicked) {

        if (
            intLet > 0 &&
            intLet <= steps.length
        ) {
            steps[
                intLet - 1
            ]?.focus();
        }

        return;
    }


    if (
        stepClicked &&
        copyCodes[intLet - 1]
    ) {

        copyCodes[
            intLet - 1
        ].focus();
    }
}


/* =========================================================
   STEP NAV HANDLER
   ========================================================= */

export function handleStepNav({
    e,
    focusZone
}) {

    if (
        focusZone !==
        "mainTargetDiv"
    ) {
        return;
    }

    const key =
        e.key.toLowerCase();


    /* =====================================================
       NUMBER NAVIGATION
       ===================================================== */

    if (
        !Number.isNaN(
            Number(key)
        )
    ) {
        numStepNav(
            Number(key)
        );
    }


    stepFocused =
        !stepFocused;


    /* =====================================================
       F = FORWARD
       ===================================================== */

    if (key === "f") {

        if (!stepClicked) {

            iSteps =
                (iSteps + 1) %
                steps.length;

            steps[iSteps]?.focus();

        } else if (
            copyCodes.length
        ) {

            iCopyCodes =
                (iCopyCodes + 1) %
                copyCodes.length;

            copyCodes[
                iCopyCodes
            ]?.focus();

        }
    }


    if (
        key === "f" &&
        e.target === mainTargetDiv &&
        !stepClicked
    ) {

        iSteps = 0;

        steps[0]?.focus();
    }


    /* =====================================================
       A = BACKWARD
       ===================================================== */

    if (key === "a") {

        if (!stepClicked) {

            iSteps =
                (
                    iSteps -
                    1 +
                    steps.length
                ) %
                steps.length;

            steps[
                iSteps
            ]?.focus();

        } else if (
            copyCodes.length
        ) {

            iCopyCodes =
                (
                    iCopyCodes -
                    1 +
                    copyCodes.length
                ) %
                copyCodes.length;

            copyCodes[
                iCopyCodes
            ]?.focus();
        }
    }


    /* =====================================================
       S = SIDEBAR
       ===================================================== */

    if (key === "s") {

        stepClicked = false;

        if (
            lastClickedSideBarLink
        ) {
            lastClickedSideBarLink.focus();
        }

        return;
    }


    /* =====================================================
       T = TUTORIAL LINK
       ===================================================== */

    if (key === "t") {
        tutorialLink?.focus();
    }
}


/* =========================================================
   SELECTED STEP
   ========================================================= */

document.addEventListener(
    "click",
    e => {

        const step =
            e.target.closest(
                ".step-float"
            );

        if (!step) return;


        document.querySelectorAll(
            ".step-float.selected"
        ).forEach(el => {

            el.classList.remove(
                "selected"
            );

        });


        step.classList.add(
            "selected"
        );

    }
);