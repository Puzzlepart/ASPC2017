/* This file is currently associated to an HTML file of the same name and is drawing content from it.  Until the files are disassociated, you will not be able to move, delete, rename, or make any other changes to this file. */

function DisplayTemplate_fa52b206d6204df69b72452104920c59(ctx) {
  var ms_outHtml=[];
  var cachePreviousTemplateData = ctx['DisplayTemplateData'];
  ctx['DisplayTemplateData'] = new Object();
  DisplayTemplate_fa52b206d6204df69b72452104920c59.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['TemplateUrl']='~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Browse.js';
  ctx['DisplayTemplateData']['TemplateType']='Item';
  ctx['DisplayTemplateData']['TargetControlType']=['Content Web Parts'];
  this.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['ManagedPropertyMapping']={'Card Image':['ServerRedirectedPreviewURL', 'PublishingImage', 'PictureURL', 'PictureThumbnailURL'], 'Link URL':['Path'], 'Title':['Title'], 'Site':['sitetitle'], 'Date':['write'], 'SecondaryFileExtension':null, 'ContentTypeId':null, 'Author':['EditorOWSUSER'], 'ListItemID':null, 'ParentLink':null, 'spweburl':null, 'Preview URL':['ServerRedirectedEmbedURL'], 'CLMNextAttentionDateOWSDATE':null, 'Tag':['CLMContractTypeOWSCHCS'], 'External Party':['CLMExternalPartyOWSTEXT'], 'Industry':['CLMIndustryOWSCHCS'], 'toDate':['CLMToDateOWSDATE'], 'fromDate':['CLMFromDateOWSDATE'], 'orgParty':['CLMOrgPartyOWSTEXT'], 'ContractSummaryOWSMTXT':null};
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

    function cleanTag(tag){
        if(!tag) {
            return null;
        }
        tag = tag.replace(/([a-z](?=[A-Z]))/g, '$1 ');
        var idx = tag.indexOf(' ');
        return tag.substr(0,idx);
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
    var encodepreviewUrl = encodeURIComponent(previewUrl);
    var parentLink = $getItemValue(ctx, "ParentLink").value;
    var tag = $getItemValue(ctx, "Tag").value;
    var industry = $getItemValue(ctx, "Industry").value;
    var extParty = $getItemValue(ctx, "External Party").value;
    var orgParty = $getItemValue(ctx, "orgParty").value;
    var todate = $getItemValue(ctx, "toDate").value;
    var todateformatted = formatDateString(todate);
    var fromdate = $getItemValue(ctx, "fromDate").value;
    var fromdateformatted = formatDateString(fromdate);
    var summary = $getItemValue(ctx, "ContractSummaryOWSMTXT").value;

    tag = cleanTag(tag);

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

    var userImage = "/_layouts/15/userphoto.aspx?size=M&accountname=" + email;

    var site = $getItemValue(ctx, "Site");

    var date = $getItemValue(ctx, "Date").value;
    date = formatDateString(date);

    var nextAttentionDate = $getItemValue(ctx, "CLMNextAttentionDateOWSDATE").value;
    var nextAttentionDateFormatted = formatDateString(nextAttentionDate);

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
,'        <div class="cbs-pictureOnTopContainer" id="', containerId ,'" data-displaytemplate="ItemPictureOnTop">'
,'            <div class="cbs-pictureOnTopImageContainer" id="', pictureContainerId ,'">'
,'                <a class="cbs-pictureImgLink" onClick="Pzl.showModalDialog(\'', previewUrl ,'\',\'Document Preview\', false, \'', containerId ,'\');" title="', $htmlEncode(title) ,'" id="', pictureLinkId ,'">'
,'                    ', pictureMarkup ,''
,'                </a>'
,'                <span onClick="Pzl.showModalDialog(\'', previewUrl ,'\',\'Document Preview\', false, \'', containerId ,'\');" title="View Document" class="material-icons pzl-showpreview">launch</span>'
,'                    <div class="pzl-warning pzl-action col">'
,'                        <!--<span class="material-icons pzl-warning-icon" title="Upcoming task">report</span>-->'
,'                        <span class="pzl-warning-date" title="Next attention date">', nextAttentionDateFormatted ,'</span>'
,'                    </div>'
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
,'                    <div class="pzl-externalparty col2">'
,'                        <span class="material-icons" title="Parties">group</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(extParty)) {
                            ms_outHtml.push(''
,'                            ', extParty ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false, \'', containerId ,'\');&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                             -'
);
                            if (!$isEmptyString(extParty)) {
                            ms_outHtml.push(''
,'                            ', orgParty ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false, \'', containerId ,'\');&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-contractdate col3">'
,'                        <span class="material-icons" title="Contract dates">date_range</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(fromdateformatted)) {
                            ms_outHtml.push(''
,'                            ', fromdateformatted ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false, \'', containerId ,'\');&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                             -'
);
                            if (!$isEmptyString(todateformatted)) {
                            ms_outHtml.push(''
,'                            ', todateformatted ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false, \'', containerId ,'\');&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-industry col4">'
,'                        <span class="material-icons" title="Category">work</span>'
,'                        <span class="">'
);
                            if (!$isEmptyString(industry)) {
                            ms_outHtml.push(''
,'                            ', industry ,''
);
                             }
                            else {
                            ms_outHtml.push(''
,'                            <a href="#" class="pzl-addproperty" onClick="Pzl.showModalDialog(\'', editLink ,'\', \'Details\', false, \'', containerId ,'\');&#160;">+</a>'
);
                             }
                            ms_outHtml.push(''
,'                        </span>'
,'                    </div>'
,'                    <div class="pzl-site ms-noWrap col5" title="Site: ', siteLink ,'" id="', siteId ,'">'
,'                        <a href="', siteLink ,'" target="_blank"><span class="material-icons" title="Site: ', siteLink ,'">room</span>', site ,'</a>'
,'                         |'
,'                        <a href="', parentLink ,'" class="pzl-libraryLink" title="Folder: ', parentLink ,'">'
,'                            <span class="material-icons" target="_blank">folder</span>'
,'                        </a>'
,'                    </div>'
,'                    <div class="pzl-update hide"><span class="material-icons">update</span><span class="pzl-update-info">This item could have been updated.<br /><br />Changes normally appear within 5 minutes.</span></div>'
,'                    <div class="pzl-slideup close col6 ms-noWrap">'
,'                        <div class="pzl-slideup-title ms-noWrap" onClick="$(this).parent(\'.pzl-slideup\').toggleClass(\'close open\')">Actions <span class="material-icons">expand_less</span></div>'
,'                        <div class="pzl-slideup-content">'
,'                            <div class="task-wrapper"><div class="task-button pzl-button" onClick="Pzl.showModalDialog(_spPageContextInfo.webServerRelativeUrl + \'/Lists/ContractTasks/NewForm.aspx?url=', linkURL ,'&amp;title=Follow up &quot;', title ,'&quot;&amp;duedate=',nextAttentionDateFormatted,'\', \'Add task\', false, \'', containerId ,'\');&#160;">Assign follow-up task</div><a class="task-help" target="_blank" href="', helpLink,'"><span class="material-icons">help</span></a></div>'
,'                            <div class="task-wrapper"><div class="task-metadata pzl-button" onClick="Pzl.showModalDialog(_spPageContextInfo.webServerRelativeUrl + \'/Lists/ContractTasks/NewForm.aspx?url=', linkURL ,'&amp;title=Update metadata for &quot;', title ,'&quot;\', \'Add task\', false, \'', containerId ,'\');&#160;">Assign metadata task</div><a class="task-help" target="_blank" href="', helpLink,'"><span class="material-icons">help</span></a></div>'
,'                            <div class="task-wrapper"><div class="pzl-button" onClick="Pzl.showModalDialog(\'', detailsLink ,'\', \'Details\', false);&#160;">See details</div><a class="task-help" target="_blank" href="', helpLink,'"><span class="material-icons">help</span></a></div>'
,'                        </div>'
,'                    </div>'
,'                </div>'
,'            </div>'
,'        </div>'
);
            AddPostRenderCallback(ctx, function () {
                // Load next action date from item or TASK list
                SP.SOD.executeOrDelayUntilScriptLoaded(function(){
                    var runner = new Pzl.ContractTasks();
                    runner.loadTask(linkURL)
                        .done(function(data) {
                            var item;
                            if (data.value.length > 0) {
                                item = data.value[0];
                            }


                            var twoWeeks = (14 * 24 * 60 * 60 * 1000);
                            var taskDueStamp = new Date().getTime();
                            var now = new Date().getTime();

                            if(item) {
                                var title = item.Title;
                                var dueDate = formatDateString(item.DueDate);
                                jQuery('#' + containerId + ' .pzl-warning-title').text(title);
                                jQuery('#' + containerId + ' .pzl-warning-date').text(dueDate);

                                var taskUrl = "Pzl.showModalDialog(_spPageContextInfo.webServerRelativeUrl + '/Lists/ContractTasks/EditForm.aspx?ID=" + item.ID + "','Edit task',true);";
                                jQuery('#' + containerId + ' .task-button').text("Open follow-up task");
                                jQuery('#' + containerId + ' .task-button').attr("onclick",taskUrl);

                                taskDueStamp = new Date(item.DueDate).getTime() - twoWeeks;
                            } else if(nextAttentionDate > 0) {
                                jQuery('#' + containerId + ' .pzl-warning-title').text("Next attention date");
                                jQuery('#' + containerId + ' .pzl-warning-date').text(nextAttentionDateFormatted);
                                taskDueStamp = new Date(nextAttentionDate).getTime() - twoWeeks;
                            } else {
                                jQuery('#' + containerId + ' .pzl-warning').css('display', 'none');
                            }
                            if(taskDueStamp < now) {
                                jQuery('#' + containerId).toggleClass('warning');
                            }
                    });
                },'clm.global.js');
        })
        ms_outHtml.push(''
,'    '
);

  ctx['ItemValues'] = cachePreviousItemValuesFunction;
  ctx['DisplayTemplateData'] = cachePreviousTemplateData;
  return ms_outHtml.join('');
}
function RegisterTemplate_fa52b206d6204df69b72452104920c59() {

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("Item_pzlCLM", DisplayTemplate_fa52b206d6204df69b72452104920c59);
}

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Browse.js", DisplayTemplate_fa52b206d6204df69b72452104920c59);
}

}
RegisterTemplate_fa52b206d6204df69b72452104920c59();
if (typeof(RegisterModuleInit) == "function" && typeof(Srch.U.replaceUrlTokens) == "function") {
  RegisterModuleInit(Srch.U.replaceUrlTokens("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fItem_CLM_Browse.js"), RegisterTemplate_fa52b206d6204df69b72452104920c59);
}