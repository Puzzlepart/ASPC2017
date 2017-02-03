/// <reference path="pzl.tour.data.ts" />
/// <reference path="pzl.tour.resources.ts" />

module Pzl.Office365Tour {
	export var LOADEDTOUR = null;
	export var CURRENTUSERTOUR = null;
	export var RESOURCEPROVIDER: Pzl.Office365Tour.Resources.Provider;
	declare var Tour: any;
	declare var fabric: any;

	export function Log(entry: string) {
		console.log(`Pzl-Tour: ${entry}`);
	}
	function ShowSplashScreen(tourUpdated: boolean) {
		Pzl.Office365Tour.Log('Showing splash - ' + (tourUpdated ? 'tour updated' : 'tour first run'));
		jQuery('<div id="pzl-tour-splash-container"></div>').prependTo('#s4-bodyContainer');

		jQuery.get(_spPageContextInfo.webAbsoluteUrl + '/SiteAssets/pzl-tour/html/tour.splash.txt', function (data) {
			var tourTitle = tourUpdated ? RESOURCEPROVIDER.getResource('SPLASH_TOUR_UPDATED_DEFAULT_TITLE') : RESOURCEPROVIDER.getResource('SPLASH_DEFAULT_TITLE');
			var startTourBtn = tourUpdated ? RESOURCEPROVIDER.getResource('SPLASH_TOUR_UPDATED_DEFAULT_START_BTN_LABEL') : RESOURCEPROVIDER.getResource('SPLASH_DEFAULT_START_BTN_LABEL');
			var tourIntroText = RESOURCEPROVIDER.getResource('SPLASH_DEFAULT_INTRO_TEXT');
			var skipTourBtn = RESOURCEPROVIDER.getResource('SPLASH_DEFAULT_SKIP_BTN_LABEL');
			var splashContent = String.format(data, tourTitle, tourIntroText, startTourBtn, skipTourBtn);

			if (Pzl.Office365Tour.LOADEDTOUR && Pzl.Office365Tour.LOADEDTOUR.splash) {
				splashContent = String.format(data, Pzl.Office365Tour.LOADEDTOUR.splash.title, Pzl.Office365Tour.LOADEDTOUR.splash.content, startTourBtn, skipTourBtn);
			}
			jQuery('#pzl-tour-splash-container').html(splashContent);

			// See https://github.com/tarjeieo/office-ui-fabric-js/blob/master/ghdocs/components/Dialog.md
			var dialogElement = document.querySelector('.ms-Dialog');
			var dialogComponent = new fabric['Dialog'](dialogElement);
			dialogComponent.open();
		});
	}
	function CheckIfLoaded(callBack, elementSelector, counter = 0) {
		var timeOut = setTimeout(function () {
			if (counter > 10) {
				clearTimeout(timeOut);
				Pzl.Office365Tour.Log('Help pane not available for this page');
			} else if (jQuery(elementSelector).length === 0) {
				Pzl.Office365Tour.Log(elementSelector + ' not yet ready. Waiting...');
				CheckIfLoaded(callBack, elementSelector, counter + 1);
			} else {
				Pzl.Office365Tour.Log('Injecting link in help pane');
				callBack();
			}
		}, 1000);
	}

	function InjectStartTourButton() {
		CheckIfLoaded(function () {
			var startTourLabel = RESOURCEPROVIDER.getResource('EMBEDDED_START_TOUR_LABEL');
			var buttonHtml = `<button type="button" title="${startTourLabel}" class="o365cs-customsupport-entry ms-fcl-tp o365button pzl-start-tour" onclick="Pzl.Office365Tour.StartTourFromHelpPane();return false;"><span class="o365-search-icon owaimg ms-Icon--starburst ms-icon-font-size-17"> </span><span>${startTourLabel}</span></button>`;
			jQuery('#o365cs-flexpane-overlay #O365fpcontainerid .o365cs-nfd .o365-help-flex-pane-label').after(buttonHtml);
		}, '#o365cs-flexpane-overlay #O365fpcontainerid .o365cs-nfd .o365-help-flex-pane-label');
	}
	export function OnSplashStartTourClicked() {
		jQuery('#pzl-tour-splash-container').hide();
		StartTour();
	}
	export function OnSplashNoTourClicked() {
		jQuery('#pzl-tour-splash-container').hide();
		Pzl.Office365Tour.Data.PersistSkipTourForCurrentPage();
	}
	export function EndTour(tour: any) {
		Pzl.Office365Tour.Data.PersistTourWatched(tour, Pzl.Office365Tour.CURRENTUSERTOUR);
	}
	export function StartTourFromHelpPane() {
		jQuery('#o365cs-flexpane-overlay #O365fpcontainerid .o365cs-flexPane-closebutton.o365button').click();
		StartTour();
	}
	export function StartTour() {
		jQuery.when(
			Pzl.Office365Tour.Data.GetStepConfiguration()
		).then((config) => {
			Pzl.Office365Tour.Log('Starting tour of current page');
			var tour = new Tour(config);
			tour.init();
			tour.start();
		});
	}
	export function Init() {
		jQuery(document).ready(() => {
			var currentLanguage = _spPageContextInfo.currentLanguage;
			jQuery.when(
				Pzl.Office365Tour.Resources.LoadFromFile(currentLanguage),
				Pzl.Office365Tour.Data.GetStepConfiguration(currentLanguage),
				Pzl.Office365Tour.Data.GetCurrentUserWatchedCurrentPage()
			).then((resourceProvider, config, currentUserWatched) => {
				Pzl.Office365Tour.LOADEDTOUR = config;
				Pzl.Office365Tour.RESOURCEPROVIDER = <Pzl.Office365Tour.Resources.Provider>resourceProvider;

				if (currentUserWatched.length > 0) {
					Pzl.Office365Tour.CURRENTUSERTOUR = currentUserWatched[0];
				}

				if (config['steps'].length > 0) {
					InjectStartTourButton();

					if (!Pzl.Office365Tour.Data.IsCurrentPageTourSkipped()) {
						var tourLastModifiedDate = Pzl.Office365Tour.Data.GetLatestDateOfCollection(config['steps'], 'modified');
						if (!Pzl.Office365Tour.CURRENTUSERTOUR) {
							ShowSplashScreen(false);
						} else if (new Date(Pzl.Office365Tour.CURRENTUSERTOUR.PzlTourModified) < tourLastModifiedDate) {
							ShowSplashScreen(true);
						} else {
							Pzl.Office365Tour.Log('Tour already taken for this page/user');
						}
					} else {
						Pzl.Office365Tour.Log('Tour already skipped for user/session');
					}
				}
			});
		});
	}
}
Pzl.Office365Tour.Init();