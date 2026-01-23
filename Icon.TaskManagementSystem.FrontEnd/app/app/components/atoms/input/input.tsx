import React, { useState, useRef, useEffect } from 'react';
import './input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.RefObject<HTMLInputElement | null>;
  label?: string;
  helperText?: string;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  ref,
  label, 
  helperText, 
  error = false, 
  className = '', 
  onFocus,
  onBlur,
  onChange,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value ? true : false);

  useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    if (onChange) onChange(e);
  };

  const combinedClassName = [
    'input-wrapper',
    error ? 'input-error' : '',
    isFocused ? 'input-focused' : '',
    hasValue ? 'input-has-value' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      <input
        {...props}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className="input-field"
      />
      {label && (
        <label 
          className={`input-label ${isFocused || hasValue ? 'input-label-floating' : ''}`}
        >
          {label}
        </label>
      )}
      {helperText && (
        <div className={`input-helper-text ${error ? 'input-helper-error' : ''}`}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;