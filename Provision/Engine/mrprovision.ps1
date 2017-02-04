param(
    [switch]$Force
)
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

$siteMetadataToPersist = @([pscustomobject]@{DisplayName = "-SiteDirectory_BusinessOwner-"; InternalName = "$($columnPrefix)BusinessOwner"},
    [pscustomobject]@{DisplayName = "-SiteDirectory_BusinessUnit-"; InternalName = "$($columnPrefix)BusinessUnit"},
    [pscustomobject]@{DisplayName = "-SiteDirectory_InformationClassification-"; InternalName = "$($columnPrefix)InformationClassification"})

$templateConfigurationsList = '/Lists/Templates'
$siteDirectoryList = '/Lists/Sites'
$baseModulesLibrary = 'Modules'
$subModulesLibrary = 'Apps'
$timerIntervalMinutes = 30;
$propBagTemplateInfoStampKey = "_PnP_AppliedTemplateInfo"
$propBagMetadataStampKey = "ProjectMetadata"
$managedPath = 'teams' # sites/teams
$columnPrefix = 'PZL_'
$Global:lastContextUrl = ''

$siteDirectorySiteUrl = ([environment]::GetEnvironmentVariable("APPSETTING_SiteDirectoryUrl"))
$fallbackSiteCollectionAdmin = ([environment]::GetEnvironmentVariable("APPSETTING_PrimarySiteCollectionOwnerEmail"))
$tenantURL = ([environment]::GetEnvironmentVariable("APPSETTING_TenantURL"))
$uri = [Uri]$tenantURL
$tenantUrl = $uri.Scheme + "://" + $uri.Host
$tenantAdminUrl = $tenantUrl.Replace(".sharepoint", "-admin.sharepoint")

#Azure appsettings variables - remove prefix when adding in azure
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

function GetUniqueUrlFromName($title) {
    Connect -Url $tenantAdminUrl
    $cleanName = $title -replace '[^a-z0-9]'
    if([String]::IsNullOrWhiteSpace($cleanName)){
        $cleanName = "team"
    }
    $url = "$tenantUrl/$managedPath/$cleanName"
    $doCheck = $true
    while ($doCheck) {
        Get-PnPTenantSite -Url $url -ErrorAction SilentlyContinue >$null 2>&1
        if($? -eq $true) {
            $url += '1'
        } else {
            $doCheck = $false
        }
    }
    return $url
}

function EnsureSite{
    Param(
        [string]$siteEntryId,
        [string]$title,
        [string]$url,
        [string]$description = "",
        [string]$siteCollectionAdmin,
        [Microsoft.SharePoint.Client.User]$owner,
        [String[]]$ownerAddresses,
        [String[]]$members,
        [String[]]$visitors,
        [Microsoft.SharePoint.Client.FieldUserValue]$requestor,
        [Boolean]$externalSharing
    )

    #Connect admin url
    Connect -Url $tenantAdminUrl

    $site = Get-PnPTenantSite -Url $url -ErrorAction SilentlyContinue
    if( $? -eq $false) {
        Write-Output "Site at $url does not exist - let's create it"

        $siteCollectionAdminToUse = $siteCollectionAdmin

        if ($owner -and $owner.Email) {
            $siteCollectionAdminToUse = $owner.Email
        }
        $site = New-PnPTenantSite -Title $title -Url $url -Owner $siteCollectionAdminToUse -TimeZone 3 -Description $description -Lcid 1033 -Template "STS#0" -RemoveDeletedSite:$true -ResourceQuota 0
        if( $? -eq $false) {
            # send e-mail
            $mailHeadBody = GetMailContent -email $owner.Email -mailFile "fail"
            Write-Output "Sending fail mail to $ownerAddresses"
            Send-PnPMail -To $ownerAddresses -Subject $mailHeadBody[0] -Body ($mailHeadBody[1] -f $url)
            Write-Error "Something happened"
            UpdateStatus -id $siteEntryId -status 'Failed'
            return;
        }
        while($true) {
            # Wait for site to be ready
            Start-Sleep -s 20
            $site = Get-PnPTenantSite -Url $url -ErrorAction SilentlyContinue
            if( $site.Status -eq "Active" ) {
                break;
            }
            Write-Output "`tSite not ready...pausing"            
        }
        Start-Sleep -s 20 # extra sleep before setting site col admins
    } elseif ($site.Status -ne "Active") {
        Write-Output "Site at $url already exist"
        while($true) {
            # Wait for site to be ready
            $site = Get-PnPTenantSite -Url $url
            if( $site.Status -eq "Active" ) {
                break;
            }
            Write-Output "Site not ready"
            Start-Sleep -s 20
        }
        Start-Sleep -s 20 # extra sleep before setting site col admins
    }

    Connect -Url $tenantAdminUrl
    $site = Get-PnPTenantSite -Url $url

    if($externalSharing -and $site.SharingCapability -ne "ExternalUserAndGuestSharing") {
        Write-Output "`tEnabling external sharing for $url"
        Set-PnPTenantSite -Url $url -Sharing ExternalUserAndGuestSharing
    }
    if(-not $externalSharing -and $site.SharingCapability -ne "Disabled") {
        Write-Output "`tDisabling external sharing for $url"
        Set-PnPTenantSite -Url $url -Sharing Disabled
    }    
}

