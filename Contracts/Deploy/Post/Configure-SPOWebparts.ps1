Param(
  [string]$Url
)

function Configure-SPOWebParts($Web, $ConfigFile) {
    $config = Get-Content -Raw -Path $ConfigFile -Encoding UTF8 | ConvertFrom-Json
    $serverRelativeUrlToWeb =  Get-SPOProperty -ClientObject $Web -Property "ServerRelativeUrl"
    if ($serverRelativeUrlToWeb -eq "/")
    {
        $serverRelativeUrlToWeb = ""
    }

    ForEach($page in $config) {
        $serverRelativeUrl = $serverRelativeUrlToWeb + "/" + $page.Page
        Set-SPOFileCheckedOut -Url $serverRelativeUrl
        ForEach ($webpart in $page.WebParts) {
            $spoView = Get-SPOView -List $webpart.List | ? {$_.ServerRelativeUrl -eq $serverRelativeUrl}
            $confView = $webpart.View

            if($spoView -ne $null) {
                if ($confView.RowLimit) {$spoView.RowLimit = $confView.RowLimit}
                if ($confView.Paged -ne $null) {$spoView.Paged = $confView.Paged }
                if ($confView.ViewQuery) {$spoView.ViewQuery = $confView.ViewQuery}
                if ($confView.ViewFields) {
                    $spoView.ViewFields.RemoveAll()
                    $confView.ViewFields | % {$spoView.ViewFields.Add($_)}
                }
                $spoView.Update()
                if($webpart.JSLink) {
                    if($webpart.Title) {
                        Write-Host "Configuring web part of page $serverRelativeUrl"
                        $wp = Get-SPOWebPart -ServerRelativePageUrl $page.Page -Identity $webpart.Title
                        Set-SPOWebPartProperty -ServerRelativePageUrl $page.Page -Identity $wp.Id  -Key "JSLink" -Value $webpart.JSLink
                    }
                }
            }
        }

        Set-SPOFileCheckedIn -Url $serverRelativeUrl
    }
    Execute-SPOQuery
}
$Web = Get-SPOWeb
Configure-SPOWebParts -Web $Web -ConfigFile "Deploy\Post\webpart-views.json"