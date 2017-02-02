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

$tenantURL = ([environment]::GetEnvironmentVariable("APPSETTING_TenantURL"))
if(!$tenantURL){
    $tenant = ([environment]::GetEnvironmentVariable("APPSETTING_Tenant"))
    $tenantURL = [string]::format("https://{0}.sharepoint.com",$tenant)
}


$fallbackSiteCollectionAdmin = ([environment]::GetEnvironmentVariable("APPSETTING_PrimarySiteCollectionOwnerEmail"))
$siteDirectorySiteUrl = ([environment]::GetEnvironmentVariable("APPSETTING_SiteDirectoryUrl"))
$siteDirectoryList = '/Lists/Sites'
$siteTrainingList = '/Lists/SiteOwnerTrainingList'
$managedPath = 'teams' # sites/teams
$columnPrefix = 'PZL_'
$Global:lastContextUrl = ''

#Azure appsettings variables - remove prefix when adding in azure
$appId = ([environment]::GetEnvironmentVariable("APPSETTING_AppId"))
if(!$appId){
    $appId = ([environment]::GetEnvironmentVariable("APPSETTING_ClientId"))
}

$appSecret = ([environment]::GetEnvironmentVariable("APPSETTING_AppSecret"))
if(!$appSecret){
    $appSecret = ([environment]::GetEnvironmentVariable("APPSETTING_ClientSecret"))
}

$uri = [Uri]$tenantURL
$tenantUrl = $uri.Scheme + "://" + $uri.Host
$tenantAdminUrl = $tenantUrl.Replace(".sharepoint", "-admin.sharepoint")


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

function GetMailContent{
    Param(
        [string]$email,
        [string]$mailFile
    )
    $ext = "en";
    if($mail) {
        $ext = $email.Substring($email.LastIndexOf(".")+1)
    }
    $filename = "$PSScriptRoot/resources/$mailFile-mail-$ext.txt"
    if(-not (Test-Path $filename)) {
        $ext = "en"
        $filename = "$PSScriptRoot/resources/$mailFile-mail-$ext.txt"
    }
    return ([IO.File]::ReadAllText($filename)).Split("|")
}

function EnableIRM {
    Param(
        [string]$ownerEmail,
        $classification,
        $siteUrl
    )
        
    $mailHeadBody = GetMailContent -email $ownerEmail -mailFile "irm"

    Connect -Url $siteUrl
    $list = Get-PnPList -Identity '/Shared Documents'    
    $irmEnabled = Get-PnPProperty -ClientObject $list -Property IrmEnabled

    if($classification.Contains("Confidential") -and -not $irmEnabled) {
        #https://blogs.technet.microsoft.com/fromthefield/2015/09/07/office-365-automating-the-configuration-of-information-rights-management-irm-using-csom/
        $list.IrmEnabled = $true
        #Give the Policy a Name and Description
        $list.InformationRightsManagementSettings.PolicyTitle = 'Pzl Confidential'
        $list.InformationRightsManagementSettings.PolicyDescription = 'This document is classified as confidential and protected according to Pzl International ASA information handling policy.'
        #Configure the Policy Settings
        $list.InformationRightsManagementSettings.AllowPrint = $false
        $list.InformationRightsManagementSettings.AllowScript = $false
        $list.InformationRightsManagementSettings.AllowWriteCopy = $false
        $list.InformationRightsManagementSettings.DisableDocumentBrowserView = $true
        #$list.InformationRightsManagementSettings.DocumentLibraryProtectionExpireDate = #Date
        $list.InformationRightsManagementSettings.DocumentAccessExpireDays = 90
        $list.InformationRightsManagementSettings.EnableDocumentAccessExpire = $false
        #$list.InformationRightsManagementSettings.EnableDocumentBrowserPublishingView = #$true or $false
        $list.InformationRightsManagementSettings.EnableGroupProtection = $false
        $list.InformationRightsManagementSettings.EnableLicenseCacheExpire = $true
        $list.InformationRightsManagementSettings.LicenseCacheExpireDays = 30
        #$list.InformationRightsManagementSettings.GroupName = #Name of group
        $list.Update()
        $list.Context.ExecuteQuery()
        Write-Output "`tEnabling IRM"
        if($ownerEmail) {
            Write-Output "`tSending IRM change to $ownerEmail"        
            Send-PnPMail -To $ownerEmail -Subject ($mailHeadBody[0] -f $siteUrl) -Body ($mailHeadBody[1] -f $siteUrl,"enabled")
        }
    }
    if(-not $classification.Contains("Confidential") -and $irmEnabled) {
        $list.IrmEnabled = $false
        $list.Update()
        $list.Context.ExecuteQuery()
        Write-Output "`tDisabling IRM"
        if($ownerEmail) {
            Write-Output "`tSending IRM change to $ownerEmail"
            Send-PnPMail -To $ownerEmail -Subject ($mailHeadBody[0] -f $siteUrl) -Body ($mailHeadBody[1] -f $siteUrl,"disabled")
        }
    }
}

function SetRequestAccessEmail([string]$url, [string]$ownersEmail) {
    Connect -Url $url
    $emails = Get-PnPRequestAccessEmails
    if($emails -ne $ownersEmail) {
        Write-Output "`tSetting site request e-mail to $ownersEmail"    
        Set-PnPRequestAccessEmails -Emails $ownersEmail
    }
}

function DisableMemberSharing([string]$url){
    Connect -Url $url
    $web = Get-PnPWeb
    $canShare = Get-PnPProperty -ClientObject $web -Property MembersCanShare
    if($canShare) {
        Write-Output "`tDisabling members from sharing"
        $web.MembersCanShare = $false
        $web.Update()
        $web.Context.ExecuteQuery()
    }
}
