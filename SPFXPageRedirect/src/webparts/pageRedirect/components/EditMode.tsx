import * as React from 'react';
import { IPageRedirectProps } from './IPageRedirectProps';
import { css } from 'office-ui-fabric-react';
import styles from './PageRedirect.module.scss';

export default class EditMode extends React.Component<IPageRedirectProps, void> {
  public render(): React.ReactElement<IPageRedirectProps> {
    return (
      <div className={styles.helloWorld}>
        <div className={styles.container}>
          <div className={css('ms-Grid-row ms-bgColor-themeDark ms-fontColor-white', styles.row)}>
            <div className='ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1'>
              <span className='ms-font-xl ms-fontColor-white'>
                Enter the redirect URL in the web part properties
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
