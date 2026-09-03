// js/ui/playStepVid.js

let playing = false;

const ACTIVE_CLASS = "control-active";
const CONTROL_FLASH_TIME = 180;


/*
 * Tracks videos that already have an ended listener.
 *
 * Because lessons are dynamically injected, this prevents
 * accidentally attaching the same listener multiple times
 * to the same video element.
 */
const endedResetVideos =
    new WeakSet();


/* =========================================================
   VIDEO / CONTROL HELPERS
   ========================================================= */

function getVideoContainer(vid) {

    return vid?.closest(
        ".step-vid, .img-container"
    );

}


function getStepVid(vid) {

    return vid?.closest(
        ".step-vid"
    );

}


/* =========================================================
   VIDEO CONTROLS
   ========================================================= */

function getControls(vid) {

    const container =
        getVideoContainer(
            vid
        );


    if (!container) {

        return {
            rewindBtn: null,
            playBtn: null,
            forwardBtn: null
        };

    }


    return {

        rewindBtn:
            container.querySelector(
                ".fwdBtn"
            ),

        playBtn:
            container.querySelector(
                ".playbtn"
            ),

        forwardBtn:
            container.querySelector(
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
        getStepVid(
            vid
        );


    if (!stepVid) return;


    const enlarged =
        stepVid.classList.contains(
            "enlarge"
        ) ||
        stepVid.classList.contains(
            "first-vid-enlarge"
        );


    if (enlarged) {

        vid.style.width =
            "100%";

        vid.style.maxWidth =
            "100%";

        vid.style.height =
            "auto";

        vid.style.display =
            "block";


    } else {

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
    } = getControls(
        vid
    );


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
   RESET VIDEO TO POSTER

   Used by Shift + Enter.

   Also useful whenever we explicitly want:

       paused
       timestamp 0
       poster visible

   Enlargement state is preserved.
   ========================================================= */

/* =========================================================
   RESET VIDEO TO POSTER

   Final desired state:

       - paused
       - timestamp 0
       - poster visible
       - play button shows ▶

   IMPORTANT:
   load() itself resets the media back to its initial
   presentation state, so we do NOT seek again after load().
   ========================================================= */

export function resetVideoToPoster(vid) {

    if (!vid) return;


    playing =
        false;


    /*
     * Stop playback immediately.
     */
    vid.pause();


    /*
     * Reset position BEFORE load().
     */
    try {

        vid.currentTime =
            0;

    } catch {

        // Metadata may not currently be available.

    }


    /*
     * This is the important part.
     *
     * load() resets the video element and restores
     * the poster image.
     *
     * Do NOT set currentTime again after this,
     * because doing so can make the browser display
     * frame zero instead of the poster.
     */
    vid.load();


    syncVideoSize(
        vid
    );


    updatePlayButton(
        vid
    );

}


/* =========================================================
   NATURAL VIDEO END

   IMPORTANT:

   This is intentionally separate from normal pause/reset
   controls.

   When the video naturally reaches the end:

       1. mark our playback state stopped
       2. pause
       3. disable looping/autoplay
       4. reset the media element with load()
       5. wait until metadata is available again
       6. force currentTime = 0
       7. force pause AGAIN
       8. show the poster
       9. restore the ▶ button

   The .step-vid remains enlarged if it was enlarged.
   ========================================================= */

function ensureVideoEndedReset(vid) {

    if (!vid) return;


    /*
     * Same video already initialized.
     */
    if (
        endedResetVideos.has(
            vid
        )
    ) {

        return;

    }


    vid.addEventListener(
        "ended",
        () => {

            playing =
                false;


            /*
             * Stop immediately.
             */
            vid.pause();


            /*
             * We never want natural completion to
             * automatically begin playback again.
             */
            vid.autoplay =
                false;

            vid.removeAttribute(
                "autoplay"
            );


            /*
             * Make absolutely sure this video
             * cannot loop back into playback.
             */
            vid.loop =
                false;

            vid.removeAttribute(
                "loop"
            );


            /*
             * Reset media state.
             *
             * load() is important because simply doing:
             *
             * currentTime = 0
             *
             * normally leaves frame zero visible instead
             * of restoring the poster.
             */
            vid.load();


            /*
             * After load(), metadata becomes available
             * again asynchronously.
             *
             * At that point force the FINAL state:
             *
             * currentTime = 0
             * paused = true
             */
            const finishReset = () => {

                /*
                 * Remove immediately so this is
                 * strictly a one-shot listener.
                 */
                vid.removeEventListener(
                    "loadedmetadata",
                    finishReset
                );


                playing =
                    false;


                /*
                 * Force timestamp zero.
                 */
                try {

                    vid.currentTime =
                        0;

                } catch {

                    // Safe fallback.

                }


                /*
                 * CRITICAL:
                 *
                 * Force paused state AFTER currentTime
                 * has been reset.
                 */
                vid.pause();


                syncVideoSize(
                    vid
                );


                updatePlayButton(
                    vid
                );

            };


            vid.addEventListener(
                "loadedmetadata",
                finishReset
            );


            /*
             * Some browsers may already have enough
             * metadata immediately after load().
             *
             * If so, finish the reset without waiting.
             */
            if (
                vid.readyState >=
                HTMLMediaElement.HAVE_METADATA
            ) {

                finishReset();

            }

        }
    );


    endedResetVideos.add(
        vid
    );

}


/* =========================================================
   PLAY
   ========================================================= */

function playVideo(vid) {

    if (!vid) return;


    /*
     * Make sure natural completion automatically
     * returns this video to its poster.
     */
    ensureVideoEndedReset(
        vid
    );


    playing =
        true;


    syncVideoSize(
        vid
    );


    const playPromise =
        vid.play();


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
    } = getControls(
        vid
    );


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

/* =========================================================
   REWIND

   Left Arrow moves backward 0.5 seconds.

   If we reach the beginning:
       - pause
       - reset to 0
       - show poster
   ========================================================= */

function rewindVideo(vid) {

    if (!vid) return;


    const {
        rewindBtn
    } = getControls(
        vid
    );


    flashButton(
        rewindBtn
    );


    const nextTime =
        vid.currentTime - 0.5;


    /*
     * Reaching zero means the video is finished
     * from the rewind direction.
     */
    if (
        nextTime <= 0
    ) {

        resetVideoToPoster(
            vid
        );


        return;

    }


    vid.currentTime =
        nextTime;

}


/* =========================================================
   FORWARD
   ========================================================= */

/* =========================================================
   FORWARD

   Right Arrow advances the video by 0.5 seconds.

   If advancing would reach or pass the end:

       - stop playback
       - return to timestamp 0
       - restore poster
       - remain paused

   This handles the case where SEEKING to the end does not
   fire the browser's normal "ended" event.
   ========================================================= */

function forwardVideo(vid) {

    if (!vid) return;


    const {
        forwardBtn
    } = getControls(
        vid
    );


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

        /*
         * IMPORTANT:
         *
         * Do NOT seek directly to vid.duration.
         *
         * Seeking to the exact end does not reliably
         * fire the native "ended" event.
         *
         * If Right Arrow would reach/pass the end,
         * explicitly perform our finished-video reset.
         */
        if (
            nextTime >=
            vid.duration
        ) {

            resetVideoToPoster(
                vid
            );


            return;

        }


        vid.currentTime =
            nextTime;


        return;

    }


    /*
     * Duration not available yet.
     */
    vid.currentTime =
        nextTime;

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


        if (stepVid) {

            stepVid.classList.remove(
                "enlarge"
            );

            stepVid.classList.remove(
                "first-vid-enlarge"
            );

        }


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
   ========================================================= */

export function toggleVideoSizeClick({
    vid
}) {

    if (!vid) return;


    const stepVid =
        getStepVid(
            vid
        );


    /* =====================================================
       NORMAL .step-vid
       ===================================================== */

    if (stepVid) {

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


        return;

    }


    /* =====================================================
       VIDEO INSIDE .img-container
       ===================================================== */

    if (
        vid.closest(
            ".img-container"
        )
    ) {

        togglePlayPause(
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


            if (stepVid) {

                syncVideoSize(
                    vid
                );


                if (
                    stepVid.classList.contains(
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


            if (
                vid.closest(
                    ".img-container"
                )
            ) {

                togglePlayPause(
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


            /*
             * If somehow sitting exactly at the end,
             * return to the beginning before playing.
             */
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
     * Video control buttons NEVER resize media.
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
         * Custom control-button click.
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
         * Only clicking the actual video reaches
         * the video resize/play handler.
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