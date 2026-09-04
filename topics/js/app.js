// main-script.js
// ===== Imports =====
import { setupLessonButtons } from "./ui/nxt-prev-btns.js";
import { injectContent } from "./core/inject-content.js";
import { updateAllSideBarLinks } from "./nav/side-bar-nav.js";
// const nxtBtn = document.querySelector('#endNxtBtn');
// const prevBtn = document.querySelector('#prevBtn');
import { initTutorialLink } from "./ui/change-tutorial-link.js";
import { letterFocus } from "./nav/letter-focus.js";
import { getFocusZone } from "./nav/get-focus-zone.js";
import { initDropDowns, hideTopicSnips } from "./ui/drop-downs-sidebar-temp.js";
import { handleStepNav, lastStep } from "./nav/step-nav.js";
import { initToggleSidebar, mainContainer, sideBar, sideBarBtn } from "./ui/toggle-side-bar.js";
import { sideBarNav, lastClickedSideBarLink, lastFocusedSideBarLink } from "./nav/side-bar-nav.js";
import { mainContentNav, mainTargetDiv } from "./nav/main-content-nav.js";
import { initKeyboardNav } from "./nav/keyboard-nav.js";
export const navBarLessonTitle = document.querySelector('#navBarLessonTitle');
export const tutorialLink = document.querySelector('#tutorialLink')
export const homepage = document.querySelector('#homePageLink')
export const homepageSideBar = document.querySelector('#homepageSidebar')
// This is event listener is sloppy, fix in colorCode template
navBarLessonTitle.addEventListener('keydown', e => {
    let key = e.key.toLowerCase()
    if (key === 's') {
        sideBarBtn.focus()
        scrollTo(0, 0)
        return
    }
});
// ===== Initialization =====
document.addEventListener('DOMContentLoaded', initMain);
function initMain(e) {
    // Prevent re-initialization if script runs twice (e.g. reinjected content)
    if (window._mainScriptInitialized) return;
    initTutorialLink()
    window._mainScriptInitialized = true;
    // Initialize UI elements
    initKeyboardNav()
    initDropDowns({ e });
    initToggleSidebar({ e });
    // Detect and handle initial focus zone
    const initialZone = getFocusZone({ el: document.activeElement });
    // const initialZone = 'sideBar'
    if (initialZone === 'sideBar') sideBarNav({ e, focusZone: initialZone });
    // letterFocus({ e, focusZone: initialZone });
    // Initialize event listeners
    setupSidebarShortcuts();
    setupGlobalKeyListener();
}
// ===== Sidebar “S” Key Shortcut =====
function setupSidebarShortcuts() {
    if (!sideBarBtn || !navBarLessonTitle) return;
    sideBarBtn.addEventListener('keydown', handleSKeySideBarNav);
    navBarLessonTitle.addEventListener('keydown', handleSKeySideBarNav);
}
export function handleSKeySideBarNav(e) {
    const key = e.key.toLowerCase();
    if (key === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (mainContainer.classList.contains('collapsed')) {
            mainContainer.classList.remove('collapsed')
        }
        // Ensure references exist before using them
        if (!lastClickedSideBarLink && !lastFocusedSideBarLink) return;
        const dropSnips = lastClickedSideBarLink?.closest?.('ul');
        if (!mainContainer.classList.contains('collapsed')) {

            if (lastClickedSideBarLink && dropSnips && !dropSnips.classList.contains('hide')) {
                lastClickedSideBarLink.focus();
            } else if (lastFocusedSideBarLink) {
                lastFocusedSideBarLink?.focus();
            }
        } else {
            return
        }
    }
}
// ===== Global Key Listener =====
function setupGlobalKeyListener() {

    addEventListener('keydown', (e) => {

        if (!e || !e.key) return;

        const key = e.key.toLowerCase();

        let focusZone = getFocusZone({ e });


        if (key === 't') {
            tutorialLink.focus();
            return;
        }


        const allowedKeys = [
            'b',
            'c',
            'd',
            'e',
            'h',
            'p',
            'n'
        ];

        if (allowedKeys.includes(key)) {
            focusZone = 'header';
        }


        if (e.target === mainTargetDiv) {

            focusZone = 'mainTargetDiv';

            if (key === 'enter') {

                const firstStep =
                    mainTargetDiv.querySelector('.step-float');

                firstStep?.focus();
            }
        }


        switch (focusZone) {

            case 'sideBar':

                sideBarNav({
                    e,
                    focusZone
                });

                break;


            case 'mainTargetDiv':

                mainContentNav({
                    e,
                    focusZone
                });

                break;


            case 'header':

                letterFocus({
                    e,
                    focusZone
                });

                break;
        }


        if (key === 'h') {

            if (e.target.id === 'homepageSidebar') {

                homepage.focus();

            } else if (
                e.target.dataset.id === 'homePageLink'
            ) {

                homepageSideBar.focus();
            }
        }
    });


    setupLessonButtons(
        document.querySelector('#endNxtBtn'),
        document.querySelector('#prevBtn')
    );
}

function setHighlight(el) {
    document.querySelectorAll('.side-bar-links a.highlight')
        .forEach(a => a.classList.remove('highlight'));

    el?.classList.add('highlight');
}
