import { useState, useRef, useEffect } from 'react';
import Input from '~/components/atoms/input/input';
import './filter.css';

type FilterFieldsTypes = 'text';

interface FilterFields {
  [fieldKey: string]: {
    name: string,
    initialValue: any;
    type: FilterFieldsTypes
  }
}

interface FilterProps<T extends FilterFields> {
  onFilterChange: <K extends keyof T>(fieldKey: K, value: any, type: FilterFieldsTypes) => void;
  fields: T
}

function Filter<T extends FilterFields>({ onFilterChange, fields }: FilterProps<T>) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const fieldValuesInitial = Object.fromEntries(Object.entries(fields).map(x => [x[0], x[1].initialValue]).sort((x, y) => x[0] < y[0] ? -1 : 1));
  const [inputValues, setInputValues] = useState(fieldValuesInitial);
  const fieldValuesInitialEntries = Object.entries(fieldValuesInitial).sort((x, y) => x[0] < y[0] ? -1 : 1);

  const inputRefs = Object.fromEntries(Object.entries(fields).map(x => [x[0], useRef<HTMLInputElement>(null)]));

  useEffect(() => {
    setInputValues(fieldValuesInitial);
  }, [...fieldValuesInitialEntries.map(x => JSON.stringify(x))]);

  const handleIconClick = (fieldKey: string) => {
    setActiveField(fieldKey);
    setTimeout(() => {
      if (inputRefs[fieldKey]?.current != null) {
        inputRefs[fieldKey]?.current.focus();
      }
    }, 0);
  };

  const handleInputChange = (fieldKey: string, value: string) => {
    const newValues = { ...inputValues, [fieldKey]: value };
    setInputValues(newValues);
    onFilterChange(fieldKey, value, fields[fieldKey].type);
  };

  const handleBlur = (fieldKey: string) => {
    // Nullify active field if all fields are empty
    if (Object.values(inputValues).every(x => !x)) {
      setActiveField(null);
    }
  };

  const hasActiveFilters = Object.values(inputValues).some(x => !!x);

  return (
    <div className={`filter-container ${hasActiveFilters ? 'active-filters' : ''}`}>
      <div className="filter-icons">
        {
          Object.entries(fields).map(([fieldKey, fieldProps]) =>
            <div
              key={fieldKey}
              className={`filter-icon ${activeField === fieldKey || inputValues[fieldKey] ? 'active' : ''}`}
              onClick={() => handleIconClick(fieldKey)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="filter-label">{fieldProps.name}</span>
            </div>
          )
        }
      </div>

      {
        Object.entries(fields).map(([fieldKey, fieldProps]) => {
          if (activeField === fieldKey || inputValues[fieldKey]) {
            switch (fieldProps.type) {
              case 'text':
                return <div key={fieldKey} className="filter-input-container">
                  <Input
                    ref={inputRefs[fieldKey]}
                    label={fieldProps.name}
                    value={inputValues[fieldKey] || ''}
                    onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                    onBlur={() => handleBlur(fieldKey)}
                  />
                </div>
              default:
                return null;
            }
          }
          return null;
        })
      }
    </div>
  );
};

export default Filter;
