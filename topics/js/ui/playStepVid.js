// js/ui/playStepVid.js

let playing = false;

const ACTIVE_CLASS = "control-active";
const CONTROL_FLASH_TIME = 180;


/* =========================================================
   VIDEO / CONTROL HELPERS
   ========================================================= */

function getStepVid(vid) {

    return vid?.closest(
        ".step-vid"
    );

}


function getControls(vid) {

    const stepVid =
        getStepVid(vid);


    if (!stepVid) {

        return {
            rewindBtn: null,
            playBtn: null,
            forwardBtn: null
        };

    }


    return {

        /*
         * Existing HTML/button naming preserved.
         */
        rewindBtn:
            stepVid.querySelector(
                ".fwdBtn"
            ),

        playBtn:
            stepVid.querySelector(
                ".playbtn"
            ),

        forwardBtn:
            stepVid.querySelector(
                ".rwdBtn"
            )

    };

}


/* =========================================================
   MOBILE / ENLARGED VIDEO SIZE SYNC
   ========================================================= */

function syncVideoSize(vid) {

    if (!vid) return;


    const stepVid =
        getStepVid(vid);


    if (!stepVid) return;


    const enlarged =
        stepVid.classList.contains(
            "enlarge"
        ) ||
        stepVid.classList.contains(
            "first-vid-enlarge"
        );


    if (enlarged) {

        /*
         * Critical mobile fix:
         *
         * The wrapper already enlarges.
         * Force the real video element to fill it.
         */
        vid.style.width =
            "100%";

        vid.style.maxWidth =
            "100%";

        vid.style.height =
            "auto";

        vid.style.display =
            "block";


    } else {

        /*
         * Hand control back to normal CSS.
         */
        vid.style.removeProperty(
            "width"
        );

        vid.style.removeProperty(
            "max-width"
        );

        vid.style.removeProperty(
            "height"
        );

        vid.style.removeProperty(
            "display"
        );

    }

}


/* =========================================================
   BUTTON FEEDBACK
   ========================================================= */

function flashButton(button) {

    if (!button) return;


    button.classList.add(
        ACTIVE_CLASS
    );


    window.setTimeout(
        () => {

            button.classList.remove(
                ACTIVE_CLASS
            );

        },
        CONTROL_FLASH_TIME
    );

}


/* =========================================================
   PLAY BUTTON STATE
   ========================================================= */

export function updatePlayButton(vid) {

    if (!vid) return;


    const {
        playBtn
    } = getControls(vid);


    if (!playBtn) return;


    if (vid.paused) {

        playBtn.textContent =
            "▶";

        playBtn.classList.remove(
            "is-playing"
        );

        playBtn.setAttribute(
            "aria-label",
            "Play video"
        );


    } else {

        playBtn.textContent =
            "❚❚";

        playBtn.classList.add(
            "is-playing"
        );

        playBtn.setAttribute(
            "aria-label",
            "Pause video"
        );

    }

}


/* =========================================================
   PLAY
   ========================================================= */

function playVideo(vid) {

    if (!vid) return;


    playing = true;


    syncVideoSize(
        vid
    );


    const playPromise =
        vid.play();


    /*
     * Some browsers can return undefined
     * instead of a Promise.
     */
    if (
        playPromise &&
        typeof playPromise.then ===
        "function"
    ) {

        playPromise
            .then(() => {

                playing =
                    true;

                syncVideoSize(
                    vid
                );

                updatePlayButton(
                    vid
                );

            })
            .catch(() => {

                playing =
                    false;

                syncVideoSize(
                    vid
                );

                updatePlayButton(
                    vid
                );

            });


        return;
    }


    updatePlayButton(
        vid
    );

}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseVideo(vid) {

    if (!vid) return;


    playing =
        false;


    vid.pause();


    syncVideoSize(
        vid
    );


    updatePlayButton(
        vid
    );

}


/* =========================================================
   TOGGLE PLAY / PAUSE
   ========================================================= */

function togglePlayPause(vid) {

    if (!vid) return;


    const {
        playBtn
    } = getControls(vid);


    flashButton(
        playBtn
    );


    if (vid.paused) {

        playVideo(
            vid
        );

    } else {

        pauseVideo(
            vid
        );

    }

}


/* =========================================================
   REWIND
   ========================================================= */

function rewindVideo(vid) {

    if (!vid) return;


    const {
        rewindBtn
    } = getControls(vid);


    flashButton(
        rewindBtn
    );


    vid.currentTime =
        Math.max(
            0,
            vid.currentTime - 0.5
        );

}


/* =========================================================
   FORWARD
   ========================================================= */

