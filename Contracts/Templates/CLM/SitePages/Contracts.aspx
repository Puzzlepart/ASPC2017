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
    <table width="100%" cellpadding="0" cellspacing="0" class="clm-wp-zones contracts-home" id="wp-zones-table">
        <tr>
            <td valign="top" class="top-left-zone">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" Title="Top Left Zone" ID="TopLeftColumn" Orientation="Vertical" />
                &#160;
            </td>
            <td valign="top" class="top-middle-zone">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" Title="Top Middle Zone" ID="TopMIddleColumn" Orientation="Vertical" />
                &#160;
            </td>
            <td valign="top" class="top-right-zone">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" Title="Top Right Zone" ID="TopRightColumn" Orientation="Vertical" />
                &#160;
            </td>
            <td>&#160;</td>
        </tr>
        <tr>
            <td valign="top" class="main-zone" colspan="3">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" Title="Main Zone" ID="MainColumn" Orientation="Vertical" />
                &#160;
            </td>
            <td>&#160;</td>
        </tr>
    </table>
</asp:Content>