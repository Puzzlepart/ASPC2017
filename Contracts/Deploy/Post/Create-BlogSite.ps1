Param(
  [string]$Url
)

function Create-BlogSite([string]$Url) {
    $ExistingBlog = Get-SPOWeb -Identity "Blog" -ErrorAction SilentlyContinue
    if ($ExistingBlog -eq $null) {
        $null = New-SPOWeb -Title "Blog" -Url "blog" -Template "BLOG#0" -InheritNavigation -Locale 1033

        $ExistingBlog = Get-SPOWeb -Identity "Blog"
    }
    if ($ExistingBlog -ne $null) {
        Apply-SPOProvisioningTemplate ".\Templates\Blog\template.xml" -Web $ExistingBlog
    }
}
Connect-SPOnline $Url
Create-BlogSite -Url $Url