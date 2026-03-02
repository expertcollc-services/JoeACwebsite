
    window._currentDevice = 'desktop';
    window.Parameters = window.Parameters || {
        HomeUrl: '/reference_design/Pages/desktop/home/',
        AccountUUID: '867caca9c9254343bd8260f2ae7d58e7',
        SystemID: 'US_DIRECT_PRODUCTION',
        SiteAlias: '7335dee2',
        SiteType: atob('RFVEQU9ORQ=='),
        PublicationDate: 'Mon Dec 22 19:08:46 UTC 2025',
        ExternalUid: 'TI ELITEQ004',
        IsSiteMultilingual: false,
        InitialPostAlias: '',
        InitialPostPageUuid: '',
        InitialDynamicItem: '',
        DynamicPageInfo: {
            isDynamicPage: false,
            base64JsonRowData: 'null',
        },
        InitialPageAlias: 'home',
        InitialPageUuid: '118bd10a687a47c4bb3ddb7283e01d02',
        InitialPageId: '41595154',
        InitialEncodedPageAlias: 'aG9tZQ==',
        InitialHeaderUuid: '3d0470b2a8e14347ac0184e8c3ba1577',
        CurrentPageUrl: '',
        IsCurrentHomePage: true,
        AllowAjax: false,
        AfterAjaxCommand: null,
        HomeLinkText: 'Back To Home',
        UseGalleryModule: false,
        CurrentThemeName: 'Layout Theme',
        ThemeVersion: '500000',
        DefaultPageAlias: '',
        RemoveDID: true,
        WidgetStyleID: null,
        IsHeaderFixed: false,
        IsHeaderSkinny: false,
        IsBfs: true,
        StorePageAlias: 'null',
        StorePagesUrls: 'e30=',
        IsNewStore: 'false',
        StorePath: '',
        StoreId: 'null',
        StoreVersion: 0,
        StoreBaseUrl: '/site/7335dee2?preview=true&dm_device=desktop&dm_exportSite=true&nossl&dm_exportSite_protected=88be15f2_1766430624803_5_2e201600ceb8edc5f6160a91a50f2af4e85af85b033907e5113805b45457cebb',
        StoreCleanUrl: true,
        StoreDisableScrolling: true,
        IsStoreSuspended: false,
        HasCustomDomain: true,
        SimpleSite: false,
        showCookieNotification: false,
        cookiesNotificationMarkup: 'null',
        translatedPageUrl: '',
        isFastMigrationSite: false,
        sidebarPosition: 'NA',
        currentLanguage: 'en',
        currentLocale: 'en',
        NavItems: '{}',
        errors: {
            general: 'There was an error connecting to the page.<br/> Make sure you are not offline.',
            password: 'Incorrect name/password combination',
            tryAgain: 'Try again'
        },
        NavigationAreaParams: {
            ShowBackToHomeOnInnerPages: true,
            NavbarSize: -1,
            NavbarLiveHomePage: '/reference_design/Pages/desktop/home/',
            BlockContainerSelector: '.dmBody',
            NavbarSelector: '#dmNav:has(a)',
            SubNavbarSelector: '#subnav_main'
        },
        hasCustomCode: true,
        planID: '7',
        customTemplateId: 'null',
        siteTemplateId: 'null',
        productId: 'DM_DIRECT',
        disableTracking: false,
        pageType: 'FROM_SCRATCH',
        isRuntimeServer: true,
        isInEditor: false,
        hasNativeStore: false,
        defaultLang: 'en',
        hamburgerMigration: null,
        isFlexSite: false
    };

    window.Parameters.LayoutID = {};
    window.Parameters.LayoutID[window._currentDevice] = 6;
    window.Parameters.LayoutVariationID = {};
    window.Parameters.LayoutVariationID[window._currentDevice] = 5;


    window.SystemID = 'US_DIRECT_PRODUCTION';

    if (!window.dmAPI) {
        window.dmAPI = {
            registerExternalRuntimeComponent: function () {
            },
            getCurrentDeviceType: function () {
                return window._currentDevice;
            },
            runOnReady: (ns, fn) => {
                const safeFn = dmAPI.toSafeFn(fn);
                ns = ns || 'global_' + Math.random().toString(36).slice(2, 11);
                const eventName = 'afterAjax.' + ns;

                if (document.readyState === 'complete') {
                    $.DM.events.off(eventName).on(eventName, safeFn);
                    setTimeout(function () {
                        safeFn({
                            isAjax: false,
                        });
                    }, 0);
                } else {
                    window?.waitForDeferred?.('dmAjax', () => {
                        $.DM.events.off(eventName).on(eventName, safeFn);
                        safeFn({
                            isAjax: false,
                        });
                    });
                }
            },
            toSafeFn: (fn) => {
                if (fn?.safe) {
                    return fn;
                }
                const safeFn = function (...args) {
                    try {
                        return fn?.apply(null, args);
                    } catch (e) {
                        console.log('function failed ' + e.message);
                    }
                };
                safeFn.safe = true;
                return safeFn;
            }
        };
    }

    if (!window.requestIdleCallback) {
        window.requestIdleCallback = function (fn) {
            setTimeout(fn, 0);
        }
    }