function EnsureSecurityGroups([string]$url, [string]$title, [string[]]$owners, [string[]]$members, [string[]]$visitors, [string]$siteCollectionAdmin) {
    Connect -Url $url

    $visitorsGroup = Get-PnPGroup -AssociatedVisitorGroup -ErrorAction SilentlyContinue
    if( $? -eq $false) {
        Write-Output "Creating visitors group"
        $visitorsGroup = New-PnPGroup -Title "$title Visitors" -Owner $siteCollectionAdmin
        Set-PnPGroup -Identity $visitorsGroup -SetAssociatedGroup Visitors
    }

    $membersGroup = Get-PnPGroup -AssociatedMemberGroup -ErrorAction SilentlyContinue
    if( $? -eq $false) {
        Write-Output "Creating members group"
        $membersGroup = New-PnPGroup -Title "$title Members" -Owner $siteCollectionAdmin
        Set-PnPGroup -Identity $membersGroup -SetAssociatedGroup Members
    }

    $ownersGroup = Get-PnPGroup -AssociatedOwnerGroup -ErrorAction SilentlyContinue
    if( $? -eq $false) {
        Write-Output "Creating owners group"
        $ownersGroup = New-PnPGroup -Title "$title Owners" -Owner $siteCollectionAdmin
        Set-PnPGroup -Identity $ownersGroup -SetAssociatedGroup Owners
    }

    if($owners -ne $null) {
        Write-Output "Adding owners: $owners"
        foreach($login in $owners) {
            $user = New-PnPUser -LoginName $login
            Add-PnPUserToGroup -Identity $ownersGroup -LoginName $user.LoginName
        }
    }

    if($members -ne $null) {
        Write-Output "Adding members: $members"
        foreach($login in $members) {
            $user = New-PnPUser -LoginName $login
            Add-PnPUserToGroup -Identity $membersGroup -LoginName $user.LoginName
        }
    }

    if($visitors -ne $null) {
        Write-Output "Adding visitors: $visitors"
        foreach($login in $visitors) {
            $user = New-PnPUser -LoginName $login
            Add-PnPUserToGroup -Identity $visitorsGroup -LoginName $user.LoginName
        }
    }
}

function ApplyTemplate([string]$url, [string]$templateUrl, [string]$templateName) {
    Connect -Url $url

    $appliedTemplates = Get-PnPPropertyBag -Key $propBagTemplateInfoStampKey
    if((-not $appliedTemplates.Contains("|$templateName|")-or $Force))  {
        Write-Output "`tApplying template $templateName to $url"
        Apply-PnPProvisioningTemplate -Path $templateUrl
        if($? -eq $true) {
            $appliedTemplates = "$appliedTemplates|$templateName|"
            Set-PnPPropertyBagValue -Key $propBagTemplateInfoStampKey -Value $appliedTemplates
        }
    } else {
        Write-Output "`tTemplate $templateName already applied to $url"
    }
}

function CreateKeyValueMetadataObject($key, $fieldType, $fieldValue, $fieldInternalName) {
    $value = @{
        'Type' = $fieldType
        'Data' = $fieldValue
        'FieldName' = $fieldInternalName
    }
    $properties = @{
        'Key' = $key
        'Value' = New-Object -TypeName PSObject -Prop $value
    }

    return New-Object -TypeName PSObject -Prop $properties
}

