/// <reference path="../../typings/index.d.ts" />

namespace ProjectPortal.SharedResources {
    export module CDN {
        export const SITECOL_SERVER_RELATIVE_URL = '/sites/matrix-cdn';
        export const ROOT_FOLDER = SITECOL_SERVER_RELATIVE_URL + '/SiteAssets/CDN';
        export const DIRECTIVES_FOLDER = ROOT_FOLDER + '/html';
        export const IMAGES_FOLDER = ROOT_FOLDER + '/img';
        export const SOURCELOGOS_FOLDER = IMAGES_FOLDER + '/sourcelogos';
        export const CSS_FOLDER = ROOT_FOLDER + '/css';
        export const LIBS_FOLDER = ROOT_FOLDER + '/libs';
        export const SCRIPT_FOLDER = ROOT_FOLDER + '/js';
        export const CONF_FOLDER = ROOT_FOLDER + '/config';
    }
    export module Directory {
        export const SITE_DIRECTORY_RELATIVE_URL = '/sites/collaboration';
        export const SHARED_TOOLS_LIST_NAME = 'Project tools';
    }
    export module Project {
        export const PROJECT_TOOLS_LIST_NAME = 'Project Assets';
    }
}

namespace ProjectPortal.SharedFunctions {
    export function OpenInDialog(url: string, title: string) {
        SP.UI.ModalDialog.showModalDialog({
            url: url,
            title: title
        });
    }
    /** 
     * Checks if groupName is part of a real group with substring matchinc. Eg. Owners will match "TeamSite001 Owners" 
     */
    export function CurrentUserIsMemberOf(groupName: string): JQueryPromise<boolean> {
        var deferred = jQuery.Deferred(function () {
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {
                var context = SP.ClientContext.get_current();
                var allGroups = context.get_web().get_siteGroups();
                context.load(allGroups);
                context.load(allGroups, 'Include(Users)');

                context.executeQueryAsync(
                    function () {
                        var found = false;
                        var groupInfo;
                        var groupsEnumerator = allGroups.getEnumerator();
                        while (groupsEnumerator.moveNext()) {
                            var group = groupsEnumerator.get_current();
                            if (group.get_title().indexOf(groupName) !== -1) {
                                var usersEnumerator = group.get_users().getEnumerator();
                                while (usersEnumerator.moveNext()) {
                                    var user = usersEnumerator.get_current();
                                    if (user.get_id() === _spPageContextInfo.userId) {
                                        found = true;
                                        break;
                                    }
                                }
                            }
                        }
                        deferred.resolve(found);
                    },
                    function (sender, args) {
                        deferred.reject(args.get_message());
                    }
                );
            }, 'sp.js');
        });
        return deferred.promise();
    }
}