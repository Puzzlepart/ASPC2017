$ProgressPreference = "SilentlyContinue"
$WarningPreference = "SilentlyContinue"
Add-Type -Path $PSScriptRoot\bundle\Microsoft.SharePoint.Client.Taxonomy.dll -ErrorAction SilentlyContinue
Add-Type -Path $PSScriptRoot\bundle\Microsoft.SharePoint.Client.DocumentManagement.dll -ErrorAction SilentlyContinue
Add-Type -Path $PSScriptRoot\bundle\Microsoft.SharePoint.Client.WorkflowServices.dll -ErrorAction SilentlyContinue
Add-Type -Path $PSScriptRoot\bundle\Microsoft.SharePoint.Client.Search.dll -ErrorAction SilentlyContinue

Add-Type -Path $PSScriptRoot\bundle\Newtonsoft.Json.dll -ErrorAction SilentlyContinue
Add-Type -Path $PSScriptRoot\bundle\Microsoft.IdentityModel.Extensions.dll -ErrorAction SilentlyContinue
Import-Module $PSScriptRoot\bundle\SharePointPnPPowerShellOnline.psd1 -ErrorAction SilentlyContinue

Set-PnPTraceLog -Off
#Set-PnPTraceLog -On -Level Debug -LogFile .\pnp.log

$Global:lastContextUrl = ''
$appId = ([environment]::GetEnvironmentVariable("APPSETTING_AppId"))
if(!$appId){
    $appId = ([environment]::GetEnvironmentVariable("APPSETTING_ClientId"))
}

$appSecret = ([environment]::GetEnvironmentVariable("APPSETTING_AppSecret"))
if(!$appSecret){
    $appSecret = ([environment]::GetEnvironmentVariable("APPSETTING_ClientSecret"))
}

function Connect([string]$Url){
    if($Url -eq $Global:lastContextUrl){
        return
    }
    if ($appId -ne $null -and $appSecret -ne $null) {
        #Write-Output "Connecting to $Url using AppId $appId" 
        Connect-PnPOnline -Url $Url -AppId $appId -AppSecret $appSecret
    } else {
        #Write-Output "AppId or AppSecret not defined, try connecting using stored credentials" -ForegroundColor Yellow
        Connect-PnPOnline -Url $Url
    }
    $Global:lastContextUrl = $Url
}


function GiveAccess([string]$url ) {
    Write-Output "OPEN BAR!"
    Connect -Url $url
    $login = "Everyone"
    $membersGroup = Get-PnPGroup -AssociatedMemberGroup -ErrorAction SilentlyContinue
    $user = New-PnPUser -LoginName $login
    Add-PnPUserToGroup -Identity $membersGroup -LoginName $user.LoginName
}

function RevokeAccess([string]$url ) {
    Write-Output "BAR CLOSED!"
    Connect -Url $url
    $login = "Everyone"
    $membersGroup = Get-PnPGroup -AssociatedMemberGroup -ErrorAction SilentlyContinue
    $user = New-PnPUser -LoginName $login

    Remove-PnPUserFromGroup -Identity $membersGroup -LoginName $user.LoginName
}

GiveAccess -url https://appsters2017.sharepoint.com/teams/TheArchitect

Start-Sleep -Seconds 60

RevokeAccess -url https://appsters2017.sharepoint.com/teams/TheArchitect


Disconnect-PnPOnline