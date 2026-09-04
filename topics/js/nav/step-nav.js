// js/nav/step-nav.js

import {
    cycleStepMedia,
    denlargeAllImages,
    updateImgs,
    clickToggleEnlarge,
    toggleStepMedia
} from "../ui/toggle-img-sizes.js";

import {
    videoControls,
    pauseAllVideos,
    resetVideoToPoster
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
   REINITIALIZATION SAFETY

   Lessons are dynamically injected.

   initStepNavigation() MUST be allowed to run again after
   every lesson load.

   These two listeners belong to permanent DOM elements,
   so they should only ever be attached ONCE.
   ========================================================= */

let documentMediaListenerAdded = false;
let mainTargetListenerAdded = false;


/*
 * Normal child focus should still shrink enlarged media.
 *
 * The ONE exception is when Enter enlarges media and then
 * programmatically moves focus to the first copy-code/link.
 *
 * In that case preserve the media that was just enlarged.
 */
let preserveMediaOnChildFocus = false;


/* =========================================================
   STATE HELPERS
   ========================================================= */

export function removeLastStep() {

    lastStep = null;

}


function updateCurrentCopyCodes({
    step
}) {

    copyCodes = [
        ...step.querySelectorAll(
            ".copy-code"
        )
    ];

}


function getStepFocusableItems(step) {

    return [
        ...step.querySelectorAll(
            ".copy-code, a[href]"
        )
    ];

}


/* =========================================================
   INITIALIZE STEP NAVIGATION

   IMPORTANT:

   This function is intentionally safe to call again after
   injectContent() replaces the lesson DOM.

   New lesson:
       new .step-float elements
       new .step-img elements
       new .step-vid elements
       new <video> elements

   Therefore those NEW elements need NEW listeners.
   ========================================================= */

export function initStepNavigation({
    mainTargetDiv
}) {

    if (!mainTargetDiv) return;


    /* =====================================================
       REFRESH STEP CACHE
       ===================================================== */

    steps = [
        ...mainTargetDiv.querySelectorAll(
            ".step-float"
        )
    ];


    /* =====================================================
       REFRESH MEDIA CACHE
       ===================================================== */

    allStepImgVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    /*
     * toggle-img-sizes.js also maintains its own cache.
     *
     * This MUST be refreshed after every injected lesson.
     */
    updateImgs(
        mainTargetDiv
    );


    /* =====================================================
       REFRESH VIDEO CACHE
       ===================================================== */

    allVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-vid > video"
        )
    ];


    /* =====================================================
       CLICK OUTSIDE MEDIA

       document survives lesson injection.

       Attach this listener ONCE.
       ===================================================== */

    if (
        !documentMediaListenerAdded
    ) {

        document.addEventListener(
            "pointerdown",
            e => {

                const media =
                    e.target.closest(
                        ".step-img, .step-vid"
                    );


                if (media) return;


                denlargeAllImages();

            }
        );


        documentMediaListenerAdded =
            true;

    }


    /* =====================================================
       VIDEO EVENTS

       These videos are NEW after each lesson injection,
       so these listeners MUST be attached again.
       ===================================================== */

    allVids.forEach(vid => {

        /*
         * Prevent accidental duplicate listeners if this
         * function is called twice on the SAME lesson DOM.
         */
        if (
            vid.dataset.stepVideoListenerAdded ===
            "true"
        ) {

            return;

        }


        const stepVid =
            vid.closest(
                ".step-vid"
            );


        if (!stepVid) return;


        /* -------------------------------------------------
           CLICK VIDEO
           ------------------------------------------------- */

        vid.addEventListener(
            "click",
            e => {

                e.preventDefault();
                e.stopPropagation();


                videoControls({
                    vid,
                    e
                });

            }
        );


        /* -------------------------------------------------
           VIDEO KEYBOARD
           ------------------------------------------------- */

        vid.addEventListener(
            "keydown",
            e => {

                e.stopPropagation();


                videoControls({
                    vid,
                    e
                });

            }
        );


        /* -------------------------------------------------
           CUSTOM VIDEO CONTROL BUTTONS
           ------------------------------------------------- */

        const controlButtons =
            stepVid.querySelectorAll(
                ".vid-cntrl-btns button"
            );


        controlButtons.forEach(button => {

            button.addEventListener(
                "click",
                e => {

                    e.preventDefault();
                    e.stopPropagation();


                    videoControls({
                        vid,
                        e
                    });

                }
            );

        });


        vid.dataset.stepVideoListenerAdded =
            "true";

    });


    /* =====================================================
       IMAGE / VIDEO WRAPPER CLICK

       Media wrappers are NEW after lesson injection,
       therefore these listeners also need to be recreated.
       ===================================================== */

    allStepImgVids.forEach(media => {

        if (
            media.dataset.mediaClickListenerAdded ===
            "true"
        ) {

            return;

        }


        media.addEventListener(
            "click",
            e => {

                /*
                 * Never resize from video controls.
                 */
                if (
                    e.target.closest(
                        ".vid-cntrl-btns"
                    )
                ) {

                    return;

                }


                e.preventDefault();
                e.stopPropagation();


                clickToggleEnlarge({
                    e
                });

            }
        );


        media.dataset.mediaClickListenerAdded =
            "true";

    });


    /* =====================================================
       STEP EVENTS

       .step-float elements are NEW after injection,
       so every new step receives its listeners.
       ===================================================== */

    steps.forEach(
        (step, index) => {


            if (
                step.hasAttribute(
                    "data-auto-focus"
                )
            ) {

                step.focus();

            }


            /*
             * Protect against initialization twice on
             * the SAME lesson DOM.
             */
            if (
                step.dataset.listenerAdded ===
                "true"
            ) {

                return;

            }


            step.setAttribute(
                "tabindex",
                "0"
            );


            /* =============================================
               STEP FOCUS
               ============================================= */

            step.addEventListener(
                "focus",
                e => {

                    stepClicked =
                        false;


                    iSteps =
                        index;


                    iCopyCodes =
                        0;


                    denlargeAllImages();


                    /*
                     * Freshly arriving at a step resets
                     * the media cycle BEFORE the first item.
                     *
                     * cycleStepMedia():
                     *
                     * -1 -> 0
                     *
                     * Therefore first Enter enlarges
                     * the FIRST media item.
                     */
                    step.dataset.mediaIndex =
                        -1;


                    preserveMediaOnChildFocus =
                        false;


                    lastStep =
                        step;


                    step.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });


                    if (
                        e.target ===
                        steps[
                        steps.length - 1
                        ] &&
                        steps.length > 3
                    ) {

                        mainContainer
                            ?.scrollIntoView({
                                behavior:
                                    "smooth",

                                block:
                                    "end",

                                container:
                                    "all"
                            });

                    }


                    pauseAllVideos({
                        allVids
                    });

                }
            );


            /* =============================================
               STEP FOCUS IN
               ============================================= */

            step.addEventListener(
                "focusin",
                e => {

                    iSteps =
                        index;


                    if (
                        e.target !== step
                    ) {

                        stepClicked =
                            true;


                        /* ---------------------------------
                           COPY-CODE STATE
                           --------------------------------- */

                        if (
                            e.target.classList
                                ?.contains(
                                    "copy-code"
                                )
                        ) {

                            updateCurrentCopyCodes({
                                step
                            });


                            const copyIndex =
                                copyCodes.indexOf(
                                    e.target
                                );


                            if (
                                copyIndex !== -1
                            ) {

                                iCopyCodes =
                                    copyIndex;

                            }


                            lastFocusedMainEl =
                                e.target;

                        }


                        /* ---------------------------------
                           ENTER-INITIATED CHILD FOCUS

                           Enter just enlarged media and
                           moved focus into the step.

                           Keep that newly enlarged media.
                           --------------------------------- */

                        if (
                            preserveMediaOnChildFocus
                        ) {

                            preserveMediaOnChildFocus =
                                false;


                            return;

                        }


                        /* ---------------------------------
                           NORMAL CHILD FOCUS

                           Existing behavior preserved:
                           moving normally to a child inside
                           a step removes enlargement.
                           --------------------------------- */

                        step.querySelectorAll(
                            ".step-img.enlarge, .step-vid.enlarge"
                        ).forEach(media => {

                            media.classList.remove(
                                "enlarge"
                            );


                            media.classList.remove(
                                "first-vid-enlarge"
                            );

                        });

                    }

                }
            );


            /* =============================================
               STEP FOCUS OUT
               ============================================= */

            step.addEventListener(
                "focusout",
                e => {

                    /*
                     * Focus stayed inside this same step.
                     */
                    if (
                        step.contains(
                            e.relatedTarget
                        )
                    ) {

                        return;

                    }


                    preserveMediaOnChildFocus =
                        false;


                    denlargeAllImages();

                }
            );


            /* =============================================
               STEP KEYBOARD
               ============================================= */

            step.addEventListener(
                "keydown",
                e => {

                    const key =
                        e.key;


                    const stepFloat =
                        e.target.closest(
                            ".step-float"
                        );


                    if (!stepFloat) return;
                    /* =====================================
                   SHIFT + ENTER
                   RESET PLAYING VIDEO TO POSTER
                
                   IMPORTANT:
                
                   This happens BEFORE all other
                   Shift + Enter behavior.
                
                   If a video is actively playing:
                       - pause
                       - reset to 0
                       - restore poster
                       - stop here
                
                   If the video is already paused:
                       normal Shift + Enter continues.
                   ===================================== */

                    if (
                        key === "Enter" &&
                        e.shiftKey
                    ) {

                        const playingVid =
                            [
                                ...stepFloat.querySelectorAll(
                                    ".step-vid video"
                                )
                            ]
                                .find(vid => !vid.paused);


                        if (
                            playingVid
                        ) {

                            e.preventDefault();
                            e.stopPropagation();


                            resetVideoToPoster(
                                playingVid
                            );


                            return;

                        }

                    }

                    /* =====================================
                       LINK SHIFT + ENTER
                       ===================================== */

                    if (
                        key === "Enter" &&
                        e.shiftKey &&
                        e.target.closest(
                            "a[href]"
                        )
                    ) {

                        e.preventDefault();
                        e.stopPropagation();


                        toggleStepMedia(
                            stepFloat
                        );


                        return;

                    }


                    /* =====================================
                       ENTER / SHIFT + ENTER
                       ===================================== */

                    if (
                        key === "Enter"
                    ) {

                        /*
                         * Video buttons keep their own
                         * existing behavior.
                         */
                        if (
                            e.target.closest(
                                ".vid-cntrl-btns"
                            )
                        ) {

                            return;

                        }


                        changeTutorialLink(
                            e
                        );


                        /* ---------------------------------
                           NORMAL ENTER
                           --------------------------------- */

                        if (
                            !e.shiftKey
                        ) {

                            const firstFocusable =
                                getStepFocusableItems(
                                    stepFloat
                                )[0];


                            if (
                                e.target === stepFloat &&
                                firstFocusable?.matches(
                                    "a[href]"
                                )
                            ) {

                                e.preventDefault();


                                stepClicked =
                                    true;


                                firstFocusable
                                    .focus();


                                lastStep =
                                    stepFloat;


                                return;

                            }

                            updateCurrentCopyCodes({
                                step:
                                    stepFloat
                            });


                            stepClicked =
                                true;


                            const enlargedMedia =
                                cycleStepMedia(
                                    stepFloat
                                );


                            /* ---------------------------------
                               VIDEO

                               If cycling lands on a video,
                               use existing videoControls().
                               --------------------------------- */

                            if (
                                enlargedMedia
                                    ?.classList
                                    .contains(
                                        "step-vid"
                                    )
                            ) {

                                const vid =
                                    enlargedMedia
                                        .querySelector(
                                            "video"
                                        );


                                if (vid) {

                                    videoControls({
                                        vid,
                                        e
                                    });

                                }

                            }


                            /* ---------------------------------
                               ENTER STEP CONTENT
                               --------------------------------- */

                            const firstCopyCode =
                                stepFloat
                                    .querySelector(
                                        ".copy-code"
                                    );


                            const firstLink =
                                stepFloat
                                    .querySelector(
                                        "a[href]"
                                    );


                            if (
                                firstCopyCode &&
                                document.activeElement !==
                                firstCopyCode
                            ) {

                                preserveMediaOnChildFocus =
                                    true;


                                firstCopyCode
                                    .focus();

                            } else if (
                                !firstCopyCode &&
                                firstLink &&
                                document.activeElement !==
                                firstLink
                            ) {

                                preserveMediaOnChildFocus =
                                    true;


                                firstLink
                                    .focus();

                            }


                            lastStep =
                                stepFloat;

                        }


                        /* ---------------------------------
                           SHIFT + ENTER
                           --------------------------------- */

                        else {

                            stepFloat.focus();


                            const enlargedMedia =
                                cycleStepMedia(
                                    stepFloat
                                );


                            if (
                                enlargedMedia
                                    ?.classList
                                    .contains(
                                        "step-vid"
                                    )
                            ) {

                                const vid =
                                    enlargedMedia
                                        .querySelector(
                                            "video"
                                        );


                                if (vid) {

                                    vid.currentTime =
                                        0;


                                    videoControls({
                                        vid,
                                        e
                                    });

                                }

                            }

                        }


                        return;

                    }


                    /* =====================================
                       VIDEO KEYBOARD CONTROLS
                       ===================================== */

                    const stepVid =
                        stepFloat
                            .querySelector(
                                ".step-vid"
                            );


                    if (!stepVid) return;


                    const vid =
                        stepVid
                            .querySelector(
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

                }
            );


            /* =============================================
               STEP CLICK
               ============================================= */

            step.addEventListener(
                "click",
                e => {

                    changeTutorialLink(
                        e
                    );


                    const clickedInteractiveElement =
                        e.target.closest(
                            "a[href], button, input, select, textarea, " +
                            "[contenteditable='true'], .copy-code, .step-img, .step-vid"
                        );


                    const firstFocusable =
                        getStepFocusableItems(
                            step
                        )[0];


                    if (
                        !clickedInteractiveElement &&
                        firstFocusable?.matches(
                            "a[href]"
                        )
                    ) {

                        stepClicked =
                            true;


                        firstFocusable
                            .focus();


                        lastStep =
                            step;


                        return;

                    }


                    if (
                        e.target !== step
                    ) {

                        stepClicked =
                            true;

                    }

                }
            );


            step.dataset.listenerAdded =
                "true";

        }
    );


    /* =====================================================
       MAIN CONTENT KEYBOARD

       mainTargetDiv survives lesson injection.

       Therefore this listener must only be attached ONCE.
       ===================================================== */

    if (
        !mainTargetListenerAdded
    ) {

        mainTargetDiv.addEventListener(
            "keydown",
            e => {

                const key =
                    e.key.toLowerCase();


                /* =========================================
                   M
                   RETURN TO CURRENT STEP CONTAINER
                   ========================================= */

                if (
                    key === "m"
                ) {

                    const step =
                        e.target.closest(
                            ".step-float"
                        );


                    if (step) {

                        e.preventDefault();
                        e.stopPropagation();


                        stepClicked =
                            false;


                        step.focus();


                        return;

                    }

                }


                /* =========================================
                   COPY-CODE ENTER
                   ========================================= */

                if (
                    e.target.classList
                        .contains(
                            "copy-code"
                        ) &&
                    e.key === "Enter"
                ) {

                    e.preventDefault();
                    e.stopPropagation();


                    return;

                }


                /* =========================================
                   NUMBER NAV
                   ========================================= */

                if (
                    /^[1-9]$/.test(
                        key
                    )
                ) {

                    e.preventDefault();


                    numStepNav(
                        Number(key),
                        e.target
                    );

                }

            }
        );


        mainTargetListenerAdded =
            true;

    }

}


