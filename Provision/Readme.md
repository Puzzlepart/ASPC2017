# Project overview
Create a dynamic and flexible site provisining system using SharePoint lists, Office PnP commandlets and Azure Web Jobs.

# Site Collections

## CDN

The solutions needs a site collection at /sites/pzl-CDN based on a team site. The CDN template should be installed to this site collection.

## Site Directory

The site directory is a list of all projects, and is used by [mrprovision.ps1](Engine/mrprovision.ps1). Install the SiteDirectory template to a separate site collection, and configure the URL in the script.

# Build and install #
## Before you start (dependencies) ##
1. Download the latest Office PnP PowerShell
2. Download the latest nodejs/npm
3. Use npm to install typescript globally
4. Use npm to install typings globally
5. Use npm to install gulp globally
5. Use npm to install less globally

## Install ##

## Development setup (after dependencies) ##

1. Clone repository from bitbucket
2. From git shell: npm install
3. From git shell: typings install
4. Run gulp 'gulp' to build 'AssetsSrc' to 'dist'-folder
5. Connect-PnPOnline and then Apply-SPOProvisioningTemplate <path to template> (Relevant for CDN and SiteDirectory)

## Template setup of lists and libraries ##
1. Package a template folder using Convert-PnPFolderToProvisioningTemplate
2. Upload the template to BaseModules (standalone) or AppsModules (minor app) 

# Install
[See Install.md](Install.md)