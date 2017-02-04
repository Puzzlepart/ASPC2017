Param()
$sequence =
@(
    [pscustomobject]@{StepName="pre-deploy: Compile LESS";ScriptPath="Deploy\Pre\";ScriptName="Compile-LESS.ps1";ForTemplate="CDN;UX;Root;Collab;Academy;"},
    [pscustomobject]@{StepName="pre-deploy: Compile TypeScript";ScriptPath="Deploy\Pre\";ScriptName="Compile-TypeScript.ps1";ForTemplate="CDN;Root;Collab;Academy;"}
)
Write-Host "----------------------------------------" -ForegroundColor Green
Write-Host "Running Pzl build and compile script" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green
$sequence | % {
    Write-Host "Running script $($_.StepName)" -ForegroundColor Green
    $Script = Get-Item ($_.ScriptPath + $_.ScriptName)
    & $Script.FullName
}