(function () {
    const config = window.CURIOSA_MANAGE_CONFIG || {};
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const flowStatus = (params.get("status") || "").trim().toLowerCase();
    const apiBaseUrl = (config.apiBaseUrl || "").trim().replace(/\/$/, "");

    const curT = (text) => (window.curiosaT ? window.curiosaT(text) : text);

    const state = {
        token,
        apiBaseUrl,
        flowStatus,
        subscriptionStatus: "",
        categories: [],
        allSourceIds: [],
        dbPreferencesEnabled: false,
        /* Snapshot of the last saved form state; everything that differs from
           it is what the action bar calls unsaved. */
        baseline: null,
        loaded: false,
    };

    const INCOMPLETE_LINK_MESSAGE =
        "This manage-subscription link is incomplete. Your personal access token is part of the "
        + "manage-subscription link in your Curiosa email — please open this page by clicking that link.";

    const IAPP_EMAIL_SOURCES = [
        { id: 18, label: "IAPP Daily Dashboard", format: "email" },
        { id: 56, label: "IAPP AI Governance Dashboard", format: "email" },
        { id: 57, label: "IAPP Europe Data Protection Digest", format: "email" },
    ];
    const IAPP_SOURCE_IDS = new Set(IAPP_EMAIL_SOURCES.map((source) => source.id));
    const IAPP_SOURCE_LABELS = new Set(IAPP_EMAIL_SOURCES.map((source) => source.label));

    const topActions = document.getElementById("top-actions");
    const subscriptionStatusPill = document.getElementById("subscription-status-pill");
    const flowBanner = document.getElementById("flow-banner");
    const flowBannerTitle = document.getElementById("flow-banner-title");
    const flowBannerText = document.getElementById("flow-banner-text");
    const unsubscribeButton = document.getElementById("unsubscribe-button");
    const resubscribeButton = document.getElementById("resubscribe-button");
    const statusMessage = document.getElementById("status-message");
    const legacyNote = document.getElementById("legacy-note");
    const dailyCheckbox = document.getElementById("daily-enabled");
    const weeklyCheckbox = document.getElementById("weekly-enabled");
    const sourcesRoot = document.getElementById("sources-root");
    const saveButton = document.getElementById("save-button");
    const resetButton = document.getElementById("reset-button");
    const discardButton = document.getElementById("discard-button");
    const actionBar = document.getElementById("action-bar");
    const actionBarNote = document.getElementById("action-bar-note");
    const modeAllRadio = document.getElementById("source-mode-all");
    const modeCustomRadio = document.getElementById("source-mode-custom");
    const sourceFilter = document.getElementById("source-filter");
    const filterCount = document.getElementById("filter-count");
    const summaryDaily = document.getElementById("summary-daily");
    const summaryWeekly = document.getElementById("summary-weekly");
    const summarySources = document.getElementById("summary-sources");

    function setStatus(message, tone) {
        statusMessage.textContent = message || "";
        statusMessage.classList.toggle("is-hidden", !message);
        statusMessage.classList.toggle("note-warm", tone === "warm");
        statusMessage.classList.toggle("note-success", tone === "success");
    }

    function setBusy(isBusy) {
        state.busy = isBusy;
        resetButton.disabled = isBusy;
        unsubscribeButton.disabled = isBusy;
        resubscribeButton.disabled = isBusy;
        saveButton.disabled = isBusy || !isDirty();
        discardButton.disabled = isBusy;
    }

    function showFatal(message) {
        setStatus(message, "warm");
        saveButton.disabled = true;
        resetButton.disabled = true;
        discardButton.disabled = true;
        dailyCheckbox.disabled = true;
        weeklyCheckbox.disabled = true;
        modeAllRadio.disabled = true;
        modeCustomRadio.disabled = true;
        sourceFilter.disabled = true;
        actionBarNote.textContent = "";
    }

    function buildUnsubscribeApiUrl(action) {
        if (!apiBaseUrl) {
            return "";
        }

        const manageUrl = new URL(apiBaseUrl);
        const unsubscribeUrl = new URL("/functions/v1/unsubscribe", manageUrl.origin);
        unsubscribeUrl.searchParams.set("token", token);
        if (action) {
            unsubscribeUrl.searchParams.set("action", action);
        }
        unsubscribeUrl.searchParams.set("redirect", "0");
        return unsubscribeUrl.toString();
    }

    function updateFlowBanner() {
        const status = state.flowStatus;
        const visible = status === "unsubscribed" || status === "resubscribed";
        flowBanner.classList.toggle("is-hidden", !visible);
        flowBanner.classList.toggle("flow-banner-warm", status === "unsubscribed");
        flowBanner.classList.toggle("flow-banner-success", status === "resubscribed");

        if (!visible) {
            flowBannerTitle.textContent = "";
            flowBannerText.textContent = "";
            return;
        }

        if (status === "unsubscribed") {
            flowBannerTitle.textContent = curT("You have been unsubscribed successfully.");
            flowBannerText.textContent = curT("If this was a mistake, you can resubscribe below.");
            return;
        }

        flowBannerTitle.textContent = curT("You have been resubscribed successfully.");
        flowBannerText.textContent = curT("Your subscription is active again. You can update your settings below.");
    }

    function updateTopActions() {
        const status = state.subscriptionStatus;
        const knownStatus = status === "active" || status === "unsubscribed";
        topActions.classList.toggle("is-hidden", !knownStatus);
        unsubscribeButton.classList.toggle("is-hidden", status !== "active");
        resubscribeButton.classList.toggle("is-hidden", status !== "unsubscribed");

        if (!knownStatus) {
            subscriptionStatusPill.textContent = "";
            subscriptionStatusPill.className = "status-pill";
            return;
        }

        if (status === "active") {
            subscriptionStatusPill.textContent = curT("Status: Active");
            subscriptionStatusPill.className = "status-pill status-pill-active";
            return;
        }

        subscriptionStatusPill.textContent = curT("Status: Unsubscribed");
        subscriptionStatusPill.className = "status-pill status-pill-inactive";
    }

    function syncFlowStatusWithSubscriptionStatus() {
        if (state.flowStatus === "unsubscribed" && state.subscriptionStatus !== "unsubscribed") {
            state.flowStatus = "";
        }
        if (state.flowStatus === "resubscribed" && state.subscriptionStatus !== "active") {
            state.flowStatus = "";
        }
    }

    function updateUrlStatus(status) {
        const nextUrl = new URL(window.location.href);
        if (status) {
            nextUrl.searchParams.set("status", status);
        } else {
            nextUrl.searchParams.delete("status");
        }
        window.history.replaceState({}, "", nextUrl.toString());
    }

    function normalizeCategories(categories) {
        const normalizedCategories = Array.isArray(categories)
            ? categories.map((category) => ({
                ...category,
                sources: Array.isArray(category.sources)
                    ? category.sources.map((source) => ({ ...source }))
                    : [],
            }))
            : [];

        let mediaCategory = normalizedCategories.find((category) => category.id === "media");
        if (!mediaCategory) {
            mediaCategory = { id: "media", label: "Media & Blogs", sources: [] };
            normalizedCategories.push(mediaCategory);
        }

        mediaCategory.label = mediaCategory.label || "Media & Blogs";
        mediaCategory.sources = mediaCategory.sources.filter((source) => {
            return !IAPP_SOURCE_IDS.has(source.id) && !IAPP_SOURCE_LABELS.has(source.label);
        });

        IAPP_EMAIL_SOURCES.forEach((source) => {
            mediaCategory.sources.push({ ...source });
        });

        mediaCategory.sources.sort((left, right) => {
            return String(left.label || "").localeCompare(String(right.label || ""), undefined, {
                sensitivity: "base",
            });
        });

        return normalizedCategories;
    }

    /* ---- Source list ---------------------------------------------------- */

    function renderSources(categories, selectedSourceIds) {
        const selectedSet = selectedSourceIds === null
            ? new Set(state.allSourceIds)
            : new Set(selectedSourceIds);

        sourcesRoot.innerHTML = "";
        categories.forEach((category) => {
            const wrapper = document.createElement("details");
            wrapper.className = "category-card";
            wrapper.open = true;
            if (category.id === "authorities") {
                wrapper.classList.add("category-card-authorities");
            }

            const header = document.createElement("summary");
            header.className = "category-header";

            const headingWrap = document.createElement("span");
            headingWrap.className = "category-heading";

            const caret = document.createElement("span");
            caret.className = "category-caret";
            caret.setAttribute("aria-hidden", "true");

            const heading = document.createElement("h3");
            heading.className = "category-title";
            /* Category labels come from the backend catalog in English. */
            heading.textContent = curT(category.label);

            const count = document.createElement("span");
            count.className = "category-count";

            headingWrap.appendChild(caret);
            headingWrap.appendChild(heading);
            header.appendChild(headingWrap);
            header.appendChild(count);

            const body = document.createElement("div");
            body.className = "category-body";

            const actions = document.createElement("div");
            actions.className = "category-actions";

            const selectAllButton = document.createElement("button");
            selectAllButton.type = "button";
            selectAllButton.className = "category-action category-action-select";
            selectAllButton.textContent = curT("Select all");

            const clearAllButton = document.createElement("button");
            clearAllButton.type = "button";
            clearAllButton.className = "category-action category-action-clear";
            clearAllButton.textContent = curT("Clear all");

            const grid = document.createElement("div");
            grid.className = "sources-grid";

            category.sources.forEach((source) => {
                const label = document.createElement("label");
                label.className = "source-card";
                label.dataset.name = String(source.label || "").toLowerCase();

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = String(source.id);
                checkbox.checked = selectedSet.has(source.id);
                checkbox.addEventListener("change", onSelectionChanged);

                const textWrap = document.createElement("span");
                const titleRow = document.createElement("strong");
                titleRow.className = "source-title-row";

                const sourceName = document.createElement("span");
                sourceName.className = "source-name";
                sourceName.textContent = source.label;

                const badges = document.createElement("span");
                badges.className = "source-badges";

                if (category.id === "authorities") {
                    const authorityBadge = document.createElement("span");
                    authorityBadge.className = "pill pill-authorities";
                    authorityBadge.textContent = curT("Authorities");
                    badges.appendChild(authorityBadge);
                }

                const formatBadge = document.createElement("span");
                formatBadge.className = "pill pill-format";
                formatBadge.textContent = source.format.toUpperCase();
                badges.appendChild(formatBadge);

                titleRow.appendChild(sourceName);
                titleRow.appendChild(badges);
                textWrap.appendChild(titleRow);

                label.appendChild(checkbox);
                label.appendChild(textWrap);
                grid.appendChild(label);
            });

            function setCategorySelection(isChecked) {
                grid.querySelectorAll('input[type="checkbox"]').forEach((input) => {
                    if (input.closest(".source-card").classList.contains("is-filtered-out")) {
                        return;
                    }
                    input.checked = isChecked;
                });
                onSelectionChanged();
            }

            /* The buttons sit inside <summary>, which would otherwise toggle the
               disclosure on every click. */
            function runCategoryAction(event, isChecked) {
                event.preventDefault();
                event.stopPropagation();
                setCategorySelection(isChecked);
            }

            selectAllButton.addEventListener("click", (event) => runCategoryAction(event, true));
            clearAllButton.addEventListener("click", (event) => runCategoryAction(event, false));

            actions.appendChild(selectAllButton);
            actions.appendChild(clearAllButton);
            body.appendChild(actions);
            body.appendChild(grid);

            wrapper.appendChild(header);
            wrapper.appendChild(body);
            sourcesRoot.appendChild(wrapper);
        });

        applyFilter();
        updateCategoryCounts();
    }

    function updateCategoryCounts() {
        sourcesRoot.querySelectorAll(".category-card").forEach((card) => {
            const inputs = card.querySelectorAll('input[type="checkbox"]');
            const checked = card.querySelectorAll('input[type="checkbox"]:checked');
            const badge = card.querySelector(".category-count");
            if (!badge) {
                return;
            }
            badge.textContent = `${checked.length} / ${inputs.length}`;
            badge.classList.toggle("is-full", inputs.length > 0 && checked.length === inputs.length);
        });
    }

    function applyFilter() {
        const term = sourceFilter.value.trim().toLowerCase();
        let visible = 0;

        sourcesRoot.querySelectorAll(".category-card").forEach((card) => {
            let cardVisible = 0;
            card.querySelectorAll(".source-card").forEach((sourceCard) => {
                const matches = !term || (sourceCard.dataset.name || "").includes(term);
                sourceCard.classList.toggle("is-filtered-out", !matches);
                if (matches) {
                    cardVisible += 1;
                }
            });
            card.classList.toggle("is-hidden", term !== "" && cardVisible === 0);
            if (term) {
                card.open = cardVisible > 0;
            }
            visible += cardVisible;
        });

        if (!term) {
            filterCount.textContent = "";
            return;
        }
        filterCount.textContent = `${visible} / ${state.allSourceIds.length}`;
    }

    /* ---- Form state ------------------------------------------------------ */

    function currentMode() {
        return modeCustomRadio.checked ? "custom" : "all";
    }

    function checkedSourceIds() {
        return Array.from(
            sourcesRoot.querySelectorAll('input[type="checkbox"]:checked'),
        ).map((input) => Number(input.value)).sort((a, b) => a - b);
    }

    function collectSelectedSourceIds() {
        if (currentMode() === "all") {
            return null;
        }
        return checkedSourceIds();
    }

    function formSignature() {
        return JSON.stringify({
            daily: dailyCheckbox.checked,
            weekly: weeklyCheckbox.checked,
            mode: currentMode(),
            sources: currentMode() === "all" ? null : checkedSourceIds(),
        });
    }

    function captureBaseline() {
        state.baseline = formSignature();
    }

    function isDirty() {
        return state.loaded && state.baseline !== null && state.baseline !== formSignature();
    }

    function updateSummary() {
        const on = curT("On");
        const off = curT("Off");
        summaryDaily.textContent = dailyCheckbox.checked ? on : off;
        summaryDaily.classList.toggle("is-off", !dailyCheckbox.checked);
        summaryWeekly.textContent = weeklyCheckbox.checked ? on : off;
        summaryWeekly.classList.toggle("is-off", !weeklyCheckbox.checked);

        const total = state.allSourceIds.length;
        if (currentMode() === "all") {
            summarySources.textContent = curT("All sources");
            summarySources.classList.remove("is-off");
            return;
        }
        const selected = checkedSourceIds().length;
        summarySources.textContent = `${selected} / ${total}`;
        summarySources.classList.toggle("is-off", selected === 0);
    }

    function updateActionBar() {
        const dirty = isDirty();
        actionBar.classList.toggle("is-dirty", dirty);
        discardButton.classList.toggle("is-hidden", !dirty);
        saveButton.disabled = Boolean(state.busy) || !dirty;
        if (!state.loaded) {
            actionBarNote.textContent = "";
            return;
        }
        actionBarNote.textContent = dirty
            ? curT("You have unsaved changes.")
            : curT("All changes saved.");
    }

    function applySourceMode() {
        const isAll = currentMode() === "all";
        sourcesRoot.classList.toggle("is-locked", isAll);
        sourceFilter.disabled = isAll;
        if (isAll) {
            sourcesRoot.querySelectorAll('input[type="checkbox"]').forEach((input) => {
                input.checked = true;
            });
            updateCategoryCounts();
        }
    }

    function onSelectionChanged() {
        updateCategoryCounts();
        updateSummary();
        updateActionBar();
    }

    function setSelection(ids) {
        const wanted = new Set(ids);
        sourcesRoot.querySelectorAll('input[type="checkbox"]').forEach((input) => {
            input.checked = wanted.has(Number(input.value));
        });
    }

    /* Switching to "all sources" ticks everything, which would otherwise erase a
       carefully built selection the moment the radio is touched. Park it and
       hand it back when the user returns to "choose sources". */
    function onModeChanged() {
        if (currentMode() === "all") {
            state.lastCustomSelection = checkedSourceIds();
        } else if (state.lastCustomSelection) {
            setSelection(state.lastCustomSelection);
        }
        applySourceMode();
        onSelectionChanged();
    }

    function applyPreferences(payload) {
        dailyCheckbox.checked = Boolean(payload.daily_enabled);
        weeklyCheckbox.checked = Boolean(payload.weekly_enabled);

        const selected = payload.selected_source_ids;
        const isAll = selected === null || selected === undefined;
        modeAllRadio.checked = isAll;
        modeCustomRadio.checked = !isAll;

        renderSources(state.categories, isAll ? null : selected);
        applySourceMode();
        state.loaded = true;
        captureBaseline();
        updateSummary();
        updateActionBar();
    }

    async function requestJson(url, options) {
        const response = await fetch(url, options);
        let payload = null;
        try {
            payload = await response.json();
        } catch (_error) {
            payload = null;
        }

        if (!response.ok) {
            const errorCode = payload && payload.error ? payload.error : "request_failed";
            throw new Error(errorCode);
        }

        return payload;
    }

    async function loadPreferences() {
        if (!token) {
            showFatal(curT(INCOMPLETE_LINK_MESSAGE));
            return;
        }
        if (!apiBaseUrl) {
            showFatal("Manage-subscription API base URL is not configured.");
            return;
        }

        setBusy(true);
        setStatus(curT("Loading your subscription settings..."));

        try {
            const payload = await requestJson(
                `${apiBaseUrl}?token=${encodeURIComponent(token)}`,
                { method: "GET", headers: { Accept: "application/json" } },
            );

            state.categories = normalizeCategories(payload.categories || []);
            state.allSourceIds = state.categories.flatMap((category) =>
                (category.sources || []).map((source) => source.id)
            ).sort((a, b) => a - b);
            state.subscriptionStatus = payload.status || "";
            state.dbPreferencesEnabled = Boolean(payload.db_preferences_enabled);
            syncFlowStatusWithSubscriptionStatus();
            updateTopActions();
            updateFlowBanner();

            legacyNote.classList.toggle("is-hidden", state.dbPreferencesEnabled);
            applyPreferences(payload);

            setStatus(state.dbPreferencesEnabled
                ? curT("Your current DB-managed settings are loaded.")
                : curT("Legacy preferences detected. Saving here will switch you to DB-managed settings."));
        } catch (error) {
            const code = error instanceof Error ? error.message : "request_failed";
            if (code === "invalid_token") {
                showFatal(curT("This manage-subscription link is invalid."));
                return;
            }
            if (code === "missing_token") {
                showFatal(curT(INCOMPLETE_LINK_MESSAGE));
                return;
            }
            showFatal(curT("Temporary error. Please try again later or contact us at info@curiosa.news."));
        } finally {
            setBusy(false);
        }
    }

    async function unsubscribe() {
        if (!token) {
            showFatal(curT(INCOMPLETE_LINK_MESSAGE));
            return;
        }

        const unsubscribeUrl = buildUnsubscribeApiUrl();
        if (!unsubscribeUrl) {
            setStatus(curT("Could not unsubscribe right now. Please try again later or contact us at info@curiosa.news."), "warm");
            return;
        }

        setBusy(true);
        setStatus(curT("Unsubscribing..."));

        try {
            const response = await fetch(unsubscribeUrl, {
                method: "POST",
                headers: {
                    Accept: "text/plain",
                },
            });

            if (!response.ok) {
                throw new Error("request_failed");
            }

            state.subscriptionStatus = "unsubscribed";
            state.flowStatus = "unsubscribed";
            updateTopActions();
            updateFlowBanner();
            updateUrlStatus("unsubscribed");
            setStatus(curT("You have been unsubscribed successfully."));
        } catch (_error) {
            setStatus(curT("Could not unsubscribe right now. Please try again later or contact us at info@curiosa.news."), "warm");
        } finally {
            setBusy(false);
        }
    }

    async function resubscribe() {
        if (!token) {
            showFatal(curT(INCOMPLETE_LINK_MESSAGE));
            return;
        }

        const unsubscribeUrl = buildUnsubscribeApiUrl("resubscribe");
        if (!unsubscribeUrl) {
            setStatus(curT("Could not resubscribe right now. Please try again later or contact us at info@curiosa.news."), "warm");
            return;
        }

        setBusy(true);
        setStatus(curT("Resubscribing..."));

        try {
            const response = await fetch(unsubscribeUrl, {
                method: "POST",
                headers: {
                    Accept: "text/plain",
                },
            });

            if (!response.ok) {
                throw new Error("request_failed");
            }

            state.subscriptionStatus = "active";
            state.flowStatus = "resubscribed";
            updateTopActions();
            updateFlowBanner();
            updateUrlStatus("resubscribed");
            setStatus(curT("You have been resubscribed successfully."), "success");
        } catch (_error) {
            setStatus(curT("Could not resubscribe right now. Please try again later or contact us at info@curiosa.news."), "warm");
        } finally {
            setBusy(false);
        }
    }

    async function savePreferences() {
        setBusy(true);
        setStatus(curT("Saving your changes..."));

        try {
            const payload = await requestJson(
                `${apiBaseUrl}?token=${encodeURIComponent(token)}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        db_preferences_enabled: true,
                        daily_enabled: dailyCheckbox.checked,
                        weekly_enabled: weeklyCheckbox.checked,
                        selected_source_ids: collectSelectedSourceIds(),
                    }),
                },
            );

            state.dbPreferencesEnabled = Boolean(payload.db_preferences_enabled);
            state.subscriptionStatus = payload.status || state.subscriptionStatus;
            legacyNote.classList.add("is-hidden");
            updateTopActions();
            captureBaseline();
            updateActionBar();
            setStatus(curT("Your subscription settings have been saved."), "success");
        } catch (_error) {
            setStatus(curT("Could not save your changes. Please try again later or contact us at info@curiosa.news."), "warm");
        } finally {
            setBusy(false);
        }
    }

    /* Reset writes defaults to the server on the spot, so it asks twice: the
       first click only arms the button, and it disarms itself if ignored. */
    function armReset() {
        if (state.resetArmed) {
            window.clearTimeout(state.resetTimer);
            disarmReset();
            resetPreferences();
            return;
        }
        state.resetArmed = true;
        resetButton.textContent = curT("Confirm reset");
        resetButton.classList.remove("button-secondary");
        resetButton.classList.add("button-danger");
        state.resetTimer = window.setTimeout(disarmReset, 5000);
    }

    function disarmReset() {
        state.resetArmed = false;
        resetButton.textContent = curT("Reset settings");
        resetButton.classList.remove("button-danger");
        resetButton.classList.add("button-secondary");
    }

    async function resetPreferences() {
        setBusy(true);
        setStatus(curT("Resetting your settings..."));

        try {
            const payload = await requestJson(
                `${apiBaseUrl}?action=reset&token=${encodeURIComponent(token)}`,
                {
                    method: "POST",
                    headers: { Accept: "application/json" },
                },
            );

            state.dbPreferencesEnabled = Boolean(payload.db_preferences_enabled);
            state.subscriptionStatus = payload.status || state.subscriptionStatus;
            legacyNote.classList.add("is-hidden");
            updateTopActions();
            applyPreferences(payload);
            setStatus(curT("Your subscription settings have been reset."), "success");
        } catch (_error) {
            setStatus(curT("Could not reset your settings. Please try again later or contact us at info@curiosa.news."), "warm");
        } finally {
            setBusy(false);
        }
    }

    function discardChanges() {
        if (!state.baseline) {
            return;
        }
        const baseline = JSON.parse(state.baseline);
        dailyCheckbox.checked = baseline.daily;
        weeklyCheckbox.checked = baseline.weekly;
        modeAllRadio.checked = baseline.mode === "all";
        modeCustomRadio.checked = baseline.mode === "custom";
        renderSources(state.categories, baseline.sources);
        applySourceMode();
        onSelectionChanged();
        setStatus(curT("Your unsaved changes were discarded."));
    }

    /* Nothing is written to the server without Save, so a page leave with a
       dirty form is the one place a warning is worth it. */
    window.addEventListener("beforeunload", (event) => {
        if (!isDirty()) {
            return;
        }
        event.preventDefault();
        event.returnValue = "";
    });

    dailyCheckbox.addEventListener("change", onSelectionChanged);
    weeklyCheckbox.addEventListener("change", onSelectionChanged);
    modeAllRadio.addEventListener("change", onModeChanged);
    modeCustomRadio.addEventListener("change", onModeChanged);
    sourceFilter.addEventListener("input", applyFilter);
    unsubscribeButton.addEventListener("click", unsubscribe);
    saveButton.addEventListener("click", savePreferences);
    resetButton.addEventListener("click", armReset);
    discardButton.addEventListener("click", discardChanges);
    resubscribeButton.addEventListener("click", resubscribe);
    updateTopActions();
    updateFlowBanner();
    updateActionBar();
    loadPreferences();
})();
