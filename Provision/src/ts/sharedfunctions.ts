namespace Pzl.SharedResources {
    export module CDN {
        export const SITECOL_SERVER_RELATIVE_URL = '/sites/pzl-cdn';
        export const ROOT_FOLDER = 'https://publiccdn.sharepointonline.com/appsters2017.sharepoint.com/14550064ec12c5e40d0535ecbda631e812ec4521a87d3e6f671ce5681cc98e91cdf1aa4b';
        export const DIRECTIVES_FOLDER = ROOT_FOLDER + '/html';
        export const IMAGES_FOLDER = ROOT_FOLDER + '/img';
        export const CSS_FOLDER = ROOT_FOLDER + '/css';
        export const LIBS_FOLDER = ROOT_FOLDER + '/libs';
        export const SCRIPT_FOLDER = ROOT_FOLDER + '/js';
        export const CONF_FOLDER = ROOT_FOLDER + '/config';
    }
    export module Directory {
        export const SITE_DIRECTORY_RELATIVE_URL = '/sites/directory';
    }
}

namespace Pzl.SharedFunctions {
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