function CreateMetadataPropertyValue($siteItem, $dispFormUrl, $siteMetadataToPersist) {
    $metadata = @();
    $siteMetadataToPersist | % {
        $fieldName = $_.InternalName
        $fieldDisplayName = $_.DisplayName
        $fieldValue = $siteItem[$fieldName]
        if($fieldValue -ne $null) {
            $valueType = $fieldValue.GetType().Name
            $valueData = $fieldValue.ToString()
            if ($valueType -eq "FieldUserValue") {
                $valueData = "$($fieldValue.LookupId)|$($fieldValue.LookupValue)|$($fieldValue.Email)"
            } elseif ($valueType -eq "FieldUrlValue") {
                $valueData = $fieldValue.Url + "," + $fieldValue.Description
            } elseif ($fieldValue.Label -ne $null) {
                $valueData = $fieldValue.Label
                $valueType = "TaxonomyFieldValue"
            }
            $metadata += (CreateKeyValueMetadataObject -key $fieldDisplayName -fieldType $valueType -fieldValue $valueData -fieldInternalName $fieldName)
        }
    }
    $metadata += (CreateKeyValueMetadataObject -key "-SiteDirectory_ShowProjectInformation-" -fieldType "FieldUrlValue" -fieldValue $dispFormUrl -fieldInternalName "NA")

    return ConvertTo-Json $metadata -Compress
}

function SyncMetadata($siteItem, $siteUrl, $urlToDirectory, $title, $description) {
    $itemId =  $siteItem.Id
    $dispFormUrl = "$urlToDirectory/DispForm.aspx?ID=$itemId" + "&Source=$siteUrl/SitePages/About.aspx"

    $metadataJson = CreateMetadataPropertyValue -siteItem $siteItem -dispFormUrl $dispFormUrl -siteMetadataToPersist $siteMetadataToPersist

    Connect -Url $siteUrl
    Write-Output "`tPersisting project metadata to $siteUrl - $metadataJson"
    Set-PnPPropertyBagValue -Key $propBagMetadataStampKey -Value $metadataJson
    Set-PnPWeb -Title $title -Description $description
}

function SetSiteUrl($siteItem, $siteUrl, $title) {
    Connect -Url "$tenantURL$siteDirectorySiteUrl"
    Write-Output "`tSetting site URL to $siteUrl"
    Set-PnPListItem -List $siteDirectoryList -Identity $siteItem["ID"] -Values @{"$($columnPrefix)SiteURL" = "$siteUrl, $title"} -ErrorAction SilentlyContinue >$null 2>&1
}

function UpdateStatus($id, $status) {
    Connect -Url "$tenantURL$siteDirectorySiteUrl"
    Set-PnPListItem -List $siteDirectoryList -Identity $id -Values @{"$($columnPrefix)SiteStatus" = $status} -ErrorAction SilentlyContinue >$null 2>&1
}

function SendReadyEmail(){
    Param(
        [string]$url,
        [string]$toEmail,
        [String[]]$ccEmails
    )
    Connect -Url $url
    if( -not [string]::IsNullOrWhiteSpace($toEmail) ) {
        $mailHeadBody = GetMailContent -email $toEmail -mailFile "welcome"

        Write-Output "Sending ready mail to $toEmail and $ccEmails"
        Send-PnPMail -To $toEmail -Cc $ccEmails -Subject ($mailHeadBody[0] -f $title) -Body ($mailHeadBody[1] -f $title,$url)
    }
}


