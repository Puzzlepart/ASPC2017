param(
    [string]$Url
)

function LocalizeField([string]$Name, [string]$AltName, [string]$Language) {
    $field = Get-SPOField -Identity $Name
    if ($field -eq $null) {
        Write-Warning "The field $Name can't be found"
        return
    }
    $field.TitleResource.SetValueForUICulture($Language, $AltName)
    $field.UpdateAndPushChanges($true)
}

function LocalizeContentType([string]$Name, [string]$AltName, [string]$Language) {
    $ct = Get-SPOContentType -Identity $Name
    if ($ct -eq $null) {
        Write-Warning "The content type $Name can't be found"
        return
    }
    $ct.NameResource.SetValueForUICulture($Language, $AltName)
    $ct.Update($true)
}



Connect-SPOnline $Url

LocalizeField -Name "FFDiscipline" -AltName "Ämnesområde" -Language "sv-se"
LocalizeField -Name "FFDepartment" -AltName "Avdelning" -Language "sv-se"
LocalizeField -Name "FFAboutWorkspace" -AltName "Om rummet" -Language "sv-se"
LocalizeField -Name "FFProjectOwner" -AltName "Projektägare" -Language "sv-se"
LocalizeField -Name "FFProjectLeader" -AltName "Projectledare" -Language "sv-se"
LocalizeField -Name "FFDocumentCategory" -AltName "Dokumentkategori" -Language "sv-se"
LocalizeField -Name "FFDocumentStatus" -AltName "Dokumentstatus" -Language "sv-se"
LocalizeField -Name "FFStatus" -AltName "Status" -Language "sv-se"
LocalizeContentType -Name "Generell forside" -AltName "Gemensam framsida" -Language "sv-se"
LocalizeContentType -Name "Samhandlingsrom forside" -AltName "Samspelingsrum framsida" -Language "sv-se"
LocalizeContentType -Name "Prosjektrom forside" -AltName "Projectrum framsida" -Language "sv-se"


Execute-SPOQuery