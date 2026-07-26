import { useState, useRef, useEffect } from 'react';
import { HiOutlineChevronDown, HiCheck, HiOutlineSearch } from 'react-icons/hi';
import './CustomSelect.css';

const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  icon: LeftIcon = null,
  showSearch = false,
  showColorDot = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Normalize options array into objects { value, label, color, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label || opt.value,
        color: opt.color || null,
        icon: opt.icon || null,
      };
    }
    return { value: opt, label: opt, color: null, icon: null };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  const filteredOptions = showSearch && searchTerm
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : normalizedOptions;

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      // Create synthetic event object so standard e.target.value works
      const fakeEvent = {
        target: {
          id,
          name: name || id,
          value: optionValue,
        },
      };
      onChange(fakeEvent, optionValue);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${disabled ? 'disabled' : ''} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="custom-select-trigger-content">
          {LeftIcon && <LeftIcon className="custom-select-icon-left" />}
          
          {selectedOption?.color && showColorDot && (
            <span
              className="custom-select-color-dot"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}

          <span className={`custom-select-label ${!selectedOption ? 'placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <HiOutlineChevronDown
          className={`custom-select-chevron ${isOpen ? 'rotate' : ''}`}
        />
      </button>

      {/* Floating Dropdown Listbox */}
      {isOpen && (
        <div className="custom-select-dropdown animate-dropdown-fade">
          {showSearch && (
            <div className="custom-select-search-box">
              <HiOutlineSearch className="custom-select-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}

          <ul className="custom-select-options-list" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="custom-select-no-options">No options found</li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="custom-select-option-inner">
                      {opt.color && showColorDot && (
                        <span
                          className="custom-select-color-dot"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span>{opt.label}</span>
                    </div>

                    {isSelected && <HiCheck className="custom-select-check-icon" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
