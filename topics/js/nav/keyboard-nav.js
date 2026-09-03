// nav/keyboard-nav.js

import { letterFocus } from "./letter-focus.js";

let letterNavMode = false;

export function initKeyboardNav() {

    document.addEventListener("keydown", e => {

        // Cmd + Shift + X
        if (
            e.metaKey &&
            e.shiftKey &&
            e.key.toLowerCase() === "x"
        ) {
            e.preventDefault();

            toggleLetterNavMode();

            return;
        }


        // normal navigation remains handled elsewhere
        if (!letterNavMode) return;


        // when letter-nav mode is active,
        // ONLY use letterFocus for normal single-key navigation

        if (
            e.metaKey ||
            e.ctrlKey ||
            e.altKey
        ) {
            return;
        }


        const tag = e.target.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            e.target.isContentEditable
        ) {
            return;
        }


        const key = e.key.toLowerCase();

        if (!/^[a-z0-9]$/.test(key)) return;


        e.preventDefault();
        e.stopImmediatePropagation();

        letterFocus({
            e,
            focusZone: "letterNav"
        });

    }, true);
}


function toggleLetterNavMode() {

    letterNavMode = !letterNavMode;

    document.body.classList.toggle(
        "letter-nav-mode",
        letterNavMode
    );

    showLetterNavPopup();

    console.log(
        `Letter navigation: ${letterNavMode ? "ON" : "OFF"}`
    );
}


export function isLetterNavMode() {
    return letterNavMode;
}


function showLetterNavPopup() {

    let popup =
        document.querySelector("#letterNavModePopup");


    if (!popup) {

        popup = document.createElement("div");

        popup.id = "letterNavModePopup";

        popup.setAttribute(
            "aria-live",
            "polite"
        );

        document.body.appendChild(popup);
    }


    popup.textContent =
        letterNavMode
            ? "Letter Navigation ON"
            : "Letter Navigation OFF";


    popup.classList.add("show");


    clearTimeout(
        showLetterNavPopup.timeout
    );


    showLetterNavPopup.timeout =
        setTimeout(() => {

            popup.classList.remove("show");

        }, 1400);
}