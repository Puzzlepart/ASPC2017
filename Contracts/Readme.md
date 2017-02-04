# Puzzlepart Contracts #
This is a continuation of the Contracts solution delivered to Saferoad. The solution is packaged with [Office PnP Provisioning Schema](https://github.com/OfficeDev/PnP-Provisioning-Schema) and installed with [Office PnP PowerShell](https://github.com/OfficeDev/PnP-PowerShell).

## Content ##
The solution consists of the following templates:

1. The [Tour module](https://bitbucket.org/puzzlepart/pzl-office365-tour)
2. Content type hub-template (CTHub) with site fields and content type for a Contract document, 
3. Contracts (CLM) for the Contracts solution which contains pages, display templates and some branding and client side script.

## Install ##

### Prerequisites ###
* Download [Office PnP PowerShell](https://github.com/OfficeDev/PnP-PowerShell) (if you haven't already)
* Pull the desired version from Bitbucket (TODO: instructions on selecting version and getting it)

### Tour Module ###
Please follow instructions at [Tour module](https://bitbucket.org/puzzlepart/pzl-office365-tour)

### CTHub ###
The CTHub solution needs to be installed to the content type hub site collection. In a specific instance where you only want to use the Contracts content type in the Contracts site collection, it can also be installed just to Contracts.

UPGRADE: If the CT definition has not changed do not install this package.  TODO: document manual diff procedure. NOTICE: customer might have customized the CT after install.

**Procedure**

* Connect-SPOnline <tenanturl>/sites/contentTypeHub
* Apply-SPOProvisioningTemplate -Path <mylocalpathtorepo>\Templates\CTHub\template.xml 

Example:
```
#!powershell
 Apply-SPOProvisioningTemplate -Path C:\code\pzl-contracts\Templates\CTHub\template.xml
```
* (MANUAL STEP) If installed to the content type hub, find the content type "Contracts" in the group "Contracts content types" and publish it
* (MANUAL STEP) Remove unused standard items/lists/libraries/features from the site template
    * Disable features: SiteFeed
    * Remove lists/doclibs: Documents, Site Collection Documents
    * TODO: list further items to remove (to avoid any end-user confusion)

### Contracts ###

This solution should be installed to a dedicated site collection. Create the site collection as an english team site.

* Note: The Contracts content type needs to be available in the site collection. If it has been published from the content type hub, give it some time (can take an hour or so) before continuing, and ensure that it is available.
* Note: This is the procedure for building _and_ installing the solution. It is also possible to install just the packaged solution - but I have made no such package available yet since this is still under development.

**Pre-requisites for building the solution** 

* Download [Office PnP PowerShell](https://github.com/OfficeDev/PnP-PowerShell) (if you haven't already)
* Install the latest version of [nodejs/npm](https://nodejs.org/en/download/) (if you haven't already)
* Open a git shell, navigate to project root and execute the following commands
* npm i typescript --global
* npm i less --global
* npm i typings --global
* npm install
* typings install

**Procedure**
* Using PowerShell, navigate to root of this repository and run buildandinstall.ps1 to build TypeScript and LESS, and then apply the template to the site collection as specified by the URL parameter. Example:
```
#!powershell
 .\buildandinstall.ps1 -Url "https://tarjeieo.sharepoint.com/sites/contracts/" -Template CLM
 .\buildandinstall.ps1 -Url "https://tarjeieo.sharepoint.com/sites/contracts/" -Template TourData
```

* (MANUAL STEP) Ensure site title is "ContractHub", and that site language, locale etc. is configured correctly.
* (MANUAL STEP) Go to the list setting of the 'Contract Tasks' list, select Advanced settings and enable e-mail notifications for the list
* (MANUAL STEP) Copy Guides section from backlog onenote to customer site onenote
* (MANUAL STEP) Configure top-level navigation with links to 
    * "Browse": SitePages/Browse.aspx 
    * "Tasks: Lists/ContractTasks/active.aspx
    * "Discover": SitePages/Discover.aspx 
    * "Central Library": CentralLibrary/Forms/AllItems.aspx
    * "More help..": SitePages/Help.aspx
* (MANUAL STEP) Add issue collector script and help text to the Help.aspx wiki page
* (MANUAL STEP) Configure Views
    * Central Library: All Items (add sensible columns), BulkEdit (columns:todo), NoFolders (columns:todo)
    * Contract Tasks: Assert active view orders on due date

**Verification and onboarding**

Perform functional verfication steps (TODO: Detail this QA procedure):
1. Test home, browse, discover, tour, tasks, central library

Authorize customer users to the site:
* Add Contract manager user(s) to owners group
* Add users or groups to the visitors group as per requested by the customer.

Notify Customer (cc to our customer responsible person) and request verification of solution, requesting that they conduct the tour and perform the QA test script. 

TODO: Provide onboarding email template to use when inviting customer to newly installed solution.

## Maintainers ##

* Product Owner: Mads
* Current active maintainer: Tarjei
* Original developers: Gissur and Mikael
* Install & Upgrade responsible: Joachim

NOTICE: All install and upgrade activity must be logged in the [OneNote Release & Deploy Section](https://pzlcloud.sharepoint.com/sites/missions/_layouts/OneNote.aspx?id=%2Fsites%2Fmissions%2FSiteAssets%2FMissions%20Notebook&wd=target%28PMI%20CONTRACTS.one%7CA805D879-52AD-D743-8F8A-1C6AD8F745B0%2FRelease%20Notes%20%26%20Deployment%7C586C03D5-2CCF-0C46-9523-0A178E698ABC%2F%29) in order to keep track of our initial installs.


## Backlog ##
* Product backlog is currently maintained in [OneNote Task Board here](https://pzlcloud.sharepoint.com/sites/missions/_layouts/OneNote.aspx?id=%2Fsites%2Fmissions%2FSiteAssets%2FMissions%20Notebook&wd=target%28PMI%20CONTRACTS.one%7CA805D879-52AD-D743-8F8A-1C6AD8F745B0%2FTask%20Board%7CF1F5669D-6164-AC46-B59C-7111A949D096%2F%29) (pending transition to JIRA project):