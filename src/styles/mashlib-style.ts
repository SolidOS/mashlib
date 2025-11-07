export interface MashStyle {
  dbLayout: string;
  dbLayoutContent: string;
  dbLayoutHeader: string;
  dbLayoutFooter: string;
  setStyle: (ele: HTMLElement, styleName: keyof Omit<MashStyle, 'setStyle'>) => void;
}

export const mashStyle: MashStyle = {
  dbLayout: 'display: flex; flex-direction: column;',
  dbLayoutContent: 'flex: 1 0 auto;',
  dbLayoutHeader: 'flex-shrink: 0;',
  dbLayoutFooter: 'flex-shrink: 0;',
  setStyle: function setStyle(ele: HTMLElement, styleName: keyof Omit<MashStyle, 'setStyle'>) {
    ele.setAttribute('style', mashStyle[styleName])
  }
}