
export const mashStyle = {

  dbLayout: 'display: flex; flex-direction: column;',

  dbLayoutContent: 'flex: 1 0 auto;',

  dbLayoutHeader: 'flex-shrink: 0;',
  dbLayoutFooter: 'flex-shrink: 0;'
}

mashStyle.setStyle = function setStyle (ele, styleName) {
  ele.style = mashStyle[styleName]
}
