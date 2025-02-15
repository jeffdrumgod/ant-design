import React, { useState } from 'react';
import { mount } from 'enzyme';
import RcTextArea from 'rc-textarea';
import Input from '..';
import focusTest from '../../../tests/shared/focusTest';
import { sleep, render } from '../../../tests/utils';

const { TextArea } = Input;

focusTest(TextArea, { refFocus: true });

describe('TextArea', () => {
  const originalGetComputedStyle = window.getComputedStyle;
  beforeAll(() => {
    Object.defineProperty(window, 'getComputedStyle', {
      value: node => ({
        getPropertyValue: prop => {
          if (prop === 'box-sizing') {
            return originalGetComputedStyle(node)[prop] || 'border-box';
          }
          return originalGetComputedStyle(node)[prop];
        },
      }),
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'getComputedStyle', {
      value: originalGetComputedStyle,
    });
  });

  it('should auto calculate height according to content length', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const ref = React.createRef();

    const genTextArea = (props = {}) => (
      <TextArea
        value=""
        readOnly
        autoSize={{ minRows: 2, maxRows: 6 }}
        wrap="off"
        ref={ref}
        {...props}
      />
    );

    const { container, rerender } = render(genTextArea());

    const mockFunc = jest.spyOn(ref.current.resizableTextArea, 'resizeTextarea');

    rerender(genTextArea({ value: '1111\n2222\n3333' }));
    // wrapper.setProps({ value: '1111\n2222\n3333' });
    await sleep(0);
    expect(mockFunc).toHaveBeenCalledTimes(1);

    rerender(genTextArea({ value: '1111' }));
    // wrapper.setProps({ value: '1111' });
    await sleep(0);
    expect(mockFunc).toHaveBeenCalledTimes(2);

    expect(container.querySelector('textarea').style.overflow).toBeFalsy();

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('should support onPressEnter and onKeyDown', () => {
    const fakeHandleKeyDown = jest.fn();
    const fakeHandlePressEnter = jest.fn();
    const wrapper = mount(
      <TextArea onKeyDown={fakeHandleKeyDown} onPressEnter={fakeHandlePressEnter} />,
    );
    /** KeyCode 65 is A */
    wrapper.find('textarea').simulate('keydown', { keyCode: 65 });
    expect(fakeHandleKeyDown).toHaveBeenCalledTimes(1);
    expect(fakeHandlePressEnter).toHaveBeenCalledTimes(0);

    /** KeyCode 13 is Enter */
    wrapper.find('textarea').simulate('keydown', { keyCode: 13 });
    expect(fakeHandleKeyDown).toHaveBeenCalledTimes(2);
    expect(fakeHandlePressEnter).toHaveBeenCalledTimes(1);
  });

  it('should support disabled', () => {
    const wrapper = mount(<TextArea disabled />);
    expect(wrapper.render()).toMatchSnapshot();
  });

  describe('maxLength', () => {
    it('should support maxLength', () => {
      const wrapper = mount(<TextArea maxLength={10} />);
      expect(wrapper.render()).toMatchSnapshot();
    });

    it('maxLength should not block control', () => {
      const wrapper = mount(<TextArea maxLength={1} value="light" />);
      expect(wrapper.find('textarea').props().value).toEqual('light');
    });

    it('should limit correctly when in control', () => {
      const Demo = () => {
        const [val, setVal] = React.useState('');
        return <TextArea maxLength={1} value={val} onChange={e => setVal(e.target.value)} />;
      };

      const wrapper = mount(<Demo />);
      wrapper.find('textarea').simulate('change', { target: { value: 'light' } });

      expect(wrapper.find('textarea').props().value).toEqual('l');
    });

    it('should exceed maxLength when use IME', () => {
      const onChange = jest.fn();

      const wrapper = mount(<TextArea maxLength={1} onChange={onChange} />);
      wrapper.find('textarea').simulate('compositionStart');
      wrapper.find('textarea').simulate('change', { target: { value: 'zhu' } });
      wrapper.find('textarea').simulate('compositionEnd', { currentTarget: { value: '竹' } });
      wrapper.find('textarea').simulate('change', { target: { value: '竹' } });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: '竹' }) }),
      );
    });

    // 字符输入
    it('should not cut off string when cursor position is not at the end', () => {
      const onChange = jest.fn();
      const wrapper = mount(<TextArea maxLength={6} defaultValue="123456" onChange={onChange} />);
      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 1, value: 'w123456' } });
      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 3, value: '123w456' } });
      expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('123456');
    });

    // 拼音输入
    // 1. 光标位于最后，且当前字符数未达到6个，若选中的字符 + 原字符的长度超过6个，则将最终的字符按照maxlength截断
    it('when the input method is pinyin and the cursor is at the end, should use maxLength to crop', () => {
      const onChange = jest.fn();
      const wrapper = mount(<TextArea maxLength={6} defaultValue="1234" onChange={onChange} />);
      wrapper.find('textarea').instance().value = '1234'; // enzyme not support change `currentTarget`
      wrapper.find('textarea').instance().selectionStart = 4;
      wrapper.find('textarea').simulate('compositionStart');

      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 9, value: '1234z z z' } });
      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 7, value: '1234组织者' } });

      wrapper.find('textarea').instance().value = '1234组织者';
      wrapper.find('textarea').instance().selectionStart = 7;
      wrapper.find('textarea').simulate('compositionEnd');

      expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('1234组织');
    });

    // 2. 光标位于中间或开头，且当前字符数未达到6个，若选中的字符 + 原字符的长度超过6个，则显示原有字符
    it('when the input method is Pinyin and the cursor is in the middle, should display the original string', () => {
      const onChange = jest.fn();
      const wrapper = mount(<TextArea maxLength={6} defaultValue="1234" onChange={onChange} />);
      wrapper.find('textarea').instance().value = '1234'; // enzyme not support change `currentTarget`
      wrapper.find('textarea').instance().selectionStart = 2;
      wrapper.find('textarea').simulate('compositionStart');

      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 2, value: '12z z z34' } });
      wrapper
        .find('textarea')
        .simulate('change', { target: { selectionStart: 5, value: '12组织者34' } });

      wrapper.find('textarea').instance().value = '12组织者34';
      wrapper.find('textarea').instance().selectionStart = 5;
      wrapper.find('textarea').simulate('compositionEnd');

      expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('1234');
    });
  });

  it('when prop value not in this.props, resizeTextarea should be called', async () => {
    const ref = React.createRef();
    const wrapper = mount(<TextArea aria-label="textarea" ref={ref} />);
    const resizeTextarea = jest.spyOn(ref.current.resizableTextArea, 'resizeTextarea');
    wrapper.find('textarea').simulate('change', {
      target: {
        value: 'test',
      },
    });
    expect(resizeTextarea).toHaveBeenCalled();
  });

  it('handleKeyDown', () => {
    const onPressEnter = jest.fn();
    const onKeyDown = jest.fn();
    const wrapper = mount(
      <TextArea onPressEnter={onPressEnter} onKeyDown={onKeyDown} aria-label="textarea" />,
    );
    wrapper.find(RcTextArea).instance().handleKeyDown({ keyCode: 13 });
    expect(onPressEnter).toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('should trigger onResize', async () => {
    const onResize = jest.fn();
    const wrapper = mount(<TextArea onResize={onResize} autoSize />);
    await sleep(100);
    wrapper.triggerResize();
    await Promise.resolve();

    expect(onResize).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    );
  });

  it('should works same as Input', () => {
    const { container: inputContainer, rerender: inputRerender } = render(<Input value="111" />);
    const { container: textareaContainer, rerender: textareaRerender } = render(
      <TextArea value="111" />,
    );
    inputRerender(<Input value={undefined} />);
    textareaRerender(<TextArea value={undefined} />);
    expect(textareaContainer.querySelector('textarea').value).toBe(
      inputContainer.querySelector('input').value,
    );
  });

  describe('should support showCount', () => {
    it('maxLength', () => {
      const wrapper = mount(<TextArea maxLength={5} showCount value="12345" />);
      const textarea = wrapper.find('.ant-input-textarea');
      expect(wrapper.find('textarea').prop('value')).toBe('12345');
      expect(textarea.prop('data-count')).toBe('5 / 5');
    });

    it('control exceed maxLength', () => {
      const wrapper = mount(<TextArea maxLength={5} showCount value="12345678" />);
      const textarea = wrapper.find('.ant-input-textarea');
      expect(wrapper.find('textarea').prop('value')).toBe('12345678');
      expect(textarea.prop('data-count')).toBe('8 / 5');
    });

    describe('emoji', () => {
      it('should minimize value between emoji length and maxLength', () => {
        const wrapper = mount(<TextArea maxLength={1} showCount value="👀" />);
        const textarea = wrapper.find('.ant-input-textarea');
        expect(wrapper.find('textarea').prop('value')).toBe('👀');
        expect(textarea.prop('data-count')).toBe('1 / 1');

        // fix: 当 maxLength 长度为 2 的时候，输入 emoji 之后 showCount 会显示 1/2，但是不能再输入了
        // zombieJ: 逻辑统一了，emoji 现在也可以正确计数了
        const wrapper1 = mount(<TextArea maxLength={2} showCount value="👀" />);
        const textarea1 = wrapper1.find('.ant-input-textarea');
        expect(textarea1.prop('data-count')).toBe('1 / 2');
      });

      it('defaultValue should slice', () => {
        const wrapper = mount(<TextArea maxLength={1} defaultValue="🧐cut" />);
        expect(wrapper.find('textarea').prop('value')).toBe('🧐');
      });

      // 修改TextArea value截取规则后新增单测
      it('slice emoji', () => {
        const wrapper = mount(<TextArea maxLength={5} showCount value="1234😂" />);
        const textarea = wrapper.find('.ant-input-textarea');
        expect(wrapper.find('textarea').prop('value')).toBe('1234😂');
        expect(textarea.prop('data-count')).toBe('5 / 5');
      });
    });

    it('className & style patch to outer', () => {
      const wrapper = mount(
        <TextArea className="bamboo" style={{ background: 'red' }} showCount />,
      );

      // Outer
      expect(wrapper.find('div').first().hasClass('bamboo')).toBeTruthy();
      expect(wrapper.find('div').first().props().style.background).toEqual('red');

      // Inner
      expect(wrapper.find('.ant-input').hasClass('bamboo')).toBeFalsy();
      expect(wrapper.find('.ant-input').props().style.background).toBeFalsy();
    });

    it('count formatter', () => {
      const wrapper = mount(
        <TextArea
          maxLength={5}
          showCount={{ formatter: ({ count, maxLength }) => `${count}, ${maxLength}` }}
          value="12345"
        />,
      );
      const textarea = wrapper.find('.ant-input-textarea');
      expect(wrapper.find('textarea').prop('value')).toBe('12345');
      expect(textarea.prop('data-count')).toBe('5, 5');
    });
  });

  it('should support size', async () => {
    const wrapper = mount(<TextArea size="large" />);
    expect(wrapper.find('textarea').hasClass('ant-input-lg')).toBe(true);
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('set mouse cursor position', () => {
    const defaultValue = '11111';
    const valLength = defaultValue.length;
    const ref = React.createRef();
    mount(<TextArea autoFocus ref={ref} defaultValue={defaultValue} />);
    ref.current.resizableTextArea.textArea.setSelectionRange(valLength, valLength);
    expect(ref.current.resizableTextArea.textArea.selectionStart).toEqual(5);
    expect(ref.current.resizableTextArea.textArea.selectionEnd).toEqual(5);
  });
});

describe('TextArea allowClear', () => {
  it('should change type when click', () => {
    const wrapper = mount(<TextArea allowClear />);
    wrapper.find('textarea').simulate('change', { target: { value: '111' } });
    expect(wrapper.find('textarea').getDOMNode().value).toEqual('111');
    expect(wrapper.render()).toMatchSnapshot();
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(wrapper.render()).toMatchSnapshot();
    expect(wrapper.find('textarea').getDOMNode().value).toEqual('');
  });

  it('should not show icon if value is undefined, null or empty string', () => {
    const wrappers = [null, undefined, ''].map(val => mount(<TextArea allowClear value={val} />));
    wrappers.forEach(wrapper => {
      expect(wrapper.find('textarea').getDOMNode().value).toEqual('');
      expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
      expect(wrapper.render()).toMatchSnapshot();
    });
  });

  it('should not show icon if defaultValue is undefined, null or empty string', () => {
    const wrappers = [null, undefined, ''].map(val =>
      mount(<TextArea allowClear defaultValue={val} />),
    );
    wrappers.forEach(wrapper => {
      expect(wrapper.find('textarea').getDOMNode().value).toEqual('');
      expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
      expect(wrapper.render()).toMatchSnapshot();
    });
  });

  it('should trigger event correctly', () => {
    let argumentEventObject;
    let argumentEventObjectValue;
    const onChange = e => {
      argumentEventObject = e;
      argumentEventObjectValue = e.target.value;
    };
    const wrapper = mount(<TextArea allowClear defaultValue="111" onChange={onChange} />);
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(argumentEventObject.type).toBe('click');
    expect(argumentEventObjectValue).toBe('');
    expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('');
  });

  it('should trigger event correctly on controlled mode', () => {
    let argumentEventObject;
    let argumentEventObjectValue;
    const onChange = e => {
      argumentEventObject = e;
      argumentEventObjectValue = e.target.value;
    };
    const wrapper = mount(<TextArea allowClear value="111" onChange={onChange} />);
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(argumentEventObject.type).toBe('click');
    expect(argumentEventObjectValue).toBe('');
    expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('111');
  });

  it('should focus textarea after clear', () => {
    const wrapper = mount(<TextArea allowClear defaultValue="111" />, { attachTo: document.body });
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(document.activeElement).toBe(wrapper.find('textarea').at(0).getDOMNode());
    wrapper.unmount();
  });

  it('should not support allowClear when it is disabled', () => {
    const wrapper = mount(<TextArea allowClear defaultValue="111" disabled />);
    expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
  });

  it('not block input when `value` is undefined', () => {
    const wrapper = mount(<Input value={undefined} />);
    wrapper.find('input').simulate('change', { target: { value: 'Bamboo' } });
    expect(wrapper.find('input').props().value).toEqual('Bamboo');

    // Controlled
    wrapper.setProps({ value: 'Light' });
    wrapper.find('input').simulate('change', { target: { value: 'Bamboo' } });
    expect(wrapper.find('input').props().value).toEqual('Light');
  });

  describe('click focus', () => {
    it('click outside should also get focus', () => {
      const wrapper = mount(<Input suffix={<span className="test-suffix" />} />);
      const onFocus = jest.spyOn(wrapper.find('input').instance(), 'focus');
      wrapper.find('.test-suffix').simulate('mouseUp');
      expect(onFocus).toHaveBeenCalled();
    });

    it('not get focus if out of component', () => {
      const wrapper = mount(<Input suffix={<span className="test-suffix" />} />);
      const onFocus = jest.spyOn(wrapper.find('input').instance(), 'focus');
      const ele = document.createElement('span');
      document.body.appendChild(ele);
      wrapper.find('.test-suffix').simulate('mouseUp', {
        target: ele,
      });
      expect(onFocus).not.toHaveBeenCalled();
      document.body.removeChild(ele);
    });
  });

  it('scroll to bottom when autoSize', async () => {
    const wrapper = mount(<Input.TextArea autoSize />, { attachTo: document.body });
    wrapper.find('textarea').simulate('focus');
    wrapper.find('textarea').getDOMNode().focus();
    const setSelectionRangeFn = jest.spyOn(
      wrapper.find('textarea').getDOMNode(),
      'setSelectionRange',
    );
    wrapper.find('textarea').simulate('input', { target: { value: '\n1' } });
    wrapper.triggerResize();
    await sleep(100);
    expect(setSelectionRangeFn).toHaveBeenCalled();
    wrapper.unmount();
  });

  // https://github.com/ant-design/ant-design/issues/26308
  it('should display defaultValue when value is undefined', () => {
    const wrapper = mount(<Input.TextArea defaultValue="Light" value={undefined} />);
    expect(wrapper.find('textarea').at(0).getDOMNode().value).toBe('Light');
  });

  it('onChange event should return HTMLTextAreaElement', () => {
    const onChange = jest.fn();
    const wrapper = mount(<Input.TextArea onChange={onChange} allowClear />);

    function isNativeElement() {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.any(HTMLTextAreaElement),
        }),
      );

      onChange.mockReset();
    }

    // Change
    wrapper.find('textarea').simulate('change', {
      target: {
        value: 'bamboo',
      },
    });
    isNativeElement();

    // Composition End
    wrapper.find('textarea').instance().value = 'light'; // enzyme not support change `currentTarget`
    wrapper.find('textarea').simulate('compositionEnd');
    isNativeElement();

    // Reset
    wrapper.find('.ant-input-clear-icon').first().simulate('click');
    isNativeElement();
  });

  // https://github.com/ant-design/ant-design/issues/31927
  it('should correctly when useState', () => {
    const App = () => {
      const [query, setQuery] = useState('');
      return (
        <TextArea
          allowClear
          value={query}
          onChange={e => {
            setQuery(() => e.target.value);
          }}
        />
      );
    };

    const wrapper = mount(<App />);

    wrapper.find('textarea').getDOMNode().focus();
    wrapper.find('textarea').simulate('change', { target: { value: '111' } });
    expect(wrapper.find('textarea').getDOMNode().value).toEqual('111');

    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(wrapper.find('textarea').getDOMNode().value).toEqual('');

    wrapper.unmount();
  });

  // https://github.com/ant-design/ant-design/issues/31200
  it('should not lost focus when clear input', () => {
    const onBlur = jest.fn();
    const wrapper = mount(<TextArea allowClear defaultValue="value" onBlur={onBlur} />, {
      attachTo: document.body,
    });
    wrapper.find('textarea').getDOMNode().focus();
    wrapper.find('.ant-input-clear-icon').at(0).simulate('mouseDown');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('mouseUp');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('focus');
    wrapper.find('.ant-input-clear-icon').at(0).getDOMNode().click();
    expect(onBlur).not.toBeCalled();
    wrapper.unmount();
  });

  it('should focus text area after clear', () => {
    const wrapper = mount(<TextArea allowClear defaultValue="111" />, { attachTo: document.body });
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(document.activeElement).toBe(wrapper.find('textarea').at(0).getDOMNode());
    wrapper.unmount();
  });

  it('should display boolean value as string', () => {
    const wrapper = mount(<TextArea value />);
    expect(wrapper.find('textarea').first().getDOMNode().value).toBe('true');
    wrapper.setProps({ value: false });
    expect(wrapper.find('textarea').first().getDOMNode().value).toBe('false');
  });
});
