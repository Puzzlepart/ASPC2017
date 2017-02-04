Param()
$sequence =
@(
    [pscustomobject]@{StepName="post-deploy: Clean up CSS";ScriptPath="Deploy\Post\";ScriptName="CleanUp-CSS.ps1";ForTemplate="CDN;UX;Root;Collab;Academy;"},
    [pscustomobject]@{StepName="post-deploy: Clean up JS";ScriptPath="Deploy\Post\";ScriptName="CleanUp-JavaScript.ps1";ForTemplate="CDN;Root;Collab;Academy;"}
)
Write-Host "----------------------------------------" -ForegroundColor Green
Write-Host "Running Pzl cleanup script" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green
$sequence | % {
    Write-Host "Running script $($_.StepName)" -ForegroundColor Green
    $Script = Get-Item ($_.ScriptPath + $_.ScriptName)
    & $Script.FullName
}