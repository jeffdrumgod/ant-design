import { TinyColor } from '@ctrl/tinycolor';
import { clearFix } from '../../_util/theme';
import type { GenerateStyle, FullToken } from '../../_util/theme';

const genPictureStyle: GenerateStyle<FullToken<'Upload'>> = token => {
  const { componentCls, iconCls } = token;
  const listCls = `${componentCls}-list`;
  const itemCls = `${listCls}-item`;

  return {
    [`${componentCls}-wrapper`]: {
      // ${listCls} 增加优先级
      [`${listCls}${listCls}-picture, ${listCls}${listCls}-picture-card`]: {
        [itemCls]: {
          position: 'relative',
          height: '66px',
          padding: token.paddingXS,
          border: `${token.controlLineWidth}px ${token.uploadPictureCardBorderStyle} ${token.colorBorder}`,
          borderRadius: token.radiusBase,

          '&:hover': {
            background: 'transparent',
          },

          [`${itemCls}-thumbnail`]: {
            width: '48px',
            height: '48px',
            lineHeight: '60px',
            textAlign: 'center',
            opacity: 0.8,
            flex: 'none',

            [iconCls]: {
              fontSize: 26,
            },

            img: {
              display: 'block',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            },
          },

          [`${itemCls}-progress`]: {
            bottom: '14px',
            width: 'calc(100% - 24px)',
            marginTop: 0,
            paddingLeft: '56px',
          },
        },

        [`${itemCls}-error`]: {
          borderColor: token.colorError,

          // Adjust the color of the error icon : https://github.com/ant-design/ant-design/pull/24160
          [`${itemCls}-thumbnail ${iconCls}`]: {
            [`svg path[fill='#e6f7ff']`]: {
              fill: token.colorBgError,
            },
            [`svg path[fill='#1890ff']`]: {
              fill: token.colorError,
            },
          },
        },

        [`${itemCls}-uploading`]: {
          borderStyle: 'dashed',

          [`${itemCls}-name`]: {
            marginBottom: '12px',
          },
        },
      },
    },
  };
};

const genPictureCardStyle: GenerateStyle<FullToken<'Upload'>> = token => {
  const { componentCls, iconCls } = token;
  const listCls = `${componentCls}-list`;
  const itemCls = `${listCls}-item`;

  return {
    [`${componentCls}-wrapper${componentCls}-picture-card-wrapper`]: {
      ...clearFix(),
      display: 'inline-block',
      width: '100%',

      [`${componentCls}${componentCls}-select`]: {
        width: token.uploadPictureCardSize,
        height: token.uploadPictureCardSize,
        marginRight: token.marginXS,
        marginBottom: token.marginXS,
        textAlign: 'center',
        verticalAlign: 'top',
        backgroundColor: token.colorBgComponentSecondary,
        border: `${token.controlLineWidth}px dashed ${token.colorBorder}`,
        borderRadius: token.radiusBase,
        cursor: 'pointer',
        transition: `border-color ${token.motionDurationSlow}`,

        [`> ${componentCls}`]: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
        },

        [`&:not(${componentCls}-disabled):hover`]: {
          borderColor: token.colorPrimary,
        },
      },

      // list
      [`${listCls}${listCls}-picture-card`]: {
        [`${listCls}-item-container`]: {
          display: 'inline-block',
          width: token.uploadPictureCardSize,
          height: token.uploadPictureCardSize,
          margin: `0 ${token.marginXS}px ${token.marginXS}px 0`,
          verticalAlign: 'top',
        },

        '&::after': {
          display: 'none',
        },

        [itemCls]: {
          height: '100%',
          margin: 0,

          '&::before': {
            position: 'absolute',
            zIndex: 1,
            width: 'calc(100% - 16px)',
            height: 'calc(100% - 16px)',
            backgroundColor: new TinyColor('#000').setAlpha(0.5).toRgbString(),
            opacity: 0,
            transition: `all ${token.motionDurationSlow}`,
            content: '" "',
          },
        },

        [`${itemCls}:hover`]: {
          [`&::before, ${itemCls}-actions`]: {
            opacity: 1,
          },
        },

        [`${itemCls}-actions`]: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          zIndex: 10,
          whiteSpace: 'nowrap',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          transition: `all ${token.motionDurationSlow}`,

          [`${iconCls}-eye, ${iconCls}-download, ${iconCls}-delete`]: {
            zIndex: 10,
            width: '16px',
            margin: '0 4px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: `all ${token.motionDurationSlow}`,
          },
        },

        [`${itemCls}-actions, ${itemCls}-actions:hover`]: {
          [`${iconCls}-eye, ${iconCls}-download, ${iconCls}-delete`]: {
            // FIXME: @text-color-dark: fade(@white, 85%);
            color: new TinyColor('#fff').setAlpha(0.85).toRgbString(),
            '&:hover': {
              // FIXME: @text-color-dark: fade(@white, 85%);
              color: '#fff',
            },
          },
        },

        [`${itemCls}-thumbnail, ${itemCls}-thumbnail img`]: {
          position: 'static',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        },

        [`${itemCls}-name`]: {
          display: 'none',
          margin: '8px 0 0',
          padding: 0,
          lineHeight: token.lineHeight,
          textAlign: 'center',
        },

        [`${itemCls}-file + ${itemCls}-name`]: {
          position: 'absolute',
          bottom: '18px',
          display: 'block',
          width: 'calc(100% - 16px)',
        },

        [`${itemCls}-uploading`]: {
          [`&${itemCls}`]: {
            backgroundColor: token.colorBgComponentSecondary,
          },

          [`&::before, ${iconCls}-eye, ${iconCls}-download, ${iconCls}-delete`]: {
            display: 'none',
          },
        },

        [`${itemCls}-progress`]: {
          bottom: '32px',
          width: 'calc(100% - 16px)',
          paddingLeft: '0',
        },
      },
    },
  };
};

export { genPictureStyle, genPictureCardStyle };
