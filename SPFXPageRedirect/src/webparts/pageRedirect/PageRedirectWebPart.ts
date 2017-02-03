import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import PageRedirect from './components/PageRedirect';
import EditMode from './components/EditMode';
import { IPageRedirectProps } from './components/IPageRedirectProps';
import { IPageRedirectWebPartProps } from './IPageRedirectWebPartProps';

export default class PageRedirectWebPart extends BaseClientSideWebPart<IPageRedirectWebPartProps> {

  public render(): void {
    const elementView: React.ReactElement<IPageRedirectProps> = React.createElement(
      PageRedirect,
      {
        redirecturl: this.properties.redirecturl
      }
    );

    const elementEdit: React.ReactElement<IPageRedirectProps> = React.createElement(
      EditMode,
      {
        redirecturl: this.properties.redirecturl
      }
    );

    if (this.displayMode == DisplayMode.Read) {
      ReactDom.render(elementView, this.domElement);
    } else {
      ReactDom.render(elementEdit, this.domElement);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: "Settings",
              groupFields: [
                PropertyPaneTextField('redirecturl', {
                  label: "Redirect URL"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
