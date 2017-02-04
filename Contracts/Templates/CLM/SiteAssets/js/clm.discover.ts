/// <reference path="../../../../typings/index.d.ts" />

module Pzl.Discover {
    interface NotContract {
        Title: string;
        WorkId: string;
    }

    var _loading = false;
    var _dataProviders;
    var _origExecuteQuery = Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQuery;
    var _origExecuteQueries = Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQueries;
    var _excludeIds: string[] = [];
    const NotContractList = 'NotContract';
    const ContractTaskList = 'Contract Tasks';
    const RunOnWebParts = []; //Empty array runs on all web parts, if not add the name of the query group - See https://skodvinhvammen.wordpress.com/2015/11/30/how-to-connect-search-result-webparts-using-query-groups/


    // Get List Item Type metadata
    function GetItemTypeForListName(name): string {
        return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
    }

    // Get User id
    function ensureUser(loginName: string)
    {
        var payload = { 'logonName': loginName }; 
        return $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/ensureuser",
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(payload),
            headers: {
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "accept": "application/json;odata=verbose"
            }
        });  
    }

    export function ExcludeWorkId(id: string, url: string, container: string) {
        _excludeIds.push(id);
        injectCustomQueryVariables();


        var itemType = GetItemTypeForListName(NotContractList);
        var item = {
            "__metadata": { "type": itemType },
            "Title": url,
            "WorkId": id
        };
        var urlContractsList: string = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + NotContractList + "')/Items";
        jQuery.ajax({
            url: urlContractsList,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        }).done(function(data) {
            $("#"+container).attr("workid", data.d.Id);
            $("#"+container).addClass("fade-out");
        });
    }

    export function DiscoverTask(title: string,  url: string, assign: string, container: string, id: string, editlink: string) {
        ensureUser(assign)
        .done(function(data)
        {
            var userId = data.d.Id;
            AddTask(title, url, container, id, userId, editlink)
        })
        .fail(function(data){
            var currentUser = _spPageContextInfo.userId;
            AddTask(title, url, container, id, currentUser, editlink)
        });
    }
    function AddTask(title: string, url: string, container: string, id: string, userId: number, editlink: string) {
        
        var itemType = GetItemTypeForListName(ContractTaskList);
        var linkEditForm = '<a href="' + editlink + '">Go to edit form of document</a>';
        var item = {
            "__metadata": { "type": itemType },
            "Title": title,
            "CLMRelatedContract": url,
            "AssignedToId": userId,
            "Body": linkEditForm
        };
        var urlContractTaskList: string = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + ContractTaskList + "')/Items";
        jQuery.ajax({
            url: urlContractTaskList,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
        }).done(function(data) {
            $("#"+container).attr("taskid", data.d.Id);
            ExcludeWorkId(id, url, container);
        });
    }

    export function UndoExclude(container: string) {
        var itemType = GetItemTypeForListName(NotContractList);

        var itemId = $("#"+container).attr("workid");
        var urlContractsList: string = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + NotContractList + "')/Items('"+ itemId +"')";
        jQuery.ajax({
            url: urlContractsList,
            method: "DELETE",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "If-Match": "*"
            },
            success: function (data){
                $("#"+container).removeClass("fade-out");
            },
            error: function (error) {
                console.log("Error: "+ JSON.stringify(error));
            }
        });

        if($("#"+container).attr("taskid")) {
            var taskId = $("#"+container).attr("taskid");
            var urlTaskList: string = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + ContractTaskList + "')/Items('"+ taskId +"')";
            jQuery.ajax({
                url: urlTaskList,
                method: "DELETE",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "If-Match": "*"
                },
                success: function (data){

                },
                error: function (error) {
                    console.log("Error: "+ JSON.stringify(error));
                }
            });            
        }
    }

    function loadNotContract(): JQueryPromise<{}> {
        var deferred = jQuery.Deferred();
        // Check if the code has to retrieve synonyms
        var urlContractsList: string = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + NotContractList + "')/Items?$select=Title,WorkId";
        var req: XMLHttpRequest = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let data = JSON.parse(this.response);
                    let results: NotContract[] = data.value;
                    if (results) {
                        _excludeIds = [];
                        if (results.length) {
                            for (let i = 0; i < results.length; i++) {
                                let item = results[i];
                                _excludeIds.push(item.WorkId);
                            }
                        }
                    }
                    deferred.resolve();
                }
                else if (this.status >= 400) {
                    deferred.reject(this.statusText);
                }
            }
        }
        req.open('GET', urlContractsList, true);
        req.setRequestHeader('Accept', 'application/json;odata=minimalmetadata');
        req.setRequestHeader("Content-type", "application/json;odata=minimalmetadata");
        req.send();
        return deferred.promise();
    }

    function shouldProcessGroup(group: string): boolean {
        if (RunOnWebParts.length === 0) return true;
        if (RunOnWebParts.indexOf(group) != -1) return true;
        if (RunOnWebParts.indexOf(group.toLowerCase()) != -1) return true;
        if (RunOnWebParts.indexOf(group.toUpperCase()) != -1) return true;
        return false;
    }

    // Function to inject custom variables on page load
    function injectCustomQueryVariables(): void {
        _dataProviders = [];
        var queryGroups = Srch.ScriptApplicationManager.get_current().queryGroups;
        for (var group in queryGroups) {
            if (queryGroups.hasOwnProperty(group) && shouldProcessGroup(group)) {
                var dataProvider = queryGroups[group].dataProvider;
                if (dataProvider) {
                    var properties = dataProvider.get_properties();
                    // add all user variables fetched and stored as spcsrUser.
                    properties["NotContractIds"] = _excludeIds;
                    _dataProviders.push(dataProvider);
                }
            }
        }
    }

    function loadDataAndSearch() {
        if (!_loading) {
            _loading = true;
            // run all async code needed to pull in data for variables

            SP.SOD.executeFunc("search.clientcontrols.js", "Srch.ScriptApplicationManager", () => {
                loadNotContract().then(() => {
                    injectCustomQueryVariables();
                    // reset to original function
                    Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQuery = _origExecuteQuery;
                    Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQueries = _origExecuteQueries;

                    // re-issue query for the search web parts
                    for (var i = 0; i < _dataProviders.length; i++) {
                        // complete the intercepted event
                        _dataProviders[i].raiseResultReadyEvent(new Srch.ResultEventArgs(_dataProviders[i].get_initialQueryState()));
                        // re-issue query
                        _dataProviders[i].issueQuery();
                    }
                });
            });
        }
    }

    // Loader function to hook in client side custom query variables
    function hookCustomQueryVariables() {
        // TODO: Check if we have cached data, if so, no need to intercept for async web parts
        // Override both executeQuery and executeQueries
        Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQuery = (query: Microsoft.SharePoint.Client.Search.Query.Query) => {
            loadDataAndSearch();
            return new SP.JsonObjectResult();
        }

        Microsoft.SharePoint.Client.Search.Query.SearchExecutor.prototype.executeQueries = (queryIds: string[], queries: Microsoft.SharePoint.Client.Search.Query.Query[], handleExceptions: boolean) => {
            loadDataAndSearch();
            return new SP.JsonObjectResult();
        }
    }

    ExecuteOrDelayUntilBodyLoaded(() => {
        try {
            if (typeof (_spBodyOnLoadCalled) === 'undefined' || _spBodyOnLoadCalled) {
                // make sure we are called after the controls are initialized, but before rendered
                Sys.Application.add_init(hookCustomQueryVariables);
                RegisterModuleInit(SP.Utilities.UrlBuilder.urlCombine(_spPageContextInfo.webServerRelativeUrl, 'SiteAssets/contracts/js/clm.discover.js'), hookCustomQueryVariables);
            }
            else {
                // make sure we are called after the controls are initialized, but before rendered
                Sys.Application.add_init(hookCustomQueryVariables);
            }
        } catch (e) { }

        Sys.Application.add_init(hookCustomQueryVariables);
    });
}