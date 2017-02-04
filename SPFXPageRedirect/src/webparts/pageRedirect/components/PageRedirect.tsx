import * as React from 'react';
import { css } from 'office-ui-fabric-react';
import styles from './PageRedirect.module.scss';
import { IPageRedirectProps } from './IPageRedirectProps';

export default class PageRedirect extends React.Component<IPageRedirectProps, void> {
  public componentWillMount() {
    if (window.location.href.indexOf('editpage') === -1 && this.props.redirecturl.indexOf('http') != -1) {
      const script = document.createElement("script");

      script.innerText = "window.location = '" + this.props.redirecturl + "';";
      document.body.appendChild(script);
    }
  }
  public render(): React.ReactElement<IPageRedirectProps> {
    return (
      <span />
    );
  }
}