function forwardVideo(vid) {

    if (!vid) return;


    const {
        forwardBtn
    } = getControls(vid);


    flashButton(
        forwardBtn
    );


    const nextTime =
        vid.currentTime + 0.5;


    if (
        Number.isFinite(
            vid.duration
        )
    ) {

        vid.currentTime =
            Math.min(
                vid.duration,
                nextTime
            );


    } else {

        vid.currentTime =
            nextTime;

    }

}


/* =========================================================
   PAUSE ALL VIDEOS
   ========================================================= */

export function pauseAllVideos({
    allVids
}) {

    if (!allVids?.forEach) {
        return;
    }


    allVids.forEach(vid => {

        const stepVid =
            getStepVid(
                vid
            );


        stepVid?.classList.remove(
            "enlarge"
        );

        stepVid?.classList.remove(
            "first-vid-enlarge"
        );


        /*
         * Restore normal video CSS after
         * removing enlarged state.
         */
        syncVideoSize(
            vid
        );


        if (!vid.paused) {

            vid.pause();

        }


        updatePlayButton(
            vid
        );

    });


    playing =
        false;

}


/* =========================================================
   VIDEO CLICK

   Clicking the actual VIDEO toggles the
   .step-vid wrapper enlargement.

   Control buttons do not come through here.
   ========================================================= */

export function toggleVideoSizeClick({
    vid
}) {

    if (!vid) return;


    const stepVid =
        getStepVid(
            vid
        );


    if (!stepVid) return;


    const willEnlarge =
        !stepVid.classList.contains(
            "enlarge"
        );


    stepVid.classList.toggle(
        "enlarge"
    );


    stepVid.classList.remove(
        "first-vid-enlarge"
    );


    /*
     * Immediately synchronize the actual
     * <video> with its wrapper.
     */
    syncVideoSize(
        vid
    );


    if (willEnlarge) {

        playVideo(
            vid
        );

    } else {

        pauseVideo(
            vid
        );

    }

}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function videoKeyControl({
    vid,
    e
}) {

    if (!vid || !e) {
        return;
    }


    switch (e.key) {


        /* -------------------------------------------------
           ENTER
           ------------------------------------------------- */

        case "Enter": {

            const stepVid =
                getStepVid(
                    vid
                );


            syncVideoSize(
                vid
            );


            if (
                stepVid?.classList.contains(
                    "enlarge"
                )
            ) {

                playVideo(
                    vid
                );

            } else {

                pauseVideo(
                    vid
                );

            }


            break;
        }


        /* -------------------------------------------------
           SPACE
           ------------------------------------------------- */

        case " ": {

            e.preventDefault();


            if (
                Number.isFinite(
                    vid.duration
                ) &&
                vid.currentTime >=
                vid.duration
            ) {

                vid.currentTime =
                    0;

            }


            togglePlayPause(
                vid
            );


            break;
        }


        /* -------------------------------------------------
           LEFT
           ------------------------------------------------- */

        case "ArrowLeft": {

            e.preventDefault();


            rewindVideo(
                vid
            );


            break;
        }


        /* -------------------------------------------------
           RIGHT
           ------------------------------------------------- */

        case "ArrowRight": {

            e.preventDefault();


            forwardVideo(
                vid
            );


            break;
        }

    }

}


/* =========================================================
   CUSTOM CONTROL BUTTON CLICKS
   ========================================================= */

function controlButtonClick({
    vid,
    e
}) {

    if (!vid || !e) {
        return false;
    }


    const button =
        e.target.closest(
            ".vid-cntrl-btns button"
        );


    if (!button) {
        return false;
    }


    /*
     * Absolutely prevent control buttons
     * from becoming resize clicks.
     */
    e.preventDefault();
    e.stopPropagation();


    if (
        button.classList.contains(
            "playbtn"
        )
    ) {

        togglePlayPause(
            vid
        );

        return true;

    }


    if (
        button.classList.contains(
            "fwdBtn"
        )
    ) {

        rewindVideo(
            vid
        );

        return true;

    }


    if (
        button.classList.contains(
            "rwdBtn"
        )
    ) {

        forwardVideo(
            vid
        );

        return true;

    }


    return false;

}


/* =========================================================
   MAIN ENTRY
   ========================================================= */

export function videoControls({
    vid,
    e
}) {

    if (!vid || !e) {
        return;
    }


    /* =====================================================
       KEYBOARD
       ===================================================== */

    if (
        e.type ===
        "keydown"
    ) {

        videoKeyControl({
            vid,
            e
        });


        return;
    }


    /* =====================================================
       CLICK
       ===================================================== */

    if (
        e.type ===
        "click"
    ) {

        /*
         * Control-button click.
         */
        if (
            controlButtonClick({
                vid,
                e
            })
        ) {

            return;
        }


        /*
         * Only clicking the actual <video>
         * toggles enlargement here.
         */
        if (
            e.target === vid
        ) {

            toggleVideoSizeClick({
                vid
            });

        }

    }

}