function ApplyTemplateConfigurations($url, $siteItem, $templateConfigurationItems, $baseModuleItems, $subModuleItems) {
    Connect -Url $url
    $templateConfig = $siteItem["$($columnPrefix)TemplateConfig"]
    $subModules = $siteItem["$($columnPrefix)SubModules"]
    if($templateConfig -ne $null) {
        $chosenTemplateConfig = $templateConfigurationItems |? Id -eq $templateConfig.LookupId
        if ($chosenTemplateConfig -ne $null) {
            $chosenBaseTemplate = $chosenTemplateConfig["$($columnPrefix)BaseModule"]
            $chosenSubModules = $chosenTemplateConfig["$($columnPrefix)SubModules"]
            if ($chosenBaseTemplate -ne $null) {
                $pnpTemplate = $baseModuleItems |? Id -eq $chosenBaseTemplate.LookupId
                $pnpUrl = $tenantUrl + $pnpTemplate["FileRef"]
                ApplyTemplate -url $url -templateUrl $pnpUrl -templateName $pnpTemplate["FileLeafRef"]
            }
            if ($chosenSubModules -ne $null) {                
                foreach($module in $chosenSubModules) {
                    $pnpTemplate = $subModuleItems |? Id -eq $module.LookupId
                    $pnpUrl = $tenantUrl + $pnpTemplate["FileRef"]
                    ApplyTemplate -url $url -templateUrl $pnpUrl -templateName $pnpTemplate["FileLeafRef"]
                }
            }
        }
    }
    foreach($module in $subModules) {
        $pnpTemplate = $subModuleItems |? Id -eq $module.LookupId
        $pnpUrl = $tenantUrl + $pnpTemplate["FileRef"]
        ApplyTemplate -url $url -templateUrl $pnpUrl -templateName $pnpTemplate["FileLeafRef"]
    }
}

function GetRecentlyUpdatedItems($IntervalMinutes) {
    Connect -Url "$tenantURL$siteDirectorySiteUrl"
    $date = [DateTime]::UtcNow.AddMinutes(-$IntervalMinutes).ToString("yyyy\-MM\-ddTHH\:mm\:ssZ")

    $fields = @()
    $siteMetadataToPersist |% { $fields += $_.InternalName }
    $template = "<FieldRef Name=""{0}"" />"
    $viewFields = ""
    $fields |% {$viewFields+=$template -f $_ } 

    $recentlyUpdatedCaml = @"
<View>
    <Query>
        <Where>
            <Gt>
                <FieldRef Name="Modified" />
                <Value IncludeTimeValue="True" Type="DateTime" StorageTZ="TRUE">$date</Value>
            </Gt>
        </Where>
        <OrderBy>
            <FieldRef Name="Modified" Ascending="False" />
        </OrderBy>
    </Query>
    <ViewFields>
        <FieldRef Name="Title" />
        <FieldRef Name="ID" />
        <FieldRef Name="$($columnPrefix)ProjectDescription" />
        <FieldRef Name="$($columnPrefix)SiteStatus" />
        <FieldRef Name="$($columnPrefix)SiteURL" />
        <FieldRef Name="$($columnPrefix)BusinessOwner" />
        <FieldRef Name="$($columnPrefix)SiteOwners" />
        <FieldRef Name="$($columnPrefix)SiteMembers" />
        <FieldRef Name="$($columnPrefix)SiteVisitors" />
        <FieldRef Name="$($columnPrefix)TemplateConfig" />
        <FieldRef Name="$($columnPrefix)SubModules" />
        <FieldRef Name="$($columnPrefix)NeedForSupport" />
        <FieldRef Name="$($columnPrefix)BusinessUnit" />
        <FieldRef Name="$($columnPrefix)Compliant" />
        <FieldRef Name="$($columnPrefix)InformationClassification" />        
        <FieldRef Name="Editor" />
        <FieldRef Name="Author" />        
        $viewFields
    </ViewFields>
</View>
"@
    if($Force){
        return @(Get-PnPListItem -List $siteDirectoryList)    
    }else {
        return @(Get-PnPListItem -List $siteDirectoryList -Query $recentlyUpdatedCaml)
    }    
}

Write-Output @"
  ___  ___      ______               _     _
  |  \/  |      | ___ \             (_)   (_)
  | .  . |_ __  | |_/ / __ _____   ___ ___ _  ___  _ __
  | |\/| | '__| |  __/ '__/ _ \ \ / / / __| |/ _ \| '_ \
  | |  | | |_   | |  | | | (_) \ V /| \__ \ | (_) | | | |
  \_|  |_/_(_)  \_|  |_|  \___/ \_/ |_|___/_|\___/|_| |_|
                                            by Puzzlepart
  Code by: @mikaelsvenson / @tarjeieo

"@

