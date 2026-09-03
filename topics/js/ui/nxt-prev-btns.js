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
        currentIndex + direction;


    const targetLink =
        allLinks[targetIndex];


    if (!targetLink) return;


    // Reopen sidebar
    mainContainer.classList.remove("collapsed");


    // Focus corresponding lesson
    targetLink.click();


    // Use existing sidebar behavior
    targetLink.click();
}