/// <reference path="../../../../typings/index.d.ts" />

module Pzl {
    // Get List Item Type metadata
    function GetItemTypeForListName(name): string {
        return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
    }
    export function Init() {
        if(window.location.href.indexOf("/SitePages/Discover.aspx") > -1 || window.location.href.indexOf("/SitePages/Browse.aspx") > -1 || window.location.href.indexOf("/SitePages/Contracts.aspx") > -1 ) {
            jQuery("html").addClass("clm page");
        }
    }
    export interface IGetItem {
        loadTask: (url: string) => JQueryPromise<void>;
    }
    export class ContractTasks implements IGetItem {
        public loadTask(url: string) {
            var jqxhr = jQuery.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Contract%20Tasks')/items?$top=1&$select=ID,Title,DueDate&$filter=Status ne 'Completed' and CLMRelatedContract eq '" + url + "'",
                type: "GET",
                contentType: "application/json;odata=nometadata",
                headers: {
                    "Accept": "application/json;odata=nometadata",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                }
            });
            return jqxhr;
        }
    }
    export function viewCards() {
        if (localStorage["CLM_View"] == "table") {
            jQuery(".pzl-clm").removeClass("table").addClass("cards");
            localStorage["CLM_View"] = "cards";
        }
    }
    export function viewTable() {
        if (localStorage["CLM_View"] == "cards") {
            jQuery(".pzl-clm").removeClass("cards").addClass("table");
            localStorage["CLM_View"] = "table";
        }
    }
    export function clearSearch() {
        window.location.href = window.location.pathname + window.location.search + "#";
    }
    export function showModalDialog(url: string, title: string, wideview: boolean , containerId: string) {
        var options = {}
        if(wideview){
            options = { url: url, title: title, width: 1200 };
        }
        else {
            options = { url: url, title: title};
        }
        $('#'+ containerId + ' .pzl-update').removeClass('hide');
        SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', function()
        {
            SP.UI.ModalDialog.showModalDialog(options);
        });
    }


    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs("clm.global.js");
}

Pzl.Init();