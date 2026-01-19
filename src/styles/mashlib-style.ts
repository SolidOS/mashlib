export interface MashStyle {
  dbLayout: string;
  dbLayoutContent: string;
  dbLayoutHeader: string;
  dbLayoutFooter: string;
  setStyle: (ele: HTMLElement, styleName: keyof Omit<MashStyle, 'setStyle'>) => void;
}

export const mashStyle: MashStyle = {
  dbLayout: 'display: flex; flex-direction: column; min-height: 100vh; background: var(--sui-bg, #f5f5f5);',
  dbLayoutContent: 'flex: 1 0 auto;',
  dbLayoutHeader: 'flex-shrink: 0; background: var(--sui-bg-header, white); box-shadow: var(--sui-shadow-md, 0 2px 4px rgba(0,0,0,0.1)); border-bottom: 1px solid var(--sui-border, #e2e8f0); padding: 0.5em 0;',
  dbLayoutFooter: 'flex-shrink: 0; background: var(--sui-bg-panel, white); border-top: 1px solid var(--sui-border, #e2e8f0); padding: 1rem; text-align: center; color: var(--sui-text-muted, #888);',
  setStyle: function setStyle(ele: HTMLElement, styleName: keyof Omit<MashStyle, 'setStyle'>) {
    ele.setAttribute('style', mashStyle[styleName])
  }
}