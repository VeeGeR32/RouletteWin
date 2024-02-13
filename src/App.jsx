import React, { useState, useEffect } from 'react';

const RouletteTracker = () => {
  const [number, setNumber] = useState('');
  const [history, setHistory] = useState([]);
  const [leastFrequentNumbers, setLeastFrequentNumbers] = useState([]);
  const [colorProbability, setColorProbability] = useState({ red: 50, black: 50 });

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('rouletteHistory')) || [];
    setHistory(savedHistory);
    updateCalculations(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem('rouletteHistory', JSON.stringify(history));
    updateCalculations(history);
  }, [history]);

  const updateCalculations = (history) => {
    setLeastFrequentNumbers(calculateLeastFrequentNumbers(history));
    setColorProbability(calculateColorProbability(history));
  };

  const handleNumberSubmit = (e) => {
    e.preventDefault();
    if (number !== '' && !isNaN(number) && number >= 0 && number <= 36) {
      const color = determineColor(number);
      const newEntry = { number: parseInt(number), color };
      setHistory([newEntry, ...history]);
      setNumber('');
    }
  };

  const determineColor = (number) => {
    if (number === '0') {
      return 'green';
    }
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(parseInt(number)) ? 'red' : 'black';
  };

  const calculateLeastFrequentNumbers = (history) => {
    const maxNumber = 36;
    let lastSeen = {};
  
    // Au lieu d'initialiser à -1, initialisez chaque numéro avec le nombre total de tirages
    // Cela simule un incrément de chaque compteur à chaque tirage
    for (let i = 0; i <= maxNumber; i++) {
      lastSeen[i] = history.length; // Chaque numéro est "vu" au début
    }
  
    // Mettre à jour lastSeen pour chaque numéro dans l'historique en décrémentant
    // pour simuler "combien de tours depuis vu"
    history.forEach((entry, index) => {
      lastSeen[parseInt(entry.number)] = 0; // Réinitialiser le compteur pour le numéro tiré à 0
      Object.keys(lastSeen).forEach(num => {
        if (parseInt(num) !== parseInt(entry.number)) {
          lastSeen[num]++; // Incrémenter pour tous les autres numéros
        }
      });
    });
  
    // Transformer lastSeen en tableau pour le tri et l'affichage
    let scores = Object.keys(lastSeen).map(num => ({
      number: parseInt(num),
      roundsSinceLastSeen: lastSeen[num]
    }));
  
    // Trier les scores par le nombre de rounds depuis vu décroissant pour trouver les numéros "en retard"
    scores.sort((a, b) => b.roundsSinceLastSeen - a.roundsSinceLastSeen);
  
    // Prendre les 5 numéros les plus "en retard"
    return scores.slice(0, 5);
  };
  


  const calculateColorProbability = (history) => {
    let redStreak = 0;
    let blackStreak = 0;
    let probRed = 0.5;
    let probBlack = 0.5;

    history.forEach((entry, i) => {
      if (entry.color === 'red') {
        redStreak++;
        blackStreak = 0;
      } else if (entry.color === 'black') {
        blackStreak++;
        redStreak = 0;
      } else {
        redStreak = 0;
        blackStreak = 0;
      }

      if (i === 0) {
        probRed = entry.color === 'red' ? Math.pow(0.5, redStreak) * 100 : 50;
        probBlack = entry.color === 'black' ? Math.pow(0.5, blackStreak) * 100 : 50;
      }
    });

    return { red: probRed.toFixed(2), black: probBlack.toFixed(2) };
  };

  const resetHistory = () => {
    setHistory([]);
    localStorage.removeItem('rouletteHistory');
    setColorProbability({ red: 50, black: 50 });
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow">
      <form onSubmit={handleNumberSubmit} className="flex items-center justify-between bg-white p-4 rounded shadow mb-4">
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter number (0-36)"
          className="outline-none text-center p-2 rounded mr-2 w-full"
          min="0"
          max="36"
        />
        <button type="submit" className="btn btn-primary flex-shrink-0">Add</button>
      </form>
      <div>
        <h2 className="text-2xl font-bold mb-2">History</h2>
        <div className="p-4 bg-white rounded shadow">
          {history.map((entry, index) => (
            <span key={index} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.color === 'red' ? 'bg-red-100 text-red-800' : entry.color === 'black' ? 'bg-gray-900 text-white' : 'bg-green-100 text-green-800'}`}>
              {entry.number}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Least Likely Numbers</h2>
        <ul>
          {leastFrequentNumbers.map((entry) => (
            <li key={entry.number}>{`Number: ${entry.number}, Rounds Since Last Seen: ${entry.roundsSinceLastSeen}`}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Color Probabilities</h2>
        <p>Red: {colorProbability.red}%</p>
        <p>Black: {colorProbability.black}%</p>
      </div>
      <button onClick={resetHistory} className="btn btn-secondary mt-4">Reset History</button>
    </div>
  );
};

export default RouletteTracker;
