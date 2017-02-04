Param(
  [string]$Url,
  [string]$WinCred,
  [string]$Template
)
if ($WinCred -ne $null) {
	Connect-SPOnline $Url -Credentials $WinCred | Out-Null
} else {
	Connect-SPOnline $Url | Out-Null
}
$templatePath = ".\Templates\" + $Template + "\template.xml"

$web = Get-SPOWeb
if ($web -ne $null) {
    Apply-SPOProvisioningTemplate $templatePath -Web $web
}