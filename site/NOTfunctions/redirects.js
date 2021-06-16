// We had to hook the function to: `/redirect/*`: https://answers.netlify.com/t/language-based-redirect-only-works-when-1-browser-language-set/4252/19
// Originally: https://github.com/mozmeao/pocket-marketing-pages/blob/master/functions/redirect.js
const SUPPORTED_LANGS = {
    "en": "/en",
    "it": "/it",
    "ch": "/it",
// "en": "/en",
// "de": "/de",
// "es": "/es",
// "es-es": "/es",
// "es-ar": "/es-la",
// "es-bo": "/es-la",
// "es-cl": "/es-la",
// "es-co": "/es-la",
// "es-cr": "/es-la",
// "es-do": "/es-la",
// "es-ec": "/es-la",
// "es-sv": "/es-la",
// "es-gt": "/es-la",
// "es-hn": "/es-la",
// "es-mx": "/es-la",
// "es-ni": "/es-la",
// "es-pa": "/es-la",
// "es-py": "/es-la",
// "es-pe": "/es-la",
// "es-pr": "/es-la",
// "es-uy": "/es-la",
// "es-ve": "/es-la",
// "fr-ca": "/fr-ca",
// "fr-fr": "/fr",
// "fr": "/fr",
// "it": "/it",
// "ja": "/ja",
// "ko": "/ko",
// "nl": "/nl",
// "pl": "/pl",
// "pt-br": "/pt-br",
// "pt-pt": "/pt",
// "pt": "/pt",
// "ru": "/ru",
// "zh-cn": "/zh-cn",
// "zh-tw": "/zh-tw",

};
const DEFAULT_LANG = 'en';

exports.handler = async (event, context) => {
    // based on https://gist.github.com/azproduction/4275127
    function acceptLanguageParser(string) {
        // When no Accept-Language headers have been set.
        if (string === undefined || string === '') {
            return DEFAULT_LANG;
        }

        var langs = string.split(','), i, c;

        for (i = 0, c = langs.length; i < c; i++) {
            langs[i] = langs[i].split(';q=');
            langs[i][1] = +langs[i][1] || 1;
        }

        langs = langs.sort(function (a, b) {
            return b[1] - a[1];
        });

        for (i = 0, c = langs.length; i < c; i++) {
            langs[i] = langs[i][0].replace(/^\s+|\s+$/, '').toLowerCase();
        }

        return langs;
    }

    function redirect(langs) {
        var url = event.path.substr(28);

        // Ensure URL is not already localized
        for (i = 0, c = Object.values(SUPPORTED_LANGS).length; i < c; i++) {
            if (url.startsWith(Object.values(SUPPORTED_LANGS)[i] + '/')) {
                return event.path.substr(28);
            }
        }

        var lang_path = SUPPORTED_LANGS[DEFAULT_LANG];
        for (i = 0, c = langs.length; i < c; i++) {
            if (langs[i] in SUPPORTED_LANGS) {
                lang_path = SUPPORTED_LANGS[langs[i]];
                break;
            }
        }

        return lang_path + url;
    }
    var redirect_url;

    try {
        redirect_url =  redirect(acceptLanguageParser(event.headers["accept-language"]));
    } catch (err) {
        return {
            statusCode: 501,
            body: "Something went wrong. Did you supply a path?"
        }
    }

    return {
        statusCode: 301,
        headers: {
            Location: redirect_url,
        },
        body: "Redirecting to " + redirect_url
    }
}
