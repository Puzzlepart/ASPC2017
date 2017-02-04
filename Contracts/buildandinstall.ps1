Param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    [Parameter(Mandatory=$false)]
    [string]$WinCred,
    [Parameter(Mandatory=$true)]
    [string]$Template
)
$sequence =
@(
    [pscustomobject]@{StepName="pre-deploy: Compile TypeScript";ScriptPath="Deploy\Pre\";ScriptName="Compile-TypeScript.ps1";ForTemplate="CLM"},
    [pscustomobject]@{StepName="pre-deploy: Compile LESS";ScriptPath="Deploy\Pre\";ScriptName="Compile-LESS.ps1";ForTemplate="CLM"},
    [pscustomobject]@{StepName="deploy: Apply Template";ScriptPath="Deploy\";ScriptName="ConnectAndApply-Template.ps1";ForTemplate="CLM;CTHub,TourData"},
    [pscustomobject]@{StepName="post-deploy: Clean up CSS";ScriptPath="Deploy\Post\";ScriptName="CleanUp-CSS.ps1";ForTemplate="CLM"},
    [pscustomobject]@{StepName="post-deploy: Clean up JS";ScriptPath="Deploy\Post\";ScriptName="CleanUp-JavaScript.ps1";ForTemplate="CLM"}
)
Write-Host "----------------------------------------" -ForegroundColor Green
Write-Host "Running Pzl build and provisoning script" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green
$sequence | % {
    if ($_.ForTemplate.contains($Template)) {
        Write-Host "Running script $($_.StepName)" -ForegroundColor Green
        $Script = Get-Item ($_.ScriptPath + $_.ScriptName)
        & $Script.FullName -Url $Url -WinCred $WinCred -Template $Template
    }
}