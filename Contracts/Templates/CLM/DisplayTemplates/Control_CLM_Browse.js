/* This file is currently associated to an HTML file of the same name and is drawing content from it.  Until the files are disassociated, you will not be able to move, delete, rename, or make any other changes to this file. */

function DisplayTemplate_01cc65e80eea4559b29bdd26f583aae7(ctx) {
  var ms_outHtml=[];
  var cachePreviousTemplateData = ctx['DisplayTemplateData'];
  ctx['DisplayTemplateData'] = new Object();
  DisplayTemplate_01cc65e80eea4559b29bdd26f583aae7.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['TemplateUrl']='~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fControl_CLM_Browse.js';
  ctx['DisplayTemplateData']['TemplateType']='Control';
  ctx['DisplayTemplateData']['TargetControlType']=['Content Web Parts'];
  this.DisplayTemplateData = ctx['DisplayTemplateData'];

ms_outHtml.push('',''
,''
);
SP.SOD.registerSod('clm.global.js', Srch.U.replaceUrlTokens("~sitecollection/SiteAssets/contracts/js/clm.global.js"));
SP.SOD.loadMultiple(['clm.global.js'],function(){});


if (!$isNull(ctx.ClientControl) &&
    !$isNull(ctx.ClientControl.shouldRenderControl) &&
    !ctx.ClientControl.shouldRenderControl())
{
    return "";
}
ctx.ListDataJSONGroupsKey = "ResultTables";
var $noResults = Srch.ContentBySearch.getControlTemplateEncodedNoResultsMessage(ctx.ClientControl);

var noResultsClassName = "ms-srch-result-noResults";

var ListRenderRenderWrapper = function(itemRenderResult, inCtx, tpl)
{
    var iStr = [];
    iStr.push('<li>');
    iStr.push(itemRenderResult);
    iStr.push('</li>');
    return iStr.join('');
}
ctx['ItemRenderWrapper'] = ListRenderRenderWrapper;
var clmView = localStorage["CLM_View"];
if(clmView == undefined){
    clmView = "cards";
    localStorage["CLM_View"] = "cards";
}
ms_outHtml.push(''
,'    <div class="pzl-view">'
,'        <div class="pzl-toggle-view">'
,'            <span class="pzl-view-group">Views:</span> <span class="pzl-viewtype" onClick="Pzl.viewCards()"><span class="material-icons">view_module</span> Previews</span><span class="pzl-viewtype" onClick="Pzl.viewTable()"><span class="material-icons">view_headline</span> Table</span>'
,'            <span class="pzl-view-group">Options:</span> <span class="pzl-viewtype" onClick="Pzl.clearSearch()"><span class="material-icons">clear</span> Clear Search</span>'
);
    if(ctx.ClientControl.get_showPaging()){
        var pagingInfo = ctx.ClientControl.get_pagingInfo();
        if(!$isEmptyArray(pagingInfo)){
ms_outHtml.push(''
,'            <span class="pzl-view-group last">Paging:</span>'
,'                <div class="pzl-paging">'
,'                    <ul id="Paging" class="ms-srch-Paging">'
);
            for (var i = 0; i < pagingInfo.length; i++) {
                var pl = pagingInfo[i];
                if(!$isNull(pl)) {
                    var imagesUrl = GetThemedImageUrl('searchresultui.png');
                    if(pl.startItem == -1) {
                        var selfLinkId = "SelfLink_" + pl.pageNumber;
ms_outHtml.push(''
,'                        <li id="PagingSelf"><a id="', $htmlEncode(selfLinkId) ,'">', $htmlEncode(pl.pageNumber) ,'</a></li>'
);
                    } else if(pl.pageNumber == -1) {
                        var iconClass = Srch.U.isRTL() ? "ms-srch-pagingNext" : "ms-srch-pagingPrev";
ms_outHtml.push(''
,'                        <li id="PagingImageLink"><a id="PageLinkPrev" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">'
,'                            <span class="ms-promlink-button-image">'
,'                                <img src="', $urlHtmlEncode(imagesUrl) ,'" class="', $htmlEncode(iconClass) ,'" alt="', $htmlEncode(pl.title) ,'" />'
,'                            </span>'
,'                        </a></li>'
);
                    } else if(pl.pageNumber == -2) {
                        var iconClass = Srch.U.isRTL() ? "ms-srch-pagingPrev" : "ms-srch-pagingNext";
ms_outHtml.push(''
,'                        <li id="PagingImageLink"><a id="PageLinkNext" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">'
,'                            <span class="ms-promlink-button-image">'
,'                                <img src="', $urlHtmlEncode(imagesUrl) ,'" class="', $htmlEncode(iconClass) ,'" alt="', $htmlEncode(pl.title) ,'" />'
,'                            </span>'
,'                        </a></li>'
);
                    } else {
                        var pageLinkId = "PageLink_" + pl.pageNumber;
ms_outHtml.push(''
,'                        <li id="PagingLink"><a id="', $htmlEncode(pageLinkId) ,'" href="#" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">', $htmlEncode(pl.pageNumber) ,'</a></li>'
);
                    }
                }
            }
ms_outHtml.push(''
,'            </ul>'
);
        }
    }
ms_outHtml.push(''
,'            </div>'
,'        </div>'
,'    </div>'
,'    <ul class="pzl-clm ', clmView ,' cbs-List">'
,'            ', ctx.RenderGroups(ctx) ,''
,'        </ul>'
);
    if (ctx.ClientControl.get_shouldShowNoResultMessage())
    {
ms_outHtml.push(''
,'        <div class="', noResultsClassName ,'">', $noResults ,'</div>'
);
    }
ms_outHtml.push(''
,'        <div class="pzl-paging bottom">'
);
    if(ctx.ClientControl.get_showPaging()){
        var pagingInfo = ctx.ClientControl.get_pagingInfo();
        if(!$isEmptyArray(pagingInfo)){
ms_outHtml.push(''
,'            <ul id="Paging" class="ms-srch-Paging">'
);
            for (var i = 0; i < pagingInfo.length; i++) {
                var pl = pagingInfo[i];
                if(!$isNull(pl)) {
                    var imagesUrl = GetThemedImageUrl('searchresultui.png');
                    if(pl.startItem == -1) {
                        var selfLinkId = "SelfLink_" + pl.pageNumber;
ms_outHtml.push(''
,'                        <li id="PagingSelf"><a id="', $htmlEncode(selfLinkId) ,'">', $htmlEncode(pl.pageNumber) ,'</a></li>'
);
                    } else if(pl.pageNumber == -1) {
                        var iconClass = Srch.U.isRTL() ? "ms-srch-pagingNext" : "ms-srch-pagingPrev";
ms_outHtml.push(''
,'                        <li id="PagingImageLink"><a id="PageLinkPrev" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">'
,'                            <span class="ms-promlink-button-image">'
,'                                <img src="', $urlHtmlEncode(imagesUrl) ,'" class="', $htmlEncode(iconClass) ,'" alt="', $htmlEncode(pl.title) ,'" />'
,'                            </span>'
,'                        </a></li>'
);
                    } else if(pl.pageNumber == -2) {
                        var iconClass = Srch.U.isRTL() ? "ms-srch-pagingPrev" : "ms-srch-pagingNext";
ms_outHtml.push(''
,'                        <li id="PagingImageLink"><a id="PageLinkNext" href="#" class="ms-commandLink ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">'
,'                            <span class="ms-promlink-button-image">'
,'                                <img src="', $urlHtmlEncode(imagesUrl) ,'" class="', $htmlEncode(iconClass) ,'" alt="', $htmlEncode(pl.title) ,'" />'
,'                            </span>'
,'                        </a></li>'
);
                    } else {
                        var pageLinkId = "PageLink_" + pl.pageNumber;
ms_outHtml.push(''
,'                        <li id="PagingLink"><a id="', $htmlEncode(pageLinkId) ,'" href="#" title="', $htmlEncode(pl.title) ,'" onclick="$getClientControl(this).page(', $htmlEncode(pl.startItem) ,');return Srch.U.cancelEvent(event);">', $htmlEncode(pl.pageNumber) ,'</a></li>'
);
                    }
                }
            }
ms_outHtml.push(''
,'            </ul>'
);
        }
    }
ms_outHtml.push(''
,'        </div>'
,'    '
);

  ctx['DisplayTemplateData'] = cachePreviousTemplateData;
  return ms_outHtml.join('');
}
function RegisterTemplate_01cc65e80eea4559b29bdd26f583aae7() {

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("Control_List", DisplayTemplate_01cc65e80eea4559b29bdd26f583aae7);
}

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fControl_CLM_Browse.js", DisplayTemplate_01cc65e80eea4559b29bdd26f583aae7);
}
//
        $includeLanguageScript("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fControl_CLM_Browse.js", "~sitecollection/_catalogs/masterpage/Display Templates/Language Files/{Locale}/CustomStrings.js");
    //
}
RegisterTemplate_01cc65e80eea4559b29bdd26f583aae7();
if (typeof(RegisterModuleInit) == "function" && typeof(Srch.U.replaceUrlTokens) == "function") {
  RegisterModuleInit(Srch.U.replaceUrlTokens("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fControl_CLM_Browse.js"), RegisterTemplate_01cc65e80eea4559b29bdd26f583aae7);
}