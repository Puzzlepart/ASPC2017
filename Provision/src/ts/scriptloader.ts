/// <reference path="resourcehelper.ts" />
/// <reference path="projectportal-shared.ts" />

declare function registerCssLink(url: string);
declare function LoadSodByKey(url: string);

namespace Pzl.ScriptLoader {
    export module References {
        function ReferenceCss() {
            registerCssLink(Pzl.SharedResources.CDN.CSS_FOLDER + '/pzl-branding.css?rev=20170202');
        }
        function ReferenceJs() {
            SP.SOD.registerSod('jquery.min.js', Pzl.SharedResources.CDN.LIBS_FOLDER + '/js/jquery.min.js');
        }
        export function ReferenceAll() {
            ReferenceCss();
            ReferenceJs();
        }
    }

    References.ReferenceAll();
}