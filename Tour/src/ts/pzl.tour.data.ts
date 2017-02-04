/// <reference path="pzl.tour.ts" />

module Pzl.Office365Tour.Data {
	function GetProgressIndicatorMarkup(index: number) {
		var totalSteps = Pzl.Office365Tour.LOADEDTOUR.steps.length;

		var progressIndicator = jQuery('<ul class="tour-progress-indicator"></ul>');
		for (var x = 0; x < totalSteps; x++) {
			if (x === index) {
				progressIndicator.append('<li class="current"></li>');
			} else {
				progressIndicator.append('<li></li>');
			}
		}
		return progressIndicator[0].outerHTML;
	}
	function GetStepMarkup(i, step) {
		var prevStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_PREV_STEP_LABEL');
		var nextStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_NEXT_STEP_LABEL');
		var pauseStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_PAUSE_STEP_LABEL');

		var progressMarkup = GetProgressIndicatorMarkup(i);
		return '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3>' +
			'<button class="ms-Button tour-end-btn" data-role="end" title="End tour"><span class="ms-Icon ms-Icon--Clear"> </span></button>' +
			'<div class="popover-content"></div>' +
			progressMarkup +
			'<div class="popover-navigation"><div class="btn-group">' +
			'<button class="ms-Button" data-role="prev"><span class="ms-Button-label">' + prevStepLabel + '</span></button>' +
			'<button class="ms-Button ms-Button--primary" data-role="next"><span class="ms-Button-label">' + nextStepLabel + '</span></button>' +
			'<button class="ms-Button" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume"><span class="ms-Button-label">' + pauseStepLabel + '</button></span></div>' +
			'</div></div>';
	}
	function GetLastStepMarkup(i, step) {
		var lastStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_LAST_STEP_LABEL');
		var prevStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_PREV_STEP_LABEL');
		var pauseStepLabel = Pzl.Office365Tour.RESOURCEPROVIDER.getResource('TOUR_PAUSE_STEP_LABEL');

		var progressMarkup = GetProgressIndicatorMarkup(i);
		return '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3>' +
			'<button class="ms-Button tour-end-btn" data-role="end" title="End tour"><span class="ms-Icon ms-Icon--Clear"> </span></button>' +
			'<div class="popover-content"></div>' +
			progressMarkup +
			'<div class="popover-navigation"><div class="btn-group">' +
			'<button class="ms-Button" data-role="prev"><span class="ms-Button-label">' + prevStepLabel + '</span></button>' +
			'<button class="ms-Button ms-Button--primary" data-role="end"><span class="ms-Button-label">' + lastStepLabel + '</span></button>' +
			'<button class="ms-Button" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume"><span class="ms-Button-label">' + pauseStepLabel + '</button></span></div>' +
			'</div></div>';
	}
	function GetBaseConfiguration() {
		var deferred = jQuery.Deferred();
		jQuery.getJSON(Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL + '/SiteAssets/pzl-tour/config/tour.txt').then((data) => {
			data['onEnd'] = function (tour) { Pzl.Office365Tour.EndTour(tour); };
			data['template'] = function (i, step) {
				return GetStepMarkup(i, step);
			};

			deferred.resolve(data);
		});

		return deferred.promise();
	}
	function GetPageRelativeUrl() {
		var webRelativeUrl = _spPageContextInfo.webServerRelativeUrl;
		var fullRelativeUrl = document.location.pathname;
		if (webRelativeUrl !== '/') {
			fullRelativeUrl = fullRelativeUrl.replace(webRelativeUrl, '');
		}
		return fullRelativeUrl;
	}
	export function IsCurrentPageTourSkipped() {
		var skippedUrls = JSON.parse(sessionStorage.getItem('pzl-tour-skipped-urls'));
		if (skippedUrls) {
			for (var i = 0; i < skippedUrls.length; i++) {
				if (skippedUrls[i] === window.location.pathname) {
					return true;
				}
			}
		}
		return false;
	}
	export function PersistSkipTourForCurrentPage() {
		var skippedUrls = JSON.parse(sessionStorage.getItem('pzl-tour-skipped-urls'));
		if (!skippedUrls) {
			skippedUrls = [];
		}
		skippedUrls.push(window.location.pathname);
		sessionStorage.setItem('pzl-tour-skipped-urls', JSON.stringify(skippedUrls));
		Pzl.Office365Tour.Log('Persisted tour skipped for current user/session');
	}
	export function GetCurrentUserWatchedCurrentPage() {
		var deferred = jQuery.Deferred();

		var pageRelativeUrl = GetPageRelativeUrl();
		var pageRelativeUrlForRest = pageRelativeUrl ? '\'' + encodeURIComponent(pageRelativeUrl) + '\'' : 'null';
		var currentUserWatchedUrl = String.format('{0}/_api/web/Lists/GetByTitle(\'{1}\')/Items?$top=500&$filter=PzlTourRelativeUrl eq {2} and PzlTourWatchterId eq \'{3}\'', Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL, 'Tour Log', pageRelativeUrlForRest, _spPageContextInfo.userId);

		var digest = jQuery('#__REQUESTDIGEST').val();
		jQuery.ajax({
			url: currentUserWatchedUrl,
			headers: {
				'Accept': 'application/json; odata=verbose',
				'X-RequestDigest': digest
			},
			contentType: 'application/json;odata=verbose',
		}).done((data) => {
			deferred.resolve(data.d.results);
		});

		return deferred.promise();
	}
	function GetDataForCurrentPageFromList() {
		var deferred = jQuery.Deferred();

		var pageRelativeUrl = GetPageRelativeUrl();
		var pageRelativeUrlForRest = pageRelativeUrl ? '\'' + encodeURIComponent(pageRelativeUrl) + '\'' : 'null';
		var tourServiceUrl = String.format('{0}/_api/web/Lists/GetByTitle(\'{1}\')/Items?$top=500&$filter=PzlTourRelativeUrl eq {2}&$orderby=PzlTourSortOrder,ID', Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL, 'Tour', pageRelativeUrlForRest);

		var digest = jQuery('#__REQUESTDIGEST').val();
		jQuery.ajax({
			url: tourServiceUrl,
			headers: {
				'Accept': 'application/json; odata=verbose',
				'X-RequestDigest': digest
			},
			contentType: 'application/json;odata=verbose',
		}).done((data) => {
			deferred.resolve(data.d.results);
		});

		return deferred.promise();
	}
	export function GetStepConfiguration(locale: number = _spPageContextInfo.currentLanguage) {
		var deferred = jQuery.Deferred();

		if (Pzl.Office365Tour.LOADEDTOUR) {
			deferred.resolve(Pzl.Office365Tour.LOADEDTOUR);
		} else {
			jQuery.when(
				GetBaseConfiguration(),
				GetDataForCurrentPageFromList()
			).then((config, stepsData) => {
				config['steps'] = config['steps'] || [];
				for (var x = 0; x < stepsData.length; x++) {
					var currentStep = {
						title: stepsData[x].Title,
						modified: stepsData[x].Modified,
						sortorder: stepsData[x].PzlTourSortOrder
					};
					Object.keys(stepsData[x]).forEach(function (key, index) {
						if (key.indexOf('Tour') === 0) {
							var propName = key.replace('Tour', '').toLowerCase();
							currentStep[propName] = stepsData[x][key];
						}
					});
					// If it's the last step we want a slightly different template
					if (x === stepsData.length - 1) {
						currentStep['template'] = function (i, step) {
							return GetLastStepMarkup(i, step);
						};
					}
					// If sortorder is -1 it's a splash screen
					if (stepsData[x].PzlTourSortOrder && stepsData[x].PzlTourSortOrder === -1) {
						config['splash'] = currentStep;
					} else {
						config['steps'].push(currentStep);
					}
				}
				deferred.resolve(config);
			});
		}
		return deferred.promise();
	}
	export function GetLatestDateOfCollection(steps, fieldName): Date {
		if (steps.length === 0) { return new Date(); }

		var latestDate = new Date(steps[0][fieldName]);
		for (var x = 1; x < steps.length; x++) {
			if (latestDate < new Date(steps[x][fieldName])) {
				latestDate = new Date(steps[x][fieldName]);
			}
		}
		return latestDate;
	}
	export function GetFormDigestForSite(url) {
		var deferred = jQuery.Deferred();

		jQuery.ajax({
			type: 'POST',
			headers: {
				'Accept': 'application/json;odata=verbose'
			},
			url: url + '/_api/contextinfo',
			contentType: 'text/html; charset=utf-8',
			dataType: 'html',
			success: function (data, status) {
				var contextInfo = JSON.parse(data);
				deferred.resolve(contextInfo.d.GetContextWebInformation.FormDigestValue);
			},
			error: function (xmlReq) {
				console.log('error: ' + xmlReq.status + ' \n\r ' + xmlReq.statusText + '\n\r' + xmlReq.responseText);
				deferred.reject();
			}
		});
		return deferred.promise();
	};
	export function PersistTourWatched(tour, existingTourWatched) {
		var deferred = jQuery.Deferred();
		var listName = 'Tour Log';

		var pageRelativeUrl = GetPageRelativeUrl();
		var lastModified = GetLatestDateOfCollection(tour._options.steps, 'modified');

		var itemType = GetItemTypeForListName(listName);

		jQuery.when(GetFormDigestForSite(Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL)).then(formDigestValue => {
			var item = {
				'__metadata': { 'type': itemType },
				'Title': 'Tour watched',
				'PzlTourRelativeUrl': pageRelativeUrl,
				'PzlTourWatchterId': _spPageContextInfo.userId,
				'PzlTourModified': lastModified,
				'PzlTourStepOnEnd': tour._state.current_step
			};
			var updateRestAppendix = '';
			var createHeaders = {
				'Accept': 'application/json;odata=verbose',
				'X-RequestDigest': formDigestValue
			};
			if (existingTourWatched && existingTourWatched.ID) {
				updateRestAppendix = `(${existingTourWatched.ID})`;
				var updateHeaders = {
					'Accept': 'application/json;odata=verbose',
					'X-RequestDigest': formDigestValue,
					'X-HTTP-Method': 'MERGE',
					'If-Match': '*'
				};
			}
			jQuery.ajax({
				url: `${Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL}/_api/web/lists/getbytitle('${listName}')/items${updateRestAppendix}`,
				type: 'POST',
				contentType: 'application/json;odata=verbose',
				data: JSON.stringify(item),
				headers: updateHeaders ? updateHeaders : createHeaders,
				success: function (data) {
					Pzl.Office365Tour.Log('Persisted tour watched for current user');
					deferred.resolve(data);
				},
				error: function (data) {
					Pzl.Office365Tour.Log('Unable to persist tour watched for current user');
					deferred.resolve(data);
				}
			});
		});
		return deferred.promise();
	}

	function GetItemTypeForListName(name) {
		return 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1) + 'ListItem';
	}
}