/// <reference path="./resourcehelper.ts" />

module Portal.About {
    class Principal {
        name: string;
        userId: string;
        email: string;
        id: number;
        isUser: boolean;
    }

    class SecurityGroup {
        name: string;
        members: Principal[];
    }

    interface IWindow {
        ProcessImn(): any;
    }

    declare var window: IWindow;

    function RetrieveMetadataFromPropertyBag(): JQueryPromise<any> {
        var deferred = jQuery.Deferred();
        var digest = jQuery('#__REQUESTDIGEST').val();

        jQuery.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + '/_api/web/AllProperties?$select=ProjectMetadata',
            headers: {
                'Accept': 'application/json; odata=minimalmetadata',
                'X-RequestDigest': digest
            },
            contentType: 'application/json;odata=minimalmetadata'
        }).done((data) => {
            deferred.resolve(data);
        }).fail(() => {
            deferred.resolve(null);
        });
        return deferred.promise();
    }

    function GetWebDescription(): JQueryPromise<string> {
        var deferred = jQuery.Deferred();
        var digest = jQuery('#__REQUESTDIGEST').val();

        jQuery.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + '/_api/web/description',
            headers: {
                'Accept': 'application/json; odata=minimalmetadata',
                'X-RequestDigest': digest
            },
            contentType: 'application/json;odata=minimalmetadata'
        }).done((data) => {
            deferred.resolve(data.value);
        }).fail(() => {
            deferred.resolve(null);
        });
        return deferred.promise();
    }

    export function GetPermissionMembers(): JQueryPromise<SecurityGroup[]> {
        var deferred = jQuery.Deferred(function () {
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {
                var context = SP.ClientContext.get_current();
                var allGroups = context.get_web().get_siteGroups();
                context.load(allGroups);
                context.load(allGroups, 'Include(Users)');

                var securityGroups: SecurityGroup[] = [];
                context.executeQueryAsync(
                    function () {
                        var groupsEnumerator = allGroups.getEnumerator();
                        while (groupsEnumerator.moveNext()) {
                            var group = groupsEnumerator.get_current();

                            var secGroup: SecurityGroup = new SecurityGroup();
                            secGroup.name = group.get_title();
                            secGroup.members = [];
                            var usersEnumerator = group.get_users().getEnumerator();
                            while (usersEnumerator.moveNext()) {
                                var user = usersEnumerator.get_current();

                                var secUser = new Principal();
                                secUser.name = user.get_title();
                                secUser.userId = user.get_loginName();
                                secUser.email = user.get_email();
                                secUser.isUser = user.get_principalType() === 1;
                                secUser.id = user.get_id();
                                secGroup.members.push(secUser);
                            }
                            securityGroups.push(secGroup);
                        }
                        deferred.resolve(securityGroups);
                    },
                    function (sender, args) {
                        deferred.resolve(securityGroups);
                    }
                );
            }, 'sp.js');
        });
        return deferred.promise();
    }

    function GetValueFormatted(element) {
        var elementValue = element.Value.Data;
        if (element.Value.Type === 'FieldUrlValue') {
            var urlValue = element.Value.Data;
            var urlName = ResourceHelper.getValue(element.Key);
            var urlValueSplit = element.Value.Data.split(',');

            if (urlValueSplit.length === 2) {
                urlValue = urlValueSplit[0];
                urlName = urlValueSplit[1];
            }
            // Show 'more information' project card in a modal dialog
            if (element.Key === '-SiteDirectory_ShowProjectInformation-') {
                elementValue = `<a onclick='ProjectPortal.SharedFunctions.OpenInDialog("${urlValue}", "${urlName}")' href='javascript:void(0);return false;'>${urlName} (updates can take up to 15 minutes before shown)</a>`;
            } else {
                elementValue = `<a href='${urlValue}'>${urlName}</a>`;
            }
        }
        return elementValue;
    }

    function GetPrincipalMarkup(user: Principal, uniqueId: number) {
        //https://splyncpresence.codeplex.com/
        if (!user.isUser || !user.email) {
            return `<div class="meta-value">${user.name}</div>`;
        }

        var personalUrl = `${_spPageContextInfo.webAbsoluteUrl}/_layouts/15/userdisp.aspx?ID=${user.id}`;
        //var pictureUrl = `/_vti_bin/DelveApi.ashx/people/profileimage?userId=${user.email}&size=S`;
        var pictureUrl = `/_layouts/15/userphoto.aspx?size=S&accountname=${user.email}`;
        return `
<span class='ms-imnSpan ms-tableCell'>
    <a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'>
        <div class='ms-tableCell'>
            <span class='ms-imnlink ms-spimn-presenceLink'>
                <span class='ms-spimn-presenceWrapper ms-spimn-imgSize-5x36'>
                    <img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-5x36x32' src='/_layouts/15/images/spimn.png' sip='${user.email}' id='imn_${uniqueId},type=sip' />
                </span>
            </span>
        </div>
        <div class='ms-tableCell ms-verticalAlignTop'>
            <div class='ms-peopleux-userImgDiv'>
                <span>
                    <img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='${user.email}' />
                    <span class='ms-peopleux-imgUserLink'>
                        <span class='ms-peopleux-userImgWrapper' style='width: 36px; height: 36px;'>
                            <img class='userIMG' style='width: 36px; height: 36px; clip: rect(0px, 36px, 36px, 0px);' src='${pictureUrl}' alt='${user.name}' />
                        </span>
                    </span>
                </span>
            </div>
        </div>
    </a>
</span>
<div class='ms-tableCell ms-verticalAlignTop' style='padding-left: 10px;'>
    <span>
        <a href='${personalUrl}'>${user.name}</a>
    </span>
    <span style='font-size: 0.9em; display: block;'>${user.email}</span>
</div>
<div style='clear:both'></div>
`;
    }

    export function RenderMetadata() {
        jQuery.when(
            RetrieveMetadataFromPropertyBag(), GetWebDescription(), GetPermissionMembers()
        ).then((data, description, securityGroups: SecurityGroup[]) => {
            var metadataList = jQuery('ul.project-metadata-list');
            let markup: string = '';
            markup += `<li><h2>Site information</h2></li><li><h3>Description</h3><div class="meta-value">${description}</div></li>`;

            if (data['ProjectMetadata']) {
                var metadata = jQuery.parseJSON(data['ProjectMetadata']);
                for (var x = 0; x < metadata.length; x++) {
                    var element = metadata[x];
                    var elementName = ResourceHelper.getValue(element.Key);
                    var elementValue = GetValueFormatted(element);
                    var businessOwner: Principal = new Principal();
                    var parts = elementValue.split('|');
                    if (parts.length === 3) {
                        businessOwner.id = parts[0];
                        businessOwner.name = parts[1];
                        businessOwner.email = parts[2];
                        businessOwner.isUser = true;
                    } else {
                        businessOwner.name = elementValue;
                        businessOwner.isUser = false;
                    }
                    markup += `<li><h3>${elementName}</h3>`;
                    markup += GetPrincipalMarkup(businessOwner, 666);
                    markup += `</li>`;
                }
            }

            markup += `<li><h2>Site security<h2></li>`;
            for (var key in securityGroups) {
                if (securityGroups.hasOwnProperty(key)) {
                    var secGroup = securityGroups[key];
                    if (secGroup.members.length > 0) {
                        markup += `<li><h3>${secGroup.name}</h3>`;
                        var i = 0;
                        secGroup.members.sort(
                            (l, r) => {
                                if (!l.email && r.email) { return 1; }
                                if (l.email && !r.email) { return -1; }
                                if (l.name > r.name) { return 1; }
                                if (l.name < r.name) { return -1; }
                                return 0;
                            }
                        );

                        for (var key in secGroup.members) {
                            if (secGroup.members.hasOwnProperty(key)) {
                                var user = secGroup.members[key];
                                if (user.userId === 'SHAREPOINT\\system') {
                                    continue;
                                }
                                markup += GetPrincipalMarkup(user, i++);
                            }
                        }
                        markup += '</li>';
                    }
                }
            }
            metadataList.append(markup);
            window.ProcessImn();
        });
    }
}