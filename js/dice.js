// Dice Farmer - Dice Animation

function animateDiceRoll(results, callback) {
  const container = document.getElementById('roll-results-display');
  container.innerHTML = '';

  // Create dice elements with rolling animation
  results.forEach((result, index) => {
    const cropData = CROPS[result.cropType];

    const resultEl = document.createElement('div');
    resultEl.className = 'die-result';

    const dieFace = document.createElement('div');
    dieFace.className = 'die-face rolling';
    dieFace.innerHTML = `
      <span class="crop-icon">${cropData.emoji}</span>
      <span class="roll-value">?</span>
    `;

    const label = document.createElement('div');
    label.className = 'die-result-label';
    label.textContent = cropData.name;

    resultEl.appendChild(dieFace);
    resultEl.appendChild(label);
    container.appendChild(resultEl);

    // Stagger the roll completion
    setTimeout(() => {
      dieFace.classList.remove('rolling');
      dieFace.querySelector('.roll-value').textContent = result.value;
      label.textContent = `${result.value} to place`;

      // Add a little bounce effect
      dieFace.style.transform = 'scale(1.1)';
      setTimeout(() => {
        dieFace.style.transform = 'scale(1)';
      }, 150);

    }, 500 + (index * 200));
  });

  // Call callback after all dice have finished
  const totalTime = 500 + (results.length * 200) + 300;
  setTimeout(() => {
    if (callback) callback();
  }, totalTime);
}

// More elaborate roll animation (optional enhancement)
function animateDiceRollFancy(results, callback) {
  const container = document.getElementById('roll-results-display');
  container.innerHTML = '';

  results.forEach((result, index) => {
    const cropData = CROPS[result.cropType];

    const resultEl = document.createElement('div');
    resultEl.className = 'die-result';

    const dieFace = document.createElement('div');
    dieFace.className = 'die-face';
    dieFace.innerHTML = `
      <span class="crop-icon">${cropData.emoji}</span>
      <span class="roll-value">?</span>
    `;

    const label = document.createElement('div');
    label.className = 'die-result-label';
    label.textContent = cropData.name;

    resultEl.appendChild(dieFace);
    resultEl.appendChild(label);
    container.appendChild(resultEl);

    // Animate through random numbers
    let rollCount = 0;
    const maxRolls = 10 + Math.floor(Math.random() * 5);
    const rollInterval = setInterval(() => {
      const randomVal = Math.floor(Math.random() * 6) + 1;
      dieFace.querySelector('.roll-value').textContent = randomVal;

      // Spin effect
      dieFace.style.transform = `rotate(${rollCount * 36}deg)`;

      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);

        // Show final value
        dieFace.style.transform = 'rotate(0deg)';
        dieFace.querySelector('.roll-value').textContent = result.value;
        label.textContent = `${result.value} to place`;

        // Bounce effect
        dieFace.style.animation = 'none';
        dieFace.offsetHeight; // Trigger reflow
        dieFace.style.transform = 'scale(1.2)';
        setTimeout(() => {
          dieFace.style.transform = 'scale(1)';
        }, 150);
      }
    }, 50);
  });

  // Call callback after all dice have finished
  const totalTime = 1000 + (results.length * 100);
  setTimeout(() => {
    if (callback) callback();
  }, totalTime);
}
