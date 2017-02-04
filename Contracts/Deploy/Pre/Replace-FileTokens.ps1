param(
    [string]$Url
)
function Replace-FileTokens([string]$FolderPath, $ServerRelativeUrlToSite, $ServerRelativeUrlToWeb) {
    Get-ChildItem $FolderPath -Recurse -File | % {
        $content = Get-Content ($_.FullName)
        $newFileName = $_.FullName.Replace("-tokens.html", ".html");
        $content.Replace("{sitecollection}", $ServerRelativeUrlToSite).Replace("{site}", $ServerRelativeUrlToWeb) | Out-File -FilePath $newFileName -Encoding utf8
    }
}
Connect-SPOnline $Url
$Site = Get-SPOSite
$Web = Get-SPOWeb
$ServerRelativeUrlToSite = Get-SPOProperty -ClientObject $site -Property "ServerRelativeUrl"
$ServerRelativeUrlToWeb = Get-SPOProperty -ClientObject $web -Property "ServerRelativeUrl"
Replace-FileTokens -FolderPath ".\Templates\Collab\Resources\DefaultMetadata\" -ServerRelativeUrlToSite $ServerRelativeUrlToSite -ServerRelativeUrlToWeb $ServerRelativeUrlToWeb