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


    const currentIndex =
        allLinks.indexOf(lastClickedSideBarLink);


    if (currentIndex === -1) return;


    const targetIndex =
        (currentIndex + direction + allLinks.length) %
        allLinks.length;


    const targetLink =
        allLinks[targetIndex];

    // if (!targetLink) return;


    // Reopen sidebar
    mainContainer.classList.remove("collapsed");


    /*
     * IMPORTANT:
     *
     * Click the target lesson ONCE.
     *
     * The sidebar link's existing click behavior
     * already handles loading / injecting the lesson.
     *
     * Clicking it twice can cause the newly initialized
     * lesson DOM to immediately be replaced by a second
     * injection, leaving the final media without its
     * event listeners.
     */
    targetLink.click();
}