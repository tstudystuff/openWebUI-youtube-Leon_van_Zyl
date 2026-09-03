// js/core/inject-content.js

import {
    mainTargetDiv
} from "../nav/main-content-nav.js";

import {
    initStepNavigation,
    removeLastStep
} from "../nav/step-nav.js";

import {
    updateImgs
} from "../ui/toggle-img-sizes.js";

import {
    addCopyCode
} from "../ui/copy-code.js";


export const nxtBtn =
    document.querySelector(
        "#endNxtBtn"
    );

export const prevBtn =
    document.querySelector(
        "#prevBtn"
    );


export const lessonBtnsContainer =
    document.querySelector(
        ".lesson-btns-container"
    );


/* =========================================================
   INJECT CONTENT
   ========================================================= */

export function injectContent(href) {

    console.log(href);


    return fetch(
        href
    )

        /* =================================================
           FETCH HTML
           ================================================= */

        .then(response => {

            if (
                !response.ok
            ) {

                throw new Error(
                    `HTTP error! Status: ${response.status}`
                );

            }


            return response.text();

        })


        /* =================================================
           PARSE / CLEAN / INJECT
           ================================================= */

        .then(html => {

            const parser =
                new DOMParser();


            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            /* =============================================
               CLEAN INVALID URL ATTRIBUTES
               ============================================= */

            doc
                .querySelectorAll(
                    "[src], [href], [action]"
                )
                .forEach(el => {

                    [
                        "src",
                        "href",
                        "action"
                    ].forEach(attr => {

                        const val =
                            el.getAttribute(
                                attr
                            );


                        if (
                            !val ||
                            val === "undefined"
                        ) {

                            el.removeAttribute(
                                attr
                            );

                        }

                    });

                });


            /* =============================================
               REMOVE SCRIPT TAGS

               Injected pages should never initialize their
               own JS.

               The application initializes everything after
               the new DOM has been installed.
               ============================================= */

            doc
                .querySelectorAll(
                    "script"
                )
                .forEach(el => {

                    el.remove();

                });


            /* =============================================
               REMOVE INLINE STYLES

               Preserves your existing CSP behavior.
               ============================================= */

            doc
                .querySelectorAll(
                    "[style]"
                )
                .forEach(el => {

                    el.removeAttribute(
                        "style"
                    );

                });


            /* =============================================
               FIND CONTENT
               ============================================= */

            const content =
                doc.querySelector(
                    "#targetDiv"
                ) ||
                doc.body;


            if (
                !content
            ) {

                throw new Error(
                    "Missing valid content in injected file"
                );

            }


            /* =============================================
               REMOVE OLD LESSON STATE FIRST

               The DOM we are about to destroy should no
               longer be considered the active step.
               ============================================= */

            removeLastStep();


            /* =============================================
               INJECT NEW LESSON

               IMPORTANT:

               innerHTML destroys the old lesson nodes and
               their event listeners.

               The NEW lesson therefore MUST be initialized
               again below.
               ============================================= */

            mainTargetDiv.innerHTML =
                content.innerHTML;


            /* =============================================
               RETURN PROMISE THAT DOES NOT FINISH UNTIL
               NEW LESSON INITIALIZATION IS COMPLETE
               ============================================= */

            return new Promise(resolve => {

                requestAnimationFrame(
                    () => {


                        /* =================================
                           REFRESH MEDIA CACHE

                           Scope this specifically to the
                           NEW injected lesson.
                           ================================= */

                        updateImgs(
                            mainTargetDiv
                        );


                        /* =================================
                           REINITIALIZE STEP NAVIGATION

                           This reconnects listeners to the
                           NEW:

                           .step-float
                           .step-img
                           .step-vid
                           video
                           video control buttons
                           ================================= */

                        initStepNavigation({
                            mainTargetDiv
                        });


                        /* =================================
                           REINITIALIZE COPY CODE
                           ================================= */

                        addCopyCode();


                        /* =================================
                           SCROLL AFTER NEW DOM EXISTS
                           ================================= */

                        window.scrollTo(
                            0,
                            0
                        );


                        /*
                         * injectContent() resolves ONLY NOW.
                         *
                         * Next/Prev/sidebar navigation cannot
                         * treat this lesson as fully loaded
                         * before its media/navigation has
                         * actually been initialized.
                         */
                        resolve();

                    }
                );

            });

        })


        /* =================================================
           ERROR HANDLING
           ================================================= */

        .catch(err => {

            console.error(
                "Failed to load content:",
                err
            );

            throw err;

        });

}