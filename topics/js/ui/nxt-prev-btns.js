// ui/nxt-prev-btns.js

import {
    updateAllSideBarLinks,
    lastClickedSideBarLink
} from "../nav/side-bar-nav.js";

import {
    mainContainer
} from "./toggle-side-bar.js";


export function setupLessonButtons(nxtBtn, prevBtn) {

    if (!nxtBtn || !prevBtn) return;


    nxtBtn.addEventListener("click", (e) => {
        e.preventDefault();

        navigateLesson(1);
    });


    prevBtn.addEventListener("click", (e) => {
        e.preventDefault();

        navigateLesson(-1);
    });
}


export function navigateLesson(direction) {

    const allLinks = [
        ...updateAllSideBarLinks()
    ];


    if (!allLinks.length) return;


    const currentIndex =
        allLinks.indexOf(lastClickedSideBarLink);


    let targetIndex;


    /*
     * NO LESSON SELECTED YET
     *
     * Example: homepage.html is currently showing.
     *
     * Next     -> first sidebar lesson
     * Previous -> last sidebar lesson
     */
    if (currentIndex === -1) {

        targetIndex =
            direction === 1
                ? 0
                : allLinks.length - 1;

    } else {

        /*
         * NORMAL LESSON NAVIGATION
         */
        targetIndex =
            currentIndex + direction;


        /*
         * NEXT from last lesson -> first lesson
         */
        if (targetIndex >= allLinks.length) {

            targetIndex = 0;

        }


        /*
         * PREVIOUS from first lesson -> last lesson
         */
        if (targetIndex < 0) {

            targetIndex =
                allLinks.length - 1;

        }

    }


    const targetLink =
        allLinks[targetIndex];


    if (!targetLink) return;


    // Existing behavior
    mainContainer.classList.remove(
        "collapsed"
    );


    // Use existing sidebar click behavior
    targetLink.click();
}