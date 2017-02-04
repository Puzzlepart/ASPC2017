<%@ Page language="C#" masterpagefile="~masterurl/default.master" inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Taxonomy" Namespace="Microsoft.SharePoint.Taxonomy" Assembly="Microsoft.SharePoint.Taxonomy, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceHolderPageTitle" runat="server">
    <SharePoint:ProjectProperty property="Title" runat="server" />
</asp:Content>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <SharePoint:ProjectProperty property="Title" runat="server" />
</asp:Content>
<asp:Content ContentPlaceHolderID="PlaceHolderTitleAreaClass" runat="server">
    <SharePoint:ProjectProperty property="Title" runat="server" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
</asp:Content>

<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/fabric-core/4.0.0/fabric.min.css">
    <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/fabric-js/1.0.0/fabric.components.min.css"> 
    
    <div class="pzl-docprop">
        <div class="pzl-prop" style="float:left; width:600px;">
            <div class="doc-field">
                    <label>Title</label>
            </div>
            <div class="doc-field">
                    <label>Next attention date</label>
            </div>
            <div class="doc-field">
                    <label>Interal Party</label>
            </div>
            <div class="doc-field">
                    <label>External Party</label>
            </div>
            <div class="doc-field">
                    <label>Contract Start Date</label>
            </div>
            <div class="doc-field">
                    <label>Contract End Date</label>
            </div>
            <div class="doc-field">
                    <label>Industry</label>
            </div>
            <div class="doc-field">
                    <label>Contract Type</label>
            </div>
            <div class="doc-field">
                    <label>Summary</label>
            </div>
            

        </div>
        <div class="pzl-doc" style="float:left; width:600px">
            <iframe src="" style="width:600px; height:600px"></iframe>
        </div>
	</div>

    <script type="text/javascript">
        "use strict";
        (function($) {
            function getUrlParameter(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            }

            function init() {
                $(document).ready(function() {
                    var properties = getUrlParameter("properties");
                    var docpreview = getUrlParameter("docpreview");
                    properties = decodeURI(properties);
                    docpreview = decodeURI(docpreview);

                    jQuery(".pzl-doc iframe").attr("src", docpreview + "&action=interactivepreview&IsDlg=1");         
                });
            }
            ExecuteOrDelayUntilBodyLoaded(function() {
                init();
            });
        })(jQuery);
    </script>
</asp:Content>