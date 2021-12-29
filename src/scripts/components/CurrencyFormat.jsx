import React, { memo } from 'react';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';

function CurrencyFormat({ value, prefix, from, disabled, bold }) {
  const styles = {
    currencyText: {
      fontSize: '0.875rem',
      paddingTop: from === 'other' ? 0 : '8px',
      paddingBottom: from === 'other' ? 0 : '8px',
      width: from === 'other' && '13ch',
      textAlign: 'right',
      ...(disabled && { color: 'gray' }),
      ...(bold && { fontWeight: 'bold' }),
    },
    currencyTextComplex: {
      fontSize: '0.875rem',
      paddingTop: '2.4px',
      paddingBottom: '8px',
      textAlign: 'right',
      ...(disabled && { color: 'gray' }),
      ...(bold && { fontWeight: 'bold' }),
    },
  };
  return (
    <NumberFormat
      value={value}
      style={from === 'table-complex' ? styles.currencyTextComplex : styles.currencyText}
      displayType="text"
      prefix={prefix}
      decimalScale={2}
      fixedDecimalScale={2}
      thousandSeparator={true}
      renderText={(value, props) => <div {...props}>{value}</div>}
    />
  );
}

CurrencyFormat.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  prefix: PropTypes.string,
  from: PropTypes.oneOf(['table', 'table-complex', 'other']).isRequired,
  disabled: PropTypes.bool,
};

CurrencyFormat.defaultProps = {
  prefix: '',
  from: 'other',
  disabled: false,
};

export default memo(CurrencyFormat);
