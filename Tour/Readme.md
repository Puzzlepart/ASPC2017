# Office 365 list backed Bootstrap tour by Puzzlepart

The solution is packaged with [Office PnP Provisioning Schema](https://github.com/OfficeDev/PnP-Provisioning-Schema) and installed with [Office PnP PowerShell](https://github.com/OfficeDev/PnP-PowerShell).

## Usage ##

The list is located at Lists/Tour. Add entries there just like you would in a Bootstrap Tour configuration file.

A log of all tour takers is also available in the hidden list Lists/TourLog. This list needs to be manually configured after installation, see under Installation below.

### Tips and tricks ###

* If you add a step with sort order -1, you can override the welcome splash

## Extending the list ##

The tour supports additional configuration options as long as they're supported by Bootstrap. To do this, create new columns with the name "TourProperty", where "Property" is the name of the Bootstrap Tour property. E.g. to add a property for "SmartPlacement", create a field "TourSmartPlacement".

## Development setup ##

1. Clone repository from bitbucket
2. From git shell: npm install
3. gulp (to compile css, js etc)

You're good to go!

## Installation ##

### Create Tour Central ###
1. Create site collection with url /site/directory
2. Connect-SPOOnline
3. Apply-SPOProvisioningTemplate <path to TourCentral template.xml>

### Apply a tour ###
1. Connect-SPOOnline
2. Apply-SPOProvisioningTemplate <path to Tour template.xml>

### Necessary manual configuration ###
In the web where you installed the tour central, go to Lists/TourLog and configure permissions of the list the follow ways. This is necessary in order to persist that people have watched the tour.

1. Go to list settings --> Permissions --> Add everyone with edit access. Suggest to also cleanup all other groups, but leave the owner group.
2. Go to list settings --> Advanced settings --> Item-level settings --> Check 'Read items that were created by the user' and check 'Create items and edit items that were created by the user' 

There is an issue where the fields of the tour list aren't properly ordered. To fix this, go to Lists/Tour, select the "Tour Step" content type, at the bottom of the page select "Column ordering". Configure as wanted - Title should be ordered as on of the first two fields.