/* =========================================================
   NUMBER STEP NAVIGATION
   ========================================================= */

function numStepNav(
    intLet,
    target = document.activeElement
) {

    if (!steps.length) return;


    const currentStep =
        target
            ?.closest
            ?.(".step-float");


    /*
     * If truly INSIDE a step,
     * numbers target COPY-CODES ONLY.
     */
    if (
        currentStep &&
        target !== currentStep
    ) {

        updateCurrentCopyCodes({
            step:
                currentStep
        });


        const copyCode =
            copyCodes[
            intLet - 1
            ];


        if (copyCode) {

            iCopyCodes =
                intLet - 1;


            copyCode.focus();

        }


        return;

    }


    /*
     * Outside a step or directly on the step:
     * numbers select steps.
     */
    if (
        intLet > 0 &&
        intLet <= steps.length
    ) {

        iSteps =
            intLet - 1;


        stepClicked =
            false;


        steps[
            iSteps
        ]?.focus();

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
        /^[1-9]$/.test(
            key
        )
    ) {

        e.preventDefault();


        numStepNav(
            Number(key),
            e.target
        );


        return;

    }


    stepFocused =
        !stepFocused;


    /* =====================================================
       F = FORWARD
       ===================================================== */

    if (
        key === "f"
    ) {

        const currentStep =
            e.target
                .closest
                ?.(".step-float");


        const insideStep =
            currentStep &&
            e.target !== currentStep;


        /* ---------------------------------------------
           INSIDE STEP
           COPY-CODES + LINKS
           --------------------------------------------- */

        if (
            insideStep
        ) {

            const focusableItems =
                getStepFocusableItems(
                    currentStep
                );


            if (
                !focusableItems.length
            ) {

                return;

            }


            const currentIndex =
                focusableItems
                    .indexOf(
                        document.activeElement
                    );


            const nextIndex =
                currentIndex === -1

                    ? 0

                    : (
                        currentIndex +
                        1
                    ) %
                    focusableItems.length;


            focusableItems[
                nextIndex
            ]?.focus();


            return;

        }


        /* ---------------------------------------------
           STEP CONTAINER
           --------------------------------------------- */

        if (!steps.length) return;


        if (
            e.target ===
            mainTargetDiv
        ) {

            iSteps =
                0;

        } else {

            iSteps =
                (
                    iSteps +
                    1
                ) %
                steps.length;

        }


        stepClicked =
            false;


        steps[
            iSteps
        ]?.focus();


        return;

    }


    /* =====================================================
       A = BACKWARD
       ===================================================== */

    if (
        key === "a"
    ) {

        const currentStep =
            e.target
                .closest
                ?.(".step-float");


        const insideStep =
            currentStep &&
            e.target !== currentStep;


        /* ---------------------------------------------
           INSIDE STEP
           COPY-CODES + LINKS
           --------------------------------------------- */

        if (
            insideStep
        ) {

            const focusableItems =
                getStepFocusableItems(
                    currentStep
                );


            if (
                !focusableItems.length
            ) {

                return;

            }


            const currentIndex =
                focusableItems
                    .indexOf(
                        document.activeElement
                    );


            const previousIndex =
                currentIndex === -1

                    ? focusableItems.length -
                    1

                    : (
                        currentIndex -
                        1 +
                        focusableItems.length
                    ) %
                    focusableItems.length;


            focusableItems[
                previousIndex
            ]?.focus();


            return;

        }


        /* ---------------------------------------------
           STEP CONTAINER
           --------------------------------------------- */

        if (!steps.length) return;


        iSteps =
            (
                iSteps -
                1 +
                steps.length
            ) %
            steps.length;


        stepClicked =
            false;


        steps[
            iSteps
        ]?.focus();


        return;

    }


    /* =====================================================
       S = SIDEBAR
       ===================================================== */

    if (
        key === "s"
    ) {

        stepClicked =
            false;


        if (
            lastClickedSideBarLink
        ) {

            lastClickedSideBarLink
                .focus();

        }


        return;

    }


    /* =====================================================
       T = TUTORIAL LINK
       ===================================================== */

    if (
        key === "t"
    ) {

        tutorialLink
            ?.focus();

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


        document
            .querySelectorAll(
                ".step-float.selected"
            )
            .forEach(el => {

                el.classList.remove(
                    "selected"
                );

            });


        step.classList.add(
            "selected"
        );

    }
);
