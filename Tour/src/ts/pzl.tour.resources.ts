/// <reference path="pzl.tour.ts" />

module Pzl.Office365Tour.Resources {
    export const TOUR_CENTRAL_URL = '/sites/tour-central';
    export class Provider {
        private _resources: { [key: string]: string; };

        public getResource(key: string) {
            return this._resources[key] ? this._resources[key] : key;
        }
        public addResource(key: string, value: string) {
            this._resources[key] = value;
        }

        public constructor() {
            this._resources = {};
        }
    }

    function LoadFile(locale: number) {
        var deferred = jQuery.Deferred();

        var fallbackFileName = 'tour.resources.txt';
        var currentLanguageFileName = String.format('tour.resources.{0}.txt', locale);

        jQuery.getJSON(Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL + '/SiteAssets/pzl-tour/config/' + currentLanguageFileName).then((data) => {
            deferred.resolve(data);
        }).fail(() => {
            jQuery.getJSON(Pzl.Office365Tour.Resources.TOUR_CENTRAL_URL + '/SiteAssets/pzl-tour/config/' + fallbackFileName).then((data) => {
                deferred.resolve(data);
            }).fail(() => {
                deferred.resolve(null);
            });
        });

        return deferred.promise();
    }
    export function LoadFromFile(locale: number = _spPageContextInfo.currentLanguage) {
        var deferred = jQuery.Deferred();

        jQuery.when(
            LoadFile(locale)
        ).then((file) => {
            var provider = new Provider();
            if (file) {
                Object.keys(file).forEach(function (key, index) {
                    provider.addResource(key, file[key]);
                });
            }
            deferred.resolve(provider);
        });

        return deferred.promise();
    }
}