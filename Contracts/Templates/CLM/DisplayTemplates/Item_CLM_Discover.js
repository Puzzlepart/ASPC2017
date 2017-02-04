/* This file is currently associated to an HTML file of the same name and is drawing content from it.  Until the files are disassociated, you will not be able to move, delete, rename, or make any other changes to this file. */

function DisplayTemplate_36962f047ad44007ade27b78ea8013e5(ctx) {
  var ms_outHtml=[];
  var cachePreviousTemplateData = ctx['DisplayTemplateData'];
  ctx['DisplayTemplateData'] = new Object();
  DisplayTemplate_36962f047ad44007ade27b78ea8013e5.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['TemplateUrl']='~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Discover.js';
  ctx['DisplayTemplateData']['TemplateType']='Item';
  ctx['DisplayTemplateData']['TargetControlType']=['Content Web Parts'];
  this.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['ManagedPropertyMapping']={'Card Image':['ServerRedirectedPreviewURL', 'PublishingImage', 'PictureURL', 'PictureThumbnailURL'], 'Link URL':['Path'], 'Title':['Title'], 'Site':['sitetitle'], 'Date':['write'], 'SecondaryFileExtension':null, 'ContentTypeId':null, 'Author':['EditorOWSUSER'], 'ListItemID':null, 'ParentLink':null, 'spweburl':null, 'Preview URL':['ServerRedirectedEmbedURL'], 'CLMNextAttentionDateOWSDATE':null, 'Tag':['CLMContractTypeOWSCHCS'], 'External Party':['CLMExternalPartyOWSTEXT'], 'Industry':['CLMIndustryOWSCHCS'], 'toDate':['CLMToDateOWSDATE'], 'fromDate':['CLMFromDateOWSDATE'], 'orgParty':['CLMOrgPartyOWSTEXT'], 'FileType':null, 'WorkId':null, 'ModifiedBy':null, 'ContractSummaryOWSMTXT':null};
  var cachePreviousItemValuesFunction = ctx['ItemValues'];
  ctx['ItemValues'] = function(slotOrPropName) {
    return Srch.ValueInfo.getCachedCtxItemValue(ctx, slotOrPropName)
};

ms_outHtml.push('',''
);
    function formatDateString(date){
        if( date == null) return "";
        var formattedDate = new Date(date);
        var day = formattedDate.getDate();
        var month = formattedDate.getMonth()+1;
        var year = formattedDate.getFullYear();
        date = day + "/" + month + "/" + year;
        return date;
    }

    function getLibraryWebRelativeUrl(parentLink, spWebUrl) {
        var libLink = parentLink.replace(spWebUrl,'');
        var delimiter = "/";
        var tokens = libLink.split(delimiter);
        if (tokens.length < 2) {
            return tokens.join(delimiter);
        } else {
            if (tokens[1] === "Lists") {
                return tokens.slice(0,3).join(delimiter);
            } else {
                return tokens.slice(0,2).join(delimiter);
            }
        }
    }


    var encodedId = $htmlEncode(ctx.ClientControl.get_nextUniqueId() + "_pictureOnTop_");

    var linkURL = $getItemValue(ctx, "Link URL");
    linkURL.overrideValueRenderer($urlHtmlEncodeValueObject);

    var title = $getItemValue(ctx, "Title");
    var editor = $getItemValue(ctx, "Author");
    var spWebUrl = $getItemValue(ctx,"spweburl").value;
    var docId = $getItemValue(ctx, "ListItemID").value;
    var previewUrl = $getItemValue(ctx, "Preview URL").value;
    var parentLink = $getItemValue(ctx, "ParentLink").value;
    var industry = $getItemValue(ctx, "Industry").value;
    var extParty = $getItemValue(ctx, "External Party").value;
    var orgParty = $getItemValue(ctx, "orgParty").value;
    var todate = $getItemValue(ctx, "toDate").value;
    var todateformatted = formatDateString(todate);
    var fromdate = $getItemValue(ctx, "fromDate").value;
    var fromdateformatted = formatDateString(fromdate);
    var filetype = $getItemValue(ctx, "FileType").value;
    var workId = $getItemValue(ctx, "WorkId").value;
    var modifiedby = $getItemValue(ctx, "ModifiedBy").value;
    var summary = $getItemValue(ctx, "ContractSummaryOWSMTXT").value;

    var siteLink = spWebUrl;
    var libraryWebRelativeUrl = getLibraryWebRelativeUrl(parentLink, siteLink);
    var libraryUrl = spWebUrl + libraryWebRelativeUrl;
    var detailsLink = libraryUrl + "/Forms/DispForm.aspx?ID=" + docId;
    var editLink = libraryUrl + "/Forms/EditForm.aspx?ID=" + docId; 
    var helpLink =_spPageContextInfo.siteAbsoluteUrl + "/SitePages/Help.aspx";

    var email = editor.inputValue;
    var n = email.indexOf("|");
    email = email.substring(0, n);
    var displayName = editor.value[0].entityLabel;

    var loginName = editor.inputValue;
    var n = loginName.indexOf(":");
    loginName = loginName.substring(n-1);

    var userImage = "/_layouts/15/userphoto.aspx?size=M&accountname=" + email;

    var site = $getItemValue(ctx, "Site");

    var date = $getItemValue(ctx, "Date").value;
    date = formatDateString(date);

    var pictureURL = $getItemValue(ctx, "Card Image");
    var pictureId = encodedId + "picture";
    var pictureMarkup = Srch.ContentBySearch.getPictureMarkup(pictureURL, 304, 100, ctx.CurrentItem, "cbs-pictureOnTopImg", title, pictureId);

    var containerId = encodedId + "container";
    var pictureLinkId = encodedId + "pictureLink";
    var pictureContainerId = encodedId + "pictureContainer";
    var dataContainerId = encodedId + "dataContainer";
    var titleLinkId = encodedId + "titleLink";
    var titleId = encodedId + "title";
    var siteId = encodedId + "site";
    var dateId = encodedId + "date";
 ms_outHtml.push(''
,'        <div class="item-wrapper" id="', containerId ,'">'
,'            <div class="fadeout-message">Item will be removed from Discover view (<a onClick="Pzl.Discover.UndoExclude(\'', containerId ,'\');">undo</a>)</div> '
,'            <div class="check-circle"><span class="material-icons">check_circle</span></div>'
,'        <div class="cbs-pictureOnTopContainer" data-displaytemplate="ItemPictureOnTop">'
,''
,'            <div class="cbs-pictureOnTopImageContainer" id="', pictureContainerId ,'">'
,'                <a class="cbs-pictureImgLink" onClick="Pzl.showModalDialog(\'', previewUrl ,'\',\'Document Preview\', false);" title="', $htmlEncode(title) ,'" id="', pictureLinkId ,'">'
,'                    ', pictureMarkup ,''
,'                </a>'
,'                <span onClick="Pzl.showModalDialog(\'', previewUrl ,'\',\'Document Preview\', false);" title="View Document" class="material-icons pzl-showpreview">launch</span>'
,''
,''
);
            if (!$isEmptyString(ctx.CurrentItem.csr_Icon)) {
            ms_outHtml.push(''
,'                <div class="ms-srch-item-icon">'
,'                    <img id="', $htmlEncode(id + Srch.U.Ids.icon) ,'" onload="this.style.display=\'inline\'" src="', $urlHtmlEncodeString(ctx.CurrentItem.csr_Icon) ,'" />'
,'                </div>'
);
            }
            ms_outHtml.push(''
,'            </div>'
,'            <div class="cbs-pictureOnTopDataContainer" id="', dataContainerId ,'">'
,'                <div class="pzl-maincontent">'
,'                    <a class="cbs-pictureOnTopLine1Link col1" onClick="Pzl.showModalDialog(\'', previewUrl ,'\',\'Document Preview\', false);" title="', $htmlEncode(title) ,': ', summary ,'" id="', titleLinkId ,'">'
,'                        <h2 class="cbs-pictureOnTopLine1 ms-accentText2 ms-noWrap" id="', titleId ,'"> ', title ,'</h2>'
,'                    </a>'
,'                    <div class="pzl-externalparty col">'
,'                        <span class="material-icons" title="Parties">person</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(displayName)) {
                            ms_outHtml.push(''
,'                            ', displayName ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false);&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-contractdate col">'
,'                        <span class="material-icons" title="Contract dates">today</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(date)) {
                            ms_outHtml.push(''
,'                            ', date ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false);&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-industry col">'
,'                        <span class="material-icons" title="Category">description</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(filetype)) {
                            ms_outHtml.push(''
,'                            ', filetype ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false);&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-site ms-noWrap col4" title="Site: ', siteLink ,'" id="', siteId ,'">'
,'                        <a href="', siteLink ,'" target="_blank"><span class="material-icons" title="Site: ', siteLink ,'">room</span>', site ,'</a>'
,'                         |'
,'                        <a href="', parentLink ,'" target="_blank" class="pzl-libraryLink" title="Folder: ', parentLink ,'">'
,'                            <span class="material-icons">folder</span>'
,'                        </a>'
,'                    </div>'
,'                    '
,'                    <div class="pzl-contract-yesno">'
);
                            if (siteLink.indexOf('personal') === -1) {
                        ms_outHtml.push(''
,'                        <div class="pzl-contract-yes" onClick="Pzl.Discover.DiscoverTask(\'Classify &quot;', title ,'&quot; as contract\', \'', linkURL ,'\', \'', loginName ,'\', \'', containerId ,'\', \'', workId ,'\', \'', editLink ,'\');&#160;" title="Add task to classify as contract">'
,'                            <span class="material-icons">thumb_up</span>'
,'                        </div>'
);
                            } else {
                        ms_outHtml.push(''
,'                        <div class="pzl-contract-yes" onClick="Pzl.Discover.DiscoverTask(\'Move &quot;', title ,'&quot; and classify as contract\', \'', linkURL ,'\', \'', loginName ,'\', \'', containerId ,'\', \'', workId ,'\', \'', editLink ,'\');&#160;" title="Add task to move and classify as contract">'
,'                            <span class="material-icons">thumb_up</span>'
,'                        </div>'
);
                            }
                        ms_outHtml.push(''
,''
,'                        <div class="pzl-contract-no" onClick="Pzl.Discover.ExcludeWorkId(\'', workId ,'\', \'', linkURL ,'\', \'', containerId ,'\');" title="This is not a contract">'
,'                            <span class="material-icons">thumb_down</span>'
,'                        </div>'
,'                    </div>'
,''
,'                </div>'
,'            </div>'
,'        </div>'
,'        </div>'
);
            AddPostRenderCallback(ctx, function () {
                // Load next action date from item or TASK list

        })
        ms_outHtml.push(''
,'    '
);

  ctx['ItemValues'] = cachePreviousItemValuesFunction;
  ctx['DisplayTemplateData'] = cachePreviousTemplateData;
  return ms_outHtml.join('');
}
function RegisterTemplate_36962f047ad44007ade27b78ea8013e5() {

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("Item_pzlCLM", DisplayTemplate_36962f047ad44007ade27b78ea8013e5);
}

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Discover.js", DisplayTemplate_36962f047ad44007ade27b78ea8013e5);
}

}
RegisterTemplate_36962f047ad44007ade27b78ea8013e5();
if (typeof(RegisterModuleInit) == "function" && typeof(Srch.U.replaceUrlTokens) == "function") {
  RegisterModuleInit(Srch.U.replaceUrlTokens("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Discover.js"), RegisterTemplate_36962f047ad44007ade27b78ea8013e5);
}