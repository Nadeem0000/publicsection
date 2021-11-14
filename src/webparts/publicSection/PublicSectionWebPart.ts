import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClient } from "@microsoft/sp-http";
import * as strings from 'PublicSectionWebPartStrings';
import PublicSection from './components/PublicSection';
import { IPublicSectionProps } from './components/IPublicSectionProps';

export interface IPublicSectionWebPartProps {
  description: string;
}

export default class PublicSectionWebPart extends BaseClientSideWebPart<IPublicSectionWebPartProps> {
  
  public render(): void {
    const element: React.ReactElement<IPublicSectionProps> = React.createElement(
      PublicSection,
      {
        description: this.properties.description,
        siteurl: this.context.pageContext.web.absoluteUrl,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
