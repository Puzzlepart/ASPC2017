declare function registerCssLink(url: string);
declare function LoadSodByKey(url: string);

namespace Pzl.Office365Tour.DependencyLoader {
    export module Util {
        export function IsPageADialog(): boolean {
            return window.location.search.toLowerCase().indexOf('isdlg=1') !== -1;
        }
    }
    export module References {
        var CDN_SCRIPTLOCATION = '/sites/tour-central/SiteAssets/pzl-tour/js';
        var CDN_STYLELOCATION = '/sites/tour-central/SiteAssets/pzl-tour/css';

        function ReferenceCss() {
            if (!Util.IsPageADialog()) {
                registerCssLink(CDN_STYLELOCATION + '/fabric.min.css');
                registerCssLink(CDN_STYLELOCATION + '/fabric.components.css');
                registerCssLink(CDN_STYLELOCATION + '/bootstrap-tour-standalone.css');
                registerCssLink(CDN_STYLELOCATION + '/pzl.tour.css');
            };
        }
        function ReferenceJs() {
            SP.SOD.registerSod('jquery.min.js', CDN_SCRIPTLOCATION + '/jquery.min.js');
            SP.SOD.registerSod('bootstrap-tour-standalone.js', CDN_SCRIPTLOCATION + '/bootstrap-tour-standalone.js');
            SP.SOD.registerSod('fabric.js', CDN_SCRIPTLOCATION + '/fabric.js');
            SP.SOD.registerSod('pzl.tour.js', CDN_SCRIPTLOCATION + '/pzl.tour.js');

            SP.SOD.registerSodDep('bootstrap-tour-standalone.js', 'jquery.min.js');
            SP.SOD.registerSodDep('pzl.tour.js', 'jquery.min.js');
            SP.SOD.registerSodDep('pzl.tour.js', 'fabric.js');
            SP.SOD.registerSodDep('pzl.tour.js', 'bootstrap-tour-standalone.js');
        }
        function ReferenceAll() {
            ReferenceCss();
            ReferenceJs();
            LoadSodByKey('pzl.tour.js');
        }
        export function WaitForPageContextAndReferenceDeps() {
            var interval = setInterval(function () {
                if (_spPageContextInfo) {
                    clearInterval(interval);
                    ReferenceAll();
                }
            }, 100);
        };
    }
    References.WaitForPageContextAndReferenceDeps();
}