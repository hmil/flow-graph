import Style from './Style';

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export function uid() {
  return s4()+s4()+s4()+s4();
}

class StyleManager {
  style?: Style;
  _styleNode: HTMLStyleElement;

  setStyle(style: Style) {
    this.unsetStyle();
    if (this._styleNode == null) {
      this._styleNode = document.createElement('style');
      document.head.appendChild(this._styleNode);
      this._styleNode.type = 'text/css';
    }
    this._styleNode.innerHTML = style.css;
    this.style = style;
  }
  unsetStyle() {
    if (this._styleNode != null && this._styleNode.parentNode != null) {
      this._styleNode.parentNode.removeChild(this._styleNode);
    }
  }

  hasStyle() {
    return this.style != null;
  }
}

export const styleManager = new StyleManager();
