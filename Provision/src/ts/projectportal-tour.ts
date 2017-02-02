/// <reference path="projectportal-shared.ts" />

declare var Tour: any;

module ProjectPortal.IntroTour {
  function GetConfiguration() {
    var deferred = jQuery.Deferred();
    jQuery.getJSON(ProjectPortal.SharedResources.CDN.CONF_FOLDER + '/project.tour.txt').then((data) => {
      deferred.resolve(data);
    });
    return deferred.promise();
  }
  function InjectStartTourFocusButton() {
    var buttonHtml = '<div class="tour-section"><div class="tour-intro">Hei! Det ser ut som om dette er første gang du besøker denne siden. Vil du ha en hurtiggjennomgang av de viktigste funksjonene i prosjektportalen?</div>' +
      '<div class="tour-button" onclick="ProjectPortal.IntroTour.StartTour()">Start tour!</div><div class="tour-button-cancel" onclick="ProjectPortal.IntroTour.RemoveTour()">Nei takk</div></div>';

    jQuery(buttonHtml).prependTo('#project-home .left-zone .ms-webpart-zone').fadeIn();
  }
  function InjectStartTourButton() {
    var buttonHtml = '<div class="tour-small-section"><span class="tour-intro">Vil du ha en hurtiggjennomgang av de viktigste funksjonene i prosjektportalen? </span>' +
      '<span class="tour-button" onclick="ProjectPortal.IntroTour.StartTour()">Start tour!</span></div>';

    jQuery(buttonHtml).appendTo('#project-home .project-tour').fadeIn();
  }
  export function RemoveTour() {
    jQuery('.tour-section').fadeOut();
  }
  export function StartTour() {
    RemoveTour();
    jQuery.when(GetConfiguration()).then((config) => {
      var tour = new Tour(config);

      tour.init();
      tour.start();
    });
  }
  export function Init() {
    var shouldStartTour = GetUrlKeyValue('State');

    InjectStartTourButton();
    if (shouldStartTour && shouldStartTour === 'FromEmail') {
      InjectStartTourFocusButton();
    }
  }
}