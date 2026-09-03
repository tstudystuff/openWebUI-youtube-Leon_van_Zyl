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
   ========================================================= */

export function initStepNavigation({
    mainTargetDiv
}) {

    if (!mainTargetDiv) return;


    steps = [
        ...mainTargetDiv.querySelectorAll(
            ".step-float"
        )
    ];


    allStepImgVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-img, .step-vid"
        )
    ];


    updateImgs(
        mainTargetDiv
    );


    allVids = [
        ...mainTargetDiv.querySelectorAll(
            ".step-vid > video"
        )
    ];


    /* =====================================================
       CLICK OUTSIDE MEDIA
       ===================================================== */

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


    /* =====================================================
       VIDEO EVENTS
       ===================================================== */

    allVids.forEach(vid => {

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

    });


    /* =====================================================
       IMAGE / VIDEO WRAPPER CLICK
       ===================================================== */

    allStepImgVids.forEach(media => {

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

    });


    /* =====================================================
       STEP EVENTS
       ===================================================== */

    steps.forEach(
        (step, index) => {
            if (step.hasAttribute('data-auto-focus')) {
                step.focus();
            }
            if (
                step.dataset.listenerAdded
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

                    /*
                     * Focusing the step container means
                     * we are navigating STEPS, not inside
                     * the step yet.
                     */
                    stepClicked = false;

                    iSteps = index;
                    iCopyCodes = 0;

                    denlargeAllImages();

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


                    /*
                     * A child of the step received focus.
                     *
                     * This means we've ENTERED the step.
                     */
                    if (
                        e.target !== step
                    ) {

                        stepClicked =
                            true;


                        /*
                         * Keep copy-code state synchronized.
                         */
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


                        /*
                         * Any child focus removes
                         * enlarged image/video state.
                         */
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
                     * Focus stayed somewhere inside
                     * the same step.
                     */
                    if (
                        step.contains(
                            e.relatedTarget
                        )
                    ) {
                        return;
                    }


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
                       LINK SHIFT + ENTER
                       TOGGLE STEP MEDIA SIZE
                       ===================================== */

                    if (
                        key === "Enter" &&
                        e.shiftKey &&
                        e.target.closest("a[href]")
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
                         * Never cycle media from
                         * custom video buttons.
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


                            /*
                             * If Enter enlarges a video,
                             * start playing it.
                             */
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


                            /*
                             * Entering a step begins on
                             * the first copy-code.
                             *
                             * If there is no copy-code,
                             * try the first link.
                             */
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
                                firstCopyCode
                            ) {

                                firstCopyCode
                                    .focus();

                            } else if (
                                firstLink
                            ) {

                                firstLink
                                    .focus();

                            }


                            lastStep =
                                stepFloat;

                        }


                        /* ---------------------------------
                           SHIFT + ENTER
                           RESTART VIDEO
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
                        key ===
                        "ArrowLeft" ||
                        key ===
                        "ArrowRight"
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


                    /*
                     * Clicking a CHILD inside a step means
                     * we've entered the step.
                     */
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
       ===================================================== */

    mainTargetDiv.addEventListener(
        "keydown",
        e => {

            const key =
                e.key.toLowerCase();


            /* =============================================
               M
               RETURN TO CURRENT STEP CONTAINER
               ============================================= */

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


            /* =============================================
               COPY-CODE ENTER
               ============================================= */

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


            /* =============================================
               NUMBER NAV
               ============================================= */

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
     * If we're truly INSIDE a step,
     * numbers target COPY-CODES ONLY.
     *
     * The step container itself does not count.
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
     * Outside a step, or focused directly on
     * a step container:
     *
     * numbers select corresponding steps.
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
           NAVIGATE THROUGH STEPS
           --------------------------------------------- */

        if (!steps.length) return;


        /*
         * When beginning from mainTargetDiv,
         * start at step 1.
         */
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
           NAVIGATE THROUGH STEPS
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