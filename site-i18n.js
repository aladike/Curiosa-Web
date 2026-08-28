/* Curiosa subscription-control i18n — EN (authored in HTML) + DE. */
(function () {
    "use strict";

    function normalize(text) {
        return String(text).replace(/\s+/g, " ").trim();
    }

    var DE = {
        // Shared subscription controls
        "Preferences": "Einstellungen",
        "Unsubscribe": "Abmelden",
        "Subscription controls": "Abo-Verwaltung",
        "No behavioral tracking": "Kein verhaltensbasiertes Tracking",
        "Manage Subscription": "Abo verwalten",

        // Manage-subscription page
        "Curiosa Settings": "Curiosa-Einstellungen",
        "Manage your Curiosa subscription": "Ihr Curiosa-Abonnement verwalten",
        "Adjust delivery and source preferences for your Curiosa briefings.":
            "Passen Sie Zustellung und Quellen für Ihre Curiosa-Briefings an.",
        "Resubscribe": "Wieder anmelden",
        "Your account is still using legacy YAML-based daily preferences. Saving here will switch you to the new DB-managed settings.":
            "Ihr Konto nutzt noch ältere YAML-basierte Einstellungen. Beim Speichern wechseln Sie zu den neuen datenbankverwalteten Einstellungen.",
        "Subscription settings": "Abonnement-Einstellungen",
        "Choose which digests Curiosa should send you.":
            "Wählen Sie, welche Digests Curiosa Ihnen senden soll.",
        "Daily briefing": "Tägliches Briefing",
        "Weekly digest": "Wöchentlicher Digest",
        "Receive the daily Curiosa email.": "Erhalten Sie die tägliche Curiosa-E-Mail.",
        "Receive the weekly Curiosa roundup.": "Erhalten Sie den wöchentlichen Curiosa-Überblick.",
        "Sources by category": "Quellen nach Kategorie",
        "These source selections affect the daily briefing only.":
            "Diese Quellenauswahl betrifft nur das tägliche Briefing.",
        "Save changes": "Änderungen speichern",
        "Reset settings": "Einstellungen zurücksetzen",
        "Confirm reset": "Zurücksetzen bestätigen",
        "Discard changes": "Änderungen verwerfen",

        // Summary rail and source mode
        "Your subscription": "Ihr Abonnement",
        "Sources": "Quellen",
        "Changes take effect with the next briefing. Nothing is saved until you use Save changes.":
            "Änderungen gelten ab dem nächsten Briefing. Gespeichert wird erst über „Änderungen speichern“.",
        "All sources": "Alle Quellen",
        "Everything Curiosa tracks, including sources added later.":
            "Alles, was Curiosa verfolgt — auch später ergänzte Quellen.",
        "Choose sources": "Quellen auswählen",
        "Only the sources you tick below.": "Nur die unten angehakten Quellen.",
        "Filter sources by name": "Quellen nach Namen filtern",
        "On": "Ein",
        "Off": "Aus",
        "You have unsaved changes.": "Sie haben ungespeicherte Änderungen.",
        "All changes saved.": "Alle Änderungen gespeichert.",
        "Your unsaved changes were discarded.": "Ihre ungespeicherten Änderungen wurden verworfen.",

        // Manage-subscription runtime messages
        "This manage-subscription link is incomplete. Your personal access token is part of the manage-subscription link in your Curiosa email — please open this page by clicking that link.":
            "Dieser Verwaltungslink ist unvollständig. Ihr persönlicher Zugriffstoken ist Teil des Links in Ihrer Curiosa-E-Mail — bitte öffnen Sie diese Seite über den Link in dieser E-Mail.",
        "This manage-subscription link is invalid.": "Dieser Verwaltungslink ist ungültig.",
        "Loading your subscription settings...": "Ihre Abo-Einstellungen werden geladen …",
        "Your current DB-managed settings are loaded.": "Ihre aktuellen Einstellungen wurden geladen.",
        "Legacy preferences detected. Saving here will switch you to DB-managed settings.":
            "Ältere Einstellungen erkannt. Beim Speichern wechseln Sie zu den neuen datenbankverwalteten Einstellungen.",
        "Temporary error. Please try again later or contact us at info@curiosa.news.":
            "Vorübergehender Fehler. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Unsubscribing...": "Abmeldung läuft …",
        "Resubscribing...": "Wiederanmeldung läuft …",
        "You have been unsubscribed successfully.": "Sie wurden erfolgreich abgemeldet.",
        "You have been resubscribed successfully.": "Sie wurden erfolgreich wieder angemeldet.",
        "Could not unsubscribe right now. Please try again later or contact us at info@curiosa.news.":
            "Die Abmeldung ist gerade nicht möglich. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Could not resubscribe right now. Please try again later or contact us at info@curiosa.news.":
            "Die Wiederanmeldung ist gerade nicht möglich. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "If this was a mistake, you can resubscribe below.":
            "Falls das ein Versehen war, können Sie sich unten wieder anmelden.",
        "Your subscription is active again. You can update your settings below.":
            "Ihr Abonnement ist wieder aktiv. Sie können Ihre Einstellungen unten anpassen.",
        "Status: Active": "Status: Aktiv",
        "Status: Unsubscribed": "Status: Abgemeldet",
        "Saving your changes...": "Änderungen werden gespeichert …",
        "Your subscription settings have been saved.": "Ihre Abo-Einstellungen wurden gespeichert.",
        "Could not save your changes. Please try again later or contact us at info@curiosa.news.":
            "Ihre Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Resetting your settings...": "Einstellungen werden zurückgesetzt …",
        "Your subscription settings have been reset.": "Ihre Abo-Einstellungen wurden zurückgesetzt.",
        "Could not reset your settings. Please try again later or contact us at info@curiosa.news.":
            "Ihre Einstellungen konnten nicht zurückgesetzt werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Select all": "Alle auswählen",
        "Clear all": "Alle abwählen",
        "Authorities": "Behörden",
        "Media & Blogs": "Medien & Blogs",
        "New": "Neu",

        // Unsubscribe page and runtime messages
        "Curiosa Email": "Curiosa-E-Mail",
        "Unsubscribe from Curiosa emails": "Von Curiosa-E-Mails abmelden",
        "You can unsubscribe from Curiosa emails here. If you change your mind, you can re-subscribe using this same link.":
            "Hier können Sie sich von Curiosa-E-Mails abmelden. Wenn Sie es sich anders überlegen, können Sie sich über denselben Link wieder anmelden.",
        "Current subscription status": "Aktueller Abo-Status",
        "What happens": "Was passiert",
        "Daily briefings and the weekly digest stop immediately.":
            "Tägliche Briefings und der wöchentliche Digest enden sofort.",
        "Your source and delivery preferences are kept, not deleted.":
            "Ihre Quellen- und Zustelleinstellungen bleiben erhalten und werden nicht gelöscht.",
        "You can re-subscribe from this page at any time.":
            "Sie können sich jederzeit über diese Seite wieder anmelden.",
        "Adjust preferences instead": "Stattdessen Einstellungen anpassen",
        "Unsubscribe from all Curiosa emails? This takes effect right away.":
            "Von allen Curiosa-E-Mails abmelden? Das wird sofort wirksam.",
        "Yes, unsubscribe": "Ja, abmelden",
        "Keep my subscription": "Abo behalten",
        "Loading": "Lädt",
        "Loading your subscription status...": "Ihr Abo-Status wird geladen …",
        "Re-subscribe": "Wieder anmelden",
        "This unsubscribe link is invalid.": "Dieser Abmeldelink ist ungültig.",
        "This unsubscribe link is incomplete.": "Dieser Abmeldelink ist unvollständig.",
        "Your current subscription status is loaded.": "Ihr aktueller Abo-Status wurde geladen.",
        "Re-subscribing...": "Wiederanmeldung läuft …",
        "You have been re-subscribed successfully.": "Sie wurden erfolgreich wieder angemeldet.",
        "Could not update your subscription right now. Please try again later or contact us at info@curiosa.news.":
            "Ihr Abonnement konnte gerade nicht aktualisiert werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Subscription status is temporarily unavailable. Please try again later or contact us at info@curiosa.news.":
            "Der Abo-Status ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns unter info@curiosa.news.",
        "Active": "Aktiv",
        "Unsubscribed": "Abgemeldet"
    };

    var stored = null;
    try {
        stored = window.localStorage.getItem("curiosa-lang");
    } catch (_error) {
        stored = null;
    }
    var browserIsGerman = String(navigator.language || "").toLowerCase().indexOf("de") === 0;
    var lang = stored === "de" || stored === "en" ? stored : (browserIsGerman ? "de" : "en");

    function t(text) {
        if (lang !== "de") {
            return text;
        }
        return DE[normalize(text)] || text;
    }

    function setLang(nextLang) {
        try {
            window.localStorage.setItem("curiosa-lang", nextLang);
        } catch (_error) {
            /* Private mode: the browser-language fallback remains available. */
        }
        window.location.reload();
    }

    function applyTranslations() {
        document.documentElement.lang = lang;
        if (lang !== "de") {
            return;
        }

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            if (key) {
                if (DE[key]) {
                    el.innerHTML = DE[key];
                }
                return;
            }
            var translated = DE[normalize(el.textContent)];
            if (translated) {
                el.textContent = translated;
            }
        });

        /* Placeholders are attribute text, so they need their own pass; the
           English placeholder doubles as the dictionary key, as elsewhere. */
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var translated = DE[normalize(el.getAttribute("placeholder") || "")];
            if (translated) {
                el.setAttribute("placeholder", translated);
            }
        });
    }

    function injectToggle() {
        var nav = document.querySelector(".site-nav");
        if (!nav) {
            return;
        }
        var wrap = document.createElement("div");
        wrap.className = "lang-toggle";
        wrap.setAttribute("role", "group");
        wrap.setAttribute("aria-label", "Language");
        ["en", "de"].forEach(function (code) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = code.toUpperCase();
            button.className = "lang-toggle__option" + (code === lang ? " is-active" : "");
            button.setAttribute("aria-pressed", code === lang ? "true" : "false");
            if (code !== lang) {
                button.addEventListener("click", function () {
                    setLang(code);
                });
            }
            wrap.appendChild(button);
        });
        nav.appendChild(wrap);
    }

    window.curiosaT = t;
    window.curiosaLang = lang;

    function init() {
        applyTranslations();
        injectToggle();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
