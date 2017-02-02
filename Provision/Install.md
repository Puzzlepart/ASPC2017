# Installation instructions for the site directory
----------------------------------------------------

## Load OfficePnP commandlets from Engine/bundle

`
Add-Type -Path .\Engine\bundle\Microsoft.SharePoint.Client.Taxonomy.dll -ErrorAction SilentlyContinue
Add-Type -Path .\Engine\bundle\Microsoft.SharePoint.Client.DocumentManagement.dll -ErrorAction SilentlyContinue
Add-Type -Path .\Engine\bundle\Microsoft.SharePoint.Client.WorkflowServices.dll -ErrorAction SilentlyContinue
Add-Type -Path .\Engine\bundle\Newtonsoft.Json.dll -ErrorAction SilentlyContinue
Import-Module .\Engine\bundle\SharePointPnPPowerShellOnline.psd1 -ErrorAction SilentlyContinue
`

1. Create a new site under the root site, gg. /collaboration
2. Connect-SPOnline -Url https://<tenant>.sharepoint.com/collaboration -AppId <appId> -AppSecret <appSecret>
3. Apply-SPOProvisioningTemplate -Path .\Templates\SiteCatalogue\template.xml -Handlers TermGroups,Fields,ContentTypes,Files
4. Connect-SPOnline -Url https://<tenant>.sharepoint.com/collaboration -AppId <appId> -AppSecret <appSecret>
5. Apply-SPOProvisioningTemplate -Path .\Templates\SiteCatalogue\template.xml -ExcludeHandlers TermGroups,Fields,ContentTypes,Files
6. Connect-SPOnline -Url https://<tenant>.sharepoint.com/sites/pzl-cdn -AppId <appId> -AppSecret <appSecret>
7. Apply-SPOProvisioningTemplate -Path .\Templates\cdn\cdn.xml 

In your site you should now see the following:

* Catalogue - list to order sites
* Templates - functional template definitions with reference to modules and apps
* Modules   - library to store larger PnP template files
* Apps      - library to store functional scoped PnP template files

*Note:*  _If you install the site catalog to a subsite, run the following:_
* *Root site* Apply-SPOProvisioningTemplate -Path .\Templates\SiteCatalogue\template.xml -Handlers TermGroups,Fields,ContentTypes,Files
* *Subsite* Apply-SPOProvisioningTemplate -Path .\Templates\SiteCatalogue\template.xml -ExcludeHandlers TermGroups,Fields,ContentTypes,Files

# Package Team Site Template

* Convert-PnPFolderToProvisioningTemplate -Folder .\Templates\TeamSite -Out .\Templates\TeamSite.pnp

# Upload template files (examples)

* Add-PnPFile -Path .\Templates\TeamSite.pnp -Folder "BaseModules" -Values @{ Title="Team Site" }
* $caml = "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>Team Site</Value></Eq></Where></Query></View>"
* $module = Get-PnPListItem -List "BaseModules" -Query $caml
* Add-PnPListItem -List "Project Templates" -Values @{ Title="Team Site"; PZL_BaseModule=$module.Id }

Note! Be sure to set a title for the uploaded items in order to select them afterwards

# Provisioning and Governance

* Register a SharePoint app id/secret to be used to provision sites - record id and secret
  * https://<tenant>.sharepoint.com/_layouts/15/AppRegNew.aspx
* Add permissions to the registered app
  * https://<tenant>-admin.sharepoint.com/_layouts/15/AppInv.aspx

        Permission XML
        --------------
        <AppPermissionRequests AllowAppOnlyPolicy="true">
                <AppPermissionRequest Scope="http://sharepoint/content/tenant" Right="FullControl" />
                <AppPermissionRequest Scope="http://sharepoint/social/tenant" Right="Read" />
                <AppPermissionRequest Scope="http://sharepoint/taxonomy " Right="Read" />
        </AppPermissionRequests>
* Create an item in the Site Directory list
  * Pick Core as the main template, and pick a module
* Edit .\Engine\mrprovision.ps1 to match your environment
* Run .\Engine\mrprovision.ps1
* Once done visit the newly created site (link from Site Directory, or via e-mail)
* In the right column of the site is a link to start a "Tour" of the new site

# Package and Deploy Azure web jobs

1. Run .\Package-WebJobs.ps1
2. Create new Azure web jobs for each row in table below

| Name                        | File Upload            | Type      | Triggers  | Cron Expression |
| --------------------------- | ---------------------- | --------- | --------- | --------------- |
| Pzl-O365-Site-Provisioning | provisioning.zip       | Triggered | Scheduled | 0 0/5 * * * *   |
| Pzl-O365-Site-Gov-Daily    | governance-daily.zip   | Triggered | Scheduled | 0 0 7 * * *     |
| Pzl-O365-Site-Gov-Monthly  | governance-monthly.zip | Triggered | Scheduled | 0 0 5 1 * *     |



Note: You should modify mrprovision.ps1 to use the rights credentials in the script, or use
environmental variables from Azure. Then update the zip file with the modified ps1 file.