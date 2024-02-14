import React, { useState, useMemo, useEffect } from 'react';
import Cookies from 'js-cookie';

const App = () => {
  const [number, setNumber] = useState('');
  const [history, setHistory] = useState(Cookies.get('history') ? JSON.parse(Cookies.get('history')) : []);
  const [error, setError] = useState('');
  const [colorStreak, setColorStreak] = useState({ color: '', count: 0 });
  

  const handleChange = (e) => {
    setNumber(e.target.value);
  };

  const getMedalColor = (index) => {
    switch (index) {
      case 0:
        return 'text-green-400';
      case 1:
        return 'text-blue-400';
      case 2:
        return 'text-yellow-400';
      default:
        return 'text-black';
    }
  };
  const calculateColorStreak = (newHistory, useRawColor = false) => {
    let lastColor = useRawColor ? getColorForNumberRaw(newHistory[newHistory.length - 1]) : getColorForNumber(newHistory[newHistory.length - 1]);
    let count = 1;
    
    for (let i = newHistory.length - 2; i >= 0; i--) {
      const currentColor = useRawColor ? getColorForNumberRaw(newHistory[i]) : getColorForNumber(newHistory[i]);
      if (currentColor === lastColor) {
        count++;
      } else {
        break;
      }
    }
  
    return count > 1 ? { color: lastColor, count } : { color: '', count: 0 };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseInt(number, 10);
    if (value < 0 || value > 36 || isNaN(value)) {
      setError('Veuillez entrer un nombre entre 0 et 36.');
      return;
    }
    setError('');
    const newHistory = [...history, value.toString()];
    setHistory(newHistory);
    setNumber('');
    const newColorStreak = calculateColorStreak(newHistory, true);
    setColorStreak(newColorStreak);
  };

  const submitNumber = () => {
    const value = parseInt(number, 10);
    if (value < 0 || value > 36 || isNaN(value)) {
      setError('Veuillez entrer un nombre entre 0 et 36.');
      return;
    }
    setError('');
    setHistory([...history, value.toString()]);
    setNumber('');
  };

  const handleDelete = (indexToDelete) => {
    setHistory(history.filter((_, index) => index !== indexToDelete));
  };

  const handleKeyPress = (digit) => {
    const newValue = `${number}${digit}`.slice(0, 2);
    setNumber(newValue);
  };

  const handleReset = () => {
    setNumber('');
  };

  const getColorForNumber = (num) => {
    const value = parseInt(num, 10);
    if (value === 0) return 'text-green-600';
    if (value % 2 === 0) return 'text-black';
    return 'text-red-600';
  };
  const getColorForNumberRaw = (num) => {
    const value = parseInt(num, 10);
    if (value === 0) return 'vert';
    if (value % 2 === 0) return 'noir';
    return 'rouge';
  };

  const numberFrequency = useMemo(() => {
    const frequency = Array(37).fill(0);
    history.forEach(num => {
      const value = parseInt(num, 10);
      if (value >= 0 && value <= 36) {
        frequency[value]++;
      }
    });
    return frequency.map((count, number) => ({ number, count }));
  }, [history]);

  const sortedNumbers = useMemo(() => {
    return numberFrequency.sort((a, b) => a.count - b.count);
  }, [numberFrequency]);

  const keypadOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  useEffect(() => {
    Cookies.set('history', JSON.stringify(history));
    Cookies.set('colorStreak', JSON.stringify(colorStreak));
  }, [history, colorStreak]);
  const resetHistory = () => {
    setHistory([]);
    setColorStreak({ color: '', count: 0 });
  };
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <form className="flex mb-8 bg-slate-50 w-36 rounded-sm justify-around p-1">
        <div className='bg-white flex w-20 justify-around rounded-lg'>
          <input
            type="text"
            value={number}
            onChange={handleChange}
            className="w-8 outline-none py-1 px-2 bg-transparent"
          />
          <button onClick={handleReset} className="text-xl">✕</button>
        </div>
        <button onClick={handleSubmit} className="text-3xl">+</button>
      </form>
      <div className="grid grid-cols-3 justify-center mt-4">
        {keypadOrder.map((digit, index) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 m-1 rounded`}
            style={{gridArea: index === 9 ? '4/2/5/3' : '' }}
          >
            {digit}
          </button>
        ))}
      </div>
      {colorStreak.count > 0 && (
        <div className="mt-4 flex gap-1">
          <img className={`h-5 text-${colorStreak.color}`} src="https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/flame-icon.png" alt="" />
          {colorStreak.count} fois {colorStreak.color} consécutivement
          <img className={`h-5 text-${colorStreak.color}`} src="https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/flame-icon.png" alt="" />
        </div>
      )}

      <h2 className="text-sm mb-4 text-red-600">{error}</h2>
      <div className="flex items-center justify-around flex-wrap gap-2">
        <div className='flex flex-col items-center overflow-scroll h-96 w-60 border p-4 rounded-lg'>
          <h2 className="text-lg font-semibold mb-4 text-center">Historique des nombres</h2>
          <ul>
            {history.slice().reverse().map((num, reversedIndex) => {
              const index = history.length - 1 - reversedIndex;
              return (
                <li key={index} className={`flex justify-between items-center p-2 font-medium ${getColorForNumber(num)}`}>
                  {index + 1} : Nombre {num}
                  <button onClick={() => handleDelete(index)}>
                    <img src="https://uxwing.com/wp-content/themes/uxwing/download/user-interface/red-trash-can-icon.png" alt="a" className='h-3 ml-2' />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="h-96 w-60 border p-4 rounded-lg overflow-scroll flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-center">Classement des nombres</h3>
          <ul className="list-decimal pl-4">
            {sortedNumbers.map(({ number, count }, index) => (
              <li key={number} className={`p-2 ${getMedalColor(index)}`}>
                Nombre {number} : {count} fois
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button onClick={resetHistory} className="text-xl">Reset</button>
    </div>
  );
};

export default App;
