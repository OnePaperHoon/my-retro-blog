import { useState, useCallback, useEffect } from 'react';
import { Button } from 'react95';
import soundManager from '../../utils/sounds';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  // Handle digit input
  const inputDigit = useCallback((digit) => {
    soundManager.click();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  // Handle decimal point
  const inputDecimal = useCallback(() => {
    soundManager.click();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  // Clear everything
  const clearAll = useCallback(() => {
    soundManager.click();
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  // Clear current entry
  const clearEntry = useCallback(() => {
    soundManager.click();
    setDisplay('0');
  }, []);

  // Backspace
  const backspace = useCallback(() => {
    soundManager.click();
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display]);

  // Toggle sign
  const toggleSign = useCallback(() => {
    soundManager.click();
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  // Percentage
  const percentage = useCallback(() => {
    soundManager.click();
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  // Square root
  const squareRoot = useCallback(() => {
    soundManager.click();
    const value = parseFloat(display);
    if (value < 0) {
      soundManager.error();
      setDisplay('Error');
    } else {
      setDisplay(String(Math.sqrt(value)));
    }
  }, [display]);

  // Reciprocal (1/x)
  const reciprocal = useCallback(() => {
    soundManager.click();
    const value = parseFloat(display);
    if (value === 0) {
      soundManager.error();
      setDisplay('Error');
    } else {
      setDisplay(String(1 / value));
    }
  }, [display]);

  // Perform calculation
  const performOperation = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      return inputValue;
    }

    switch (operator) {
      case '+':
        return previousValue + inputValue;
      case '-':
        return previousValue - inputValue;
      case '*':
        return previousValue * inputValue;
      case '/':
        if (inputValue === 0) {
          soundManager.error();
          return 'Error';
        }
        return previousValue / inputValue;
      default:
        return inputValue;
    }
  }, [display, operator, previousValue]);

  // Handle operator input
  const handleOperator = useCallback((nextOperator) => {
    soundManager.click();
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(inputValue);
    } else if (operator && !waitingForOperand) {
      const result = performOperation();
      setDisplay(String(result));
      setPreviousValue(result === 'Error' ? null : result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, performOperation, previousValue, waitingForOperand]);

  // Equals
  const handleEquals = useCallback(() => {
    soundManager.click();
    if (operator && previousValue != null) {
      const result = performOperation();
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [operator, performOperation, previousValue]);

  // Memory functions
  const memoryClear = useCallback(() => {
    soundManager.click();
    setMemory(0);
  }, []);

  const memoryRecall = useCallback(() => {
    soundManager.click();
    setDisplay(String(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const memoryStore = useCallback(() => {
    soundManager.click();
    setMemory(parseFloat(display));
  }, [display]);

  const memoryAdd = useCallback(() => {
    soundManager.click();
    setMemory(memory + parseFloat(display));
  }, [display, memory]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clearAll, backspace, percentage]);

  // Button style helper
  const buttonStyle = {
    width: '40px',
    height: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: 0
  };

  const wideButtonStyle = {
    ...buttonStyle,
    width: '84px'
  };

  return (
    <div style={{
      backgroundColor: '#c0c0c0',
      padding: '8px',
      fontFamily: 'Arial, sans-serif',
      userSelect: 'none'
    }}>
      {/* Display */}
      <div style={{
        backgroundColor: '#fff',
        border: '2px inset #808080',
        padding: '4px 8px',
        marginBottom: '8px',
        textAlign: 'right',
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        height: '28px',
        overflow: 'hidden'
      }}>
        {display.length > 16 ? display.slice(0, 16) : display}
      </div>

      {/* Memory indicator */}
      <div style={{
        fontSize: '10px',
        height: '14px',
        marginBottom: '4px',
        paddingLeft: '4px'
      }}>
        {memory !== 0 && 'M'}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Row 1: Memory and Clear */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={buttonStyle} onClick={memoryClear}>MC</Button>
          <Button style={buttonStyle} onClick={memoryRecall}>MR</Button>
          <Button style={buttonStyle} onClick={memoryStore}>MS</Button>
          <Button style={buttonStyle} onClick={memoryAdd}>M+</Button>
          <Button style={buttonStyle} onClick={backspace}>←</Button>
        </div>

        {/* Row 2: CE, C, ±, √ */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={buttonStyle} onClick={clearEntry}>CE</Button>
          <Button style={buttonStyle} onClick={clearAll}>C</Button>
          <Button style={buttonStyle} onClick={toggleSign}>±</Button>
          <Button style={buttonStyle} onClick={squareRoot}>√</Button>
          <Button style={buttonStyle} onClick={() => handleOperator('/')}>÷</Button>
        </div>

        {/* Row 3: 7, 8, 9, * */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={buttonStyle} onClick={() => inputDigit('7')}>7</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('8')}>8</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('9')}>9</Button>
          <Button style={buttonStyle} onClick={reciprocal}>1/x</Button>
          <Button style={buttonStyle} onClick={() => handleOperator('*')}>×</Button>
        </div>

        {/* Row 4: 4, 5, 6, - */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={buttonStyle} onClick={() => inputDigit('4')}>4</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('5')}>5</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('6')}>6</Button>
          <Button style={buttonStyle} onClick={percentage}>%</Button>
          <Button style={buttonStyle} onClick={() => handleOperator('-')}>−</Button>
        </div>

        {/* Row 5: 1, 2, 3, + */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={buttonStyle} onClick={() => inputDigit('1')}>1</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('2')}>2</Button>
          <Button style={buttonStyle} onClick={() => inputDigit('3')}>3</Button>
          <Button style={buttonStyle} onClick={() => {}} disabled>&nbsp;</Button>
          <Button style={buttonStyle} onClick={() => handleOperator('+')}>+</Button>
        </div>

        {/* Row 6: 0, ., = */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button style={wideButtonStyle} onClick={() => inputDigit('0')}>0</Button>
          <Button style={buttonStyle} onClick={inputDecimal}>.</Button>
          <Button style={buttonStyle} onClick={() => {}} disabled>&nbsp;</Button>
          <Button style={buttonStyle} onClick={handleEquals}>=</Button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