Connect -Url "$tenantURL$siteDirectorySiteUrl"
$templateConfigurationItems = @(Get-PnPListItem -List $templateConfigurationsList)
$baseModuleItems = @(Get-PnPListItem -List $baseModulesLibrary)
$subModuleItems = @(Get-PnPListItem -List $subModulesLibrary)
$siteDirectoryItems = GetRecentlyUpdatedItems -Interval $timerIntervalMinutes

if(!$siteDirectoryItems -or ($siteDirectoryItems -ne $null -and (0 -eq $siteDirectoryItems.Count))) {
    Write-Output "No site requests detected last $timerIntervalMinutes minutes"
}

foreach ($siteItem in $siteDirectoryItems) {
    $orderedByUser = $siteItem["Author"][0]

    $title = $siteItem["Title"]
    $description = $siteItem["$($columnPrefix)ProjectDescription"]
    $ownerEmailAddresses = @((@($siteItem["$($columnPrefix)BusinessOwner"]) + @($siteItem["$($columnPrefix)SiteOwners"])) |? {-not [String]::IsNullOrEmpty($_.Email)} | select -ExpandProperty Email)
    $siteStatus = $siteItem["$($columnPrefix)SiteStatus"]
    $externalSharing = $siteItem["$($columnPrefix)ExternalSharing"]

    $ownerEmailAddresses = $ownerEmailAddresses | select -uniq | sort

    $businessOwnerEmailAddress = @($siteItem["$($columnPrefix)BusinessOwner"] |? {-not [String]::IsNullOrEmpty($_.Email)} | select -ExpandProperty Email)

    $owners = @($siteItem["$($columnPrefix)SiteOwners"]) | select -ExpandProperty LookupValue
    $members = @($siteItem["$($columnPrefix)SiteMembers"]) | select -ExpandProperty LookupValue
    $visitors = @($siteItem["$($columnPrefix)SiteVisitors"]) | select -ExpandProperty LookupValue
    $ownerAccount = $siteItem["$($columnPrefix)BusinessOwner"].LookupValue

    if ($ownerAccount -eq $null) {
        Write-Output "`nError: No valid owner set in the list item $title. Using fallback-admin"
        $ownerAccount = New-PnPUser -LoginName $fallbackSiteCollectionAdmin 
    } else {
        $ownerAccount = New-PnPUser -LoginName $ownerAccount 
    }
    
    if( $siteItem["$($columnPrefix)SiteURL"] -eq $null) {
        $siteUrl = GetUniqueUrlFromName -title $title
    } else {
        $siteUrl = $siteItem["$($columnPrefix)SiteURL"].Url
    }
    
    Write-Output "`nProcessing $siteUrl"
    Connect -Url "$tenantURL$siteDirectorySiteUrl"
    $urlToSiteDirectory = "$tenantURL$siteDirectorySiteUrl$siteDirectoryList"

    $editor = $siteItem["Editor"][0].LookUpValue 

    EnsureSite -siteEntryId $siteItem["ID"] -title $title -url $siteUrl -description $description `
        -siteCollectionAdmin $fallbackSiteCollectionAdmin `
        -owner $ownerAccount `
        -ownerAddresses $businessOwnerEmailAddress `
        -members $members `
        -visitors $visitors `
        -requestor $orderedByUser `
        -externalSharing $externalSharing

    if ($? -eq $true -and ($editor -ne "SharePoint App" -or $Force)) {        
        EnsureSecurityGroups -url $siteUrl -title $title -owners $owners -members $members -visitors $visitors
        SetSiteUrl -siteItem $siteItem -siteUrl $siteUrl -title $title        
        ApplyTemplateConfigurations -url $siteUrl -siteItem $siteItem -templateConfigurationItems $templateConfigurationItems -baseModuleItems $baseModuleItems -subModuleItems $subModuleItems
        UpdateStatus -id $siteItem["ID"] -status 'Provisioned'
        SyncMetadata -siteItem $siteItem -siteUrl $siteUrl -urlToDirectory $urlToSiteDirectory -title $title -description $description

        if($siteStatus -ne 'Provisioned'){
            # Provisining did not fail - and old value was "Provisining"
            SendReadyEmail -url $siteUrl -toEmail $orderedByUser.Email -ccEmails $businessOwnerEmailAddress
        }
    }    
}
Disconnect-PnPOnline