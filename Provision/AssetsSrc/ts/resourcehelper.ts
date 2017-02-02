/// <reference path="../../typings/index.d.ts" />

interface Window {
    pageResources: any;
}

declare var window: Window;

module ResourceHelper {
    function startsWith(input: string, searchString: string, position?: number): boolean {
        position = position || 0;
        return input.substr(position, searchString.length) === searchString;
    }

    export function getValue(token: string): string {
        if (startsWith(token, '-') && token.endsWith('-') && window.pageResources) {
            token = token.slice(1).slice(0, -1); // remove token identifiers
            //loop over object            
            var sets = window.pageResources.resources.resource.filter(function (value) {
                return value.$.id.indexOf(_spPageContextInfo.currentUICultureName) > -1;
            });
            sets.forEach(set => {
                var resource = set.data.filter(function (value) {
                    return value.$.name === token;
                });
                if (resource.length > 0) {
                    token = resource[0].value[0];
                    return;
                };
            });
        }
        return token;
    }
}