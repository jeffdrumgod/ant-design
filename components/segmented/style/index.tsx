// deps-lint-skip-all
import { CSSObject } from '@ant-design/cssinjs';
import { TinyColor } from '@ctrl/tinycolor';
import {
  resetComponent,
  GenerateStyle,
  FullToken,
  genComponentStyleHook,
  mergeToken,
} from '../../_util/theme';

export interface ComponentToken {}

interface SegmentedToken extends FullToken<'Segmented'> {
  segmentedBg: string;
  segmentedHoverBg: string;
  segmentedSelectedBg: string;
  segmentedLabelColor: string;
  segmentedLabelHoverColor: string;
  segmentedPaddingVertical: number;
  segmentedPaddingVerticalLG: number;
  segmentedPaddingVerticalSM: number;
  segmentedPaddingHorizontal: number;
  segmentedPaddingHorizontalSM: number;
}
// ============================== Mixins ==============================
function segmentedDisabledItem(cls: string, token: SegmentedToken): CSSObject {
  return {
    [`${cls}, ${cls}:hover, ${cls}:focus`]: {
      color: token.colorTextDisabled,
      cursor: 'not-allowed',
    },
  };
}

// FIXME: hard code
const segmentedSelectedItemBoxShadow = [
  `0 2px 8px -2px ${new TinyColor('#000').setAlpha(0.05).toRgbString()}`,
  `0 1px 4px -1px ${new TinyColor('#000').setAlpha(0.07).toRgbString()}`,
  `0 0 1px 0 ${new TinyColor('#000').setAlpha(0.08).toRgbString()}`,
].join(',');

function segmentedItemSelected(token: SegmentedToken): CSSObject {
  return {
    backgroundColor: token.segmentedSelectedBg,
    borderRadius: token.controlRadius,
    boxShadow: segmentedSelectedItemBoxShadow,
  };
}

const segmentedTextEllipsisCss: CSSObject = {
  overflow: 'hidden',
  // handle text ellipsis
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  wordBreak: 'keep-all',
};

// ============================== Styles ==============================
const genSegmentedStyle: GenerateStyle<SegmentedToken> = (token: SegmentedToken) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      ...resetComponent(token),

      position: 'relative',
      display: 'inline-flex',
      alignItems: 'stretch',
      justifyItems: 'flex-start',
      color: token.segmentedLabelColor,
      backgroundColor: token.segmentedBg,
      borderRadius: token.radiusBase,
      // FIXME: hard code
      boxShadow: `0 0 0 2px ${token.segmentedBg}`,
      transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`,

      // hover/focus styles
      [`&:not(${componentCls}-disabled)`]: {
        '&:hover, &:focus': {
          backgroundColor: token.segmentedHoverBg,
          // FIXME: hard code
          boxShadow: `0 0 0 2px ${token.segmentedHoverBg}`,
        },
      },

      // block styles
      '&&-block': {
        display: 'flex',
      },

      '&&-block &-item': {
        flex: 1,
        minWidth: 0,
      },

      // item styles
      [`${componentCls}-item`]: {
        position: 'relative',
        textAlign: 'center',
        cursor: 'pointer',
        transition: `color ${token.motionDurationSlow} ${token.motionEaseInOut}`,

        '&-selected': {
          ...segmentedItemSelected(token),
          color: token.segmentedLabelHoverColor,
        },

        '&:hover, &:focus': {
          color: token.segmentedLabelHoverColor,
        },

        '&-label': {
          minHeight: token.controlHeight,
          // FIXME: hard code
          padding: `${token.segmentedPaddingVertical}px ${token.segmentedPaddingHorizontal}px`,
          // FIXME: hard code
          lineHeight: `${token.controlHeight - token.segmentedPaddingVertical * 2}px`,
          ...segmentedTextEllipsisCss,
        },

        // syntactic sugar to add `icon` for Segmented Item
        '&-icon': {
          // FIXME: hard code
          marginRight: token.marginSM / 2,
        },

        '&-input': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        },
      },

      // size styles
      [`&&-lg ${componentCls}-item-label`]: {
        minHeight: token.controlHeightLG,
        // FIXME: hard code
        padding: `${token.segmentedPaddingVerticalLG}px ${token.segmentedPaddingHorizontal}px`,
        fontSize: token.fontSizeLG,
        // FIXME: hard code
        lineHeight: `${token.controlHeightLG - token.segmentedPaddingVerticalLG * 2}px`,
      },

      [`&&-sm ${componentCls}-item-label`]: {
        minHeight: token.controlHeightSM,
        // FIXME: hard code
        padding: `0 ${token.controlPaddingHorizontalSM - 1}px`,
        lineHeight: `${token.controlHeightSM - token.segmentedPaddingVerticalSM * 2}px`,
      },

      // disabled styles
      [`&-disabled ${componentCls}-item, ${componentCls}-item-disabled`]: {
        ...segmentedDisabledItem(componentCls, token),
      },

      // thumb styles
      [`${componentCls}-thumb`]: {
        ...segmentedItemSelected(token),

        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: '100%',
        padding: '4px 0',
      },

      // transition effect when `enter-active`
      [`${componentCls}-thumb-motion-enter-active`]: {
        transition: `transform ${token.motionDurationSlow} ${token.motionEaseInOut}, width ${token.motionDurationSlow} ${token.motionEaseInOut}`,
        willChange: 'transform, width',
      },
    },
  };
};

// ============================== Export ==============================
export default genComponentStyleHook('Segmented', token => {
  const segmentedToken = mergeToken<SegmentedToken>(token, {
    // FIXME: hard code
    segmentedBg: new TinyColor('#000').setAlpha(0.04).toRgbString(),
    // FIXME: hard code
    segmentedHoverBg: new TinyColor('#000').setAlpha(0.06).toRgbString(),
    // FIXME: hard code
    segmentedSelectedBg: '#fff',
    // FIXME: hard code
    segmentedLabelColor: new TinyColor('#000').setAlpha(0.65).toRgbString(),
    // FIXME: hard code
    segmentedLabelHoverColor: '#262626',
    segmentedPaddingVertical: Math.max(
      Math.round(((token.controlHeight - token.fontSize * token.lineHeight) / 2) * 10) / 10 -
        token.controlLineWidth,
      3,
    ),
    segmentedPaddingVerticalLG:
      Math.ceil(((token.controlHeightLG - token.fontSizeLG * token.lineHeight) / 2) * 10) / 10 -
      token.controlLineWidth,
    segmentedPaddingVerticalSM: Math.max(
      Math.round(((token.controlHeightSM - token.fontSize * token.lineHeight) / 2) * 10) / 10 -
        token.controlLineWidth,
      0,
    ),
    segmentedPaddingHorizontal: token.controlPaddingHorizontal - token.controlLineWidth,
    segmentedPaddingHorizontalSM: token.controlPaddingHorizontalSM - token.controlLineWidth,
  });
  return [genSegmentedStyle(segmentedToken)];
});