/**
 * There are a few <link> tags with CSS resource in them that are preloaded in the page
 * in each of those there is a "onload" handler which invokes the loadCSS callback
 * defined here.
 * We are monitoring 3 main CSS files - the runtime, the global and the page.
 * When each load we check to see if we can append them all in a batch. If threre
 * is no page css (which may happen on inner pages) then we do not wait for it
 */
(function () {
  let cssLinks = {};
  function loadCssLink(link) {
    link.onload = null;
    link.rel = "stylesheet";
    link.type = "text/css";
  }
  
    function checkCss() {
      const pageCssLink = document.querySelector("[id*='CssLink']");
      const widgetCssLink = document.querySelector("[id*='widgetCSS']");

        if (cssLinks && cssLinks.runtime && cssLinks.global && (!pageCssLink || cssLinks.page) && (!widgetCssLink || cssLinks.widget)) {
            const storedRuntimeCssLink = cssLinks.runtime;
            const storedPageCssLink = cssLinks.page;
            const storedGlobalCssLink = cssLinks.global;
            const storedWidgetCssLink = cssLinks.widget;

            storedGlobalCssLink.disabled = true;
            loadCssLink(storedGlobalCssLink);

            if (storedPageCssLink) {
                storedPageCssLink.disabled = true;
                loadCssLink(storedPageCssLink);
            }

            if(storedWidgetCssLink) {
                storedWidgetCssLink.disabled = true;
                loadCssLink(storedWidgetCssLink);
            }

            storedRuntimeCssLink.disabled = true;
            loadCssLink(storedRuntimeCssLink);

            requestAnimationFrame(() => {
                setTimeout(() => {
                    storedRuntimeCssLink.disabled = false;
                    storedGlobalCssLink.disabled = false;
                    if (storedPageCssLink) {
                      storedPageCssLink.disabled = false;
                    }
                    if (storedWidgetCssLink) {
                      storedWidgetCssLink.disabled = false;
                    }
                    // (SUP-4179) Clear the accumulated cssLinks only when we're
                    // sure that the document has finished loading and the document 
                    // has been parsed.
                    if(document.readyState === 'interactive') {
                      cssLinks = null;
                    }
                }, 0);
            });
        }
    }
  

  function loadCSS(link) {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var noCSS = !!urlParams.get("nocss");
      var cssTimeout = urlParams.get("cssTimeout") || 0;

      if (noCSS) {
        return;
      }
      if (link.href && link.href.includes("d-css-runtime")) {
        cssLinks.runtime = link;
        checkCss();
      } else if (link.id === "siteGlobalCss") {
        cssLinks.global = link;
        checkCss();
      } 
      
      else if (link.id && link.id.includes("CssLink")) {
        cssLinks.page = link;
        checkCss();
      } else if (link.id && link.id.includes("widgetCSS")) {
        cssLinks.widget = link;
        checkCss();
      }
      
      else {
        requestIdleCallback(function () {
          window.setTimeout(function () {
            loadCssLink(link);
          }, parseInt(cssTimeout, 10));
        });
      }
    } catch (e) {
      throw e
    }
  }
  window.loadCSS = window.loadCSS || loadCSS;
})();


    /* usage: window.getDeferred(<deferred name>).resolve() or window.getDeferred(<deferred name>).promise.then(...)*/
    function Def() {
        this.promise = new Promise((function (a, b) {
            this.resolve = a, this.reject = b
        }).bind(this))
    }

    const defs = {};
    window.getDeferred = function (a) {
        return null == defs[a] && (defs[a] = new Def), defs[a]
    }
    window.waitForDeferred = function (b, a, c) {
        let d = window?.getDeferred?.(b);
        d
            ? d.promise.then(a)
            : c && ["complete", "interactive"].includes(document.readyState)
                ? setTimeout(a, 1)
                : c
                    ? document.addEventListener("DOMContentLoaded", a)
                    : console.error(`Deferred  does not exist`);
    };






  window.liveSiteAsyncInit = function() {
    LiveSite.init({
      id : 'WI-37W0IH3V2JXQZFP6MM7Y'
    });
  };
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0],
        p = 'https://',
        r = Math.floor(new Date().getTime() / 1000000);
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = p + "d2ra6nuwn69ktl.cloudfront.net/assets/livesite.js?" + r;
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'livesite-jssdk'));


  

  

{
  "@context" : {
    "@vocab" : "http://schema.org/"
  },
  "@type" : "HVACBusiness",
  "name" : "Elite Quality Commercial HVAC and Refrigeration",
  "address" : {
    "@type" : "PostalAddress",
    "streetAddress" : "113 W Jackson Blvd",
    "addressLocality" : "Chicago",
    "addressRegion" : "IL",
    "postalCode" : "60604",
    "addressCountry" : "US"
  },
  "geo" : {
    "@type" : "GeoCoordinates",
    "latitude" : "41.877916",
    "longitude" : "-87.631241"
  },
  "url" : "https://www.elitequalityhvac.com",
  "telephone" : "708-607-9575",
  "email" : "ecclestonjoseph0@gmail.com",
  "logo" : "https://irp.cdn-website.com/7335dee2/dms3rep/multi/New+Project+%282%29.png",
  "openingHoursSpecification" : [ {
    "@type" : "OpeningHoursSpecification",
    "dayOfWeek" : [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday", "Saturday" ],
    "opens" : "00:00",
    "closes" : "24:00"
  } ],
  "@id" : "https://www.elitequalityhvac.com"
}
