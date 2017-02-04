Param(
  [string]$Url
)

function Configure-SPONavigation($Web, $ConfigFile) {
    $config = Get-Content -Raw -Path $ConfigFile -Encoding UTF8 | ConvertFrom-Json
    ForEach ($node in $config.QuickLaunch) {
        $nodeUrl = $node.Url -replace "{site}", $Web.Url
        Remove-SPONavigationNode -Location QuickLaunch -Title $node.Title -Web $Web -Force
        if (-not $node.Remove) {
            Add-SPONavigationNode -Location QuickLaunch -Title $node.Title -Url $nodeUrl -Web $Web
        }
    }
    ForEach ($node in $config.TopNavigationBar) {
        $nodeUrl = $node.Url -replace "{site}", $Web.Url
        Remove-SPONavigationNode -Location TopNavigationBar -Title $node.Title -Web $Web -Force
        if (-not $node.Remove) {
            Add-SPONavigationNode -Location TopNavigationBar -Title $node.Title -Url $nodeUrl -Web $Web
        }
    }
    ForEach ($node in $config.SearchNav) {
        $nodeUrl = $node.Url -replace "{site}", $Web.Url
        Remove-SPONavigationNode -Location SearchNav -Title $node.Title -Web $Web -Force
        if (-not $node.Remove) {
            Add-SPONavigationNode -Location SearchNav -Title $node.Title -Url $nodeUrl -Web $Web
        }
    }
}
$Web = Get-SPOWeb
Configure-SPONavigation -Web $Web -ConfigFile "Deploy\Post\navigation-links.json"