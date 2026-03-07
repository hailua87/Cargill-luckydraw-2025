// --- State Management ---
let players = JSON.parse(localStorage.getItem('lucky_wheel_players')) || [];
let prizes = JSON.parse(localStorage.getItem('lucky_wheel_prizes')) || [];
let winners = JSON.parse(localStorage.getItem('lucky_wheel_winners')) || [];

// Save state to Local Storage
function saveState() {
    localStorage.setItem('lucky_wheel_players', JSON.stringify(players));
    localStorage.setItem('lucky_wheel_prizes', JSON.stringify(prizes));
    localStorage.setItem('lucky_wheel_winners', JSON.stringify(winners));
    updateUI();
}

// Generate an array of pleasant colors
const sliceColors = [
    '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93',
    '#f15bb5', '#00bbf9', '#00f5d4', '#fb5607', '#ff006e',
    '#3a86ff', '#8338ec', '#ffbe0b', '#2ec4b6', '#e71d36'
];

// --- DOM Elements ---
const spinBtn = document.getElementById('spin-btn');
const tabs = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

const prizeSelectionList = document.getElementById('prize-selection-list');
const animationDisplay = document.getElementById('animation-display');

// Inputs and Lists
const playersInput = document.getElementById('players-input');
const importPlayersBtn = document.getElementById('import-players-btn');
const fileUpload = document.getElementById('file-upload');
const playersList = document.getElementById('players-list');
const playersCount = document.getElementById('players-count');

const prizeNameInput = document.getElementById('prize-name');
const prizeQtyInput = document.getElementById('prize-qty');
const addPrizeBtn = document.getElementById('add-prize-btn');
const prizesList = document.getElementById('prizes-list');
const prizesCount = document.getElementById('prizes-count');

const winnersTbody = document.getElementById('winners-tbody');
const clearWinnersBtn = document.getElementById('clear-winners-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');

const winnerModal = document.getElementById('winner-modal');
const winnerNameEl = document.getElementById('winner-name');
const winnerPrizeEl = document.getElementById('winner-prize');
const closeModalBtn = document.getElementById('close-modal-btn');

// --- Tab Navigation ---
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// --- Players Management ---
importPlayersBtn.addEventListener('click', () => {
    const text = playersInput.value;
    if (!text.trim()) return;

    // Split by comma or newline
    const newNames = text.split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const newPlayers = newNames.map(name => ({
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name,
        extraInfo: {},
        color: sliceColors[Math.floor(Math.random() * sliceColors.length)]
    }));

    players = [...players, ...newPlayers];
    playersInput.value = '';
    saveState();
});

if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                // XLSX is available from CDN
                const workbook = XLSX.read(data, { type: 'array' });
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON with headers
                const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (rawJson.length < 2) { 
                    alert("File không hợp lệ hoặc không có dữ liệu!");
                    return;
                }

                const headers = rawJson[0];
                const rows = rawJson.slice(1);
                
                const newPlayers = [];
                
                rows.forEach(row => {
                    if (!row || row.length === 0 || row[0] === undefined || String(row[0]).trim() === '') return;
                    
                    let extraInfo = {};
                    for (let i = 1; i < headers.length; i++) {
                        if (headers[i] && row[i] !== undefined && String(row[i]).trim() !== '') {
                            extraInfo[String(headers[i]).trim()] = String(row[i]).trim();
                        }
                    }

                    newPlayers.push({
                        id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: String(row[0]).trim(),
                        extraInfo: extraInfo,
                        color: sliceColors[Math.floor(Math.random() * sliceColors.length)]
                    });
                });
                
                players = [...players, ...newPlayers];
                saveState();
                fileUpload.value = ''; 
                alert(`Đã thêm ${newPlayers.length} người chơi từ file!`);
            } catch (err) {
                console.error(err);
                alert("Đã xảy ra lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.");
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

function deletePlayer(id) {
    players = players.filter(p => p.id !== id);
    saveState();
}

// --- Prizes Management ---
addPrizeBtn.addEventListener('click', () => {
    const name = prizeNameInput.value.trim();
    const quantity = parseInt(prizeQtyInput.value);

    if (!name || quantity < 1) return;

    prizes.push({
        id: 'pr_' + Date.now(),
        name: name,
        quantity: quantity
    });

    prizeNameInput.value = '';
    prizeQtyInput.value = '1';
    saveState();
});

function deletePrize(id) {
    prizes = prizes.filter(p => p.id !== id);
    saveState();
}

// --- Winners Management ---
clearWinnersBtn.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn xóa LỊCH SỬ TRÚNG GIẢI?')) {
        winners = [];
        saveState();
    }
});

resetAllBtn.addEventListener('click', () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa toàn bộ người chơi, quà tặng và người trúng. Bạn có chắc chắn không?')) {
        players = [];
        prizes = [];
        winners = [];
        saveState();
    }
});

exportCsvBtn.addEventListener('click', () => {
    if (winners.length === 0) {
        alert("Chưa có danh sách trúng giải để xuất.");
        return;
    }

    // Prepare CSV header
    let allExtraKeys = new Set();
    winners.forEach(w => {
        if (w.playerExtraInfo) {
            Object.keys(w.playerExtraInfo).forEach(k => allExtraKeys.add(k));
        }
    });
    const extraKeysArray = Array.from(allExtraKeys);
    
    // Header row
    let csvHeader = ["Thời Gian", "Người Trúng", "Phần Quà"];
    if (extraKeysArray.length > 0) {
        csvHeader = csvHeader.concat(extraKeysArray);
    }
    let csvContent = csvHeader.join(",") + "\n";

    // Data rows
    winners.forEach(w => {
        let row = [
            `"${new Date(w.time).toLocaleString('vi-VN')}"`,
            `"${w.playerName.replace(/"/g, '""')}"`,
            `"${w.prizeName.replace(/"/g, '""')}"`
        ];
        
        extraKeysArray.forEach(k => {
            const val = (w.playerExtraInfo && w.playerExtraInfo[k]) !== undefined ? String(w.playerExtraInfo[k]) : "";
            row.push(`"${val.replace(/"/g, '""')}"`);
        });
        
        csvContent += row.join(",") + "\n";
    });

    // Add BOM for UTF-8 Excel compatibility
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_trung_thuong_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- Updating UI routines ---
function updateUI() {
    // Update Players
    playersCount.textContent = players.length;
    playersList.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        let extraText = '';
        if (p.extraInfo && Object.keys(p.extraInfo).length > 0) {
            extraText = Object.entries(p.extraInfo).map(([k, v]) => `${k}: ${v}`).join(' | ');
        }
        li.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                <span style="font-weight: 600;">${p.name}</span>
                ${extraText ? `<small style="color: var(--text-secondary); font-size: 0.85rem;">${extraText}</small>` : ''}
            </div>
            <button class="delete-btn" onclick="deletePlayer('${p.id}')">Xóa</button>
        `;
        playersList.appendChild(li);
    });

    // Update Prizes
    const totalPrizes = prizes.reduce((sum, p) => sum + p.quantity, 0);
    prizesCount.textContent = totalPrizes;
    prizesList.innerHTML = '';
    prizes.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${p.name}</strong> (x${p.quantity})</span>
            <button class="delete-btn" onclick="deletePrize('${p.id}')">Xóa</button>
        `;
        prizesList.appendChild(li);
    });

    // Update Winners Table
    winnersTbody.innerHTML = '';
    [...winners].reverse().forEach(w => {
        const tr = document.createElement('tr');
        
        let extraText = '';
        if (w.playerExtraInfo && Object.keys(w.playerExtraInfo).length > 0) {
            extraText = Object.entries(w.playerExtraInfo).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join('<br>');
        }
        
        tr.innerHTML = `
            <td>${new Date(w.time).toLocaleString('vi-VN')}</td>
            <td style="color: var(--success-color); font-weight: 600;">${w.playerName}</td>
            <td style="font-size: 0.9em; line-height: 1.4; color: var(--text-secondary);">${extraText || '-'}</td>
            <td style="color: #ffd166; font-weight: bold;">${w.prizeName}</td>
        `;
        winnersTbody.appendChild(tr);
    });

    renderPrizeSelection();
}

// --- Spin Screen Logic ---
let selectedPrizeId = null;
let isSpinning = false;

function renderPrizeSelection() {
    prizeSelectionList.innerHTML = '';
    
    if (prizes.length === 0) {
        prizeSelectionList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Chưa có quà, vui lòng thêm quà.</p>';
        return;
    }

    prizes.forEach(p => {
        const div = document.createElement('div');
        const isAvailable = p.quantity > 0;
        
        div.className = `prize-item ${isAvailable ? '' : 'inactive'} ${selectedPrizeId === p.id && isAvailable ? 'selected' : ''}`;
        
        div.innerHTML = `
            <span class="prize-name-lbl">${p.name}</span>
            <span class="prize-qty-lbl">x${p.quantity}</span>
        `;
        
        if (isAvailable) {
            div.addEventListener('click', () => {
                if (isSpinning) return;
                selectedPrizeId = p.id;
                renderPrizeSelection();
            });
        }
        
        prizeSelectionList.appendChild(div);
    });

    // Reset selection if currently selected prize becomes unavailable
    const selectedPrize = prizes.find(p => p.id === selectedPrizeId);
    if (!selectedPrize || selectedPrize.quantity <= 0) {
        selectedPrizeId = null;
        animationDisplay.innerHTML = '<span class="placeholder-text">SẴN SÀNG</span>';
    }
}

// Easing function for smooth stop
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

// Delay helper
const sleep = ms => new Promise(res => setTimeout(res, ms));

spinBtn.addEventListener('click', async () => {
    if (isSpinning) return;
    
    if (!selectedPrizeId) {
        alert('Vui lòng chọn 1 giải thưởng để quay!');
        return;
    }

    if (players.length === 0) {
        alert('Vui lòng thêm người chơi trước khi quay!');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    
    const selectedPrize = prizes.find(p => p.id === selectedPrizeId);
    const winTargetCount = Math.min(selectedPrize.quantity, players.length); // How many winners to pick

    // Disable selection clicks
    renderPrizeSelection();

    // 1. Phaze 1: Đang quay giải...
    animationDisplay.innerHTML = `<span class="animation-text" style="font-size: 2.5rem; text-align: center; display: block; line-height: 1.4;">Đang quay giải<br><span style="color: #ffd166; font-size: 3.5rem;">${selectedPrize.name}</span>...</span>`;
    await sleep(2000);

    // 2. Phaze 2: Countdown 3, 2, 1
    for (let i = 3; i > 0; i--) {
        animationDisplay.innerHTML = `<span class="animation-text" style="font-size: 5rem; color: #ffca3a;">${i}</span>`;
        await sleep(1000);
    }

    // 3. Phaze 3: Fast cycling
    const totalCycles = 40; // Number of names to flash
    const minDelay = 50;
    const maxDelay = 400;
    
    // Randomize final winners beforehand without replacement
    let availablePlayers = [...players];
    let finalWinners = [];
    for (let k = 0; k < winTargetCount; k++) {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        finalWinners.push(availablePlayers[randomIndex]);
        availablePlayers.splice(randomIndex, 1);
    }

    for (let i = 0; i < totalCycles; i++) {
        // Calculate delay with easing
        let progress = i / totalCycles;
        let ease = progress * progress * progress; 
        let currentDelay = minDelay + (maxDelay - minDelay) * ease;
        
        let displayHtml = '';
        
        // If it's the last cycle, show all final winners
        if (i === totalCycles - 1) {
            displayHtml = finalWinners.map(w => {
                const color = w.color || '#ffffff';
                return `<div style="font-size: ${finalWinners.length > 3 ? '2rem' : '3.5rem'}; color: ${color}; text-shadow: 0 0 10px ${color}80; margin: 0.5rem 0;">${w.name}</div>`;
            }).join('');
        } else {
            // Flash random names (just 1 or a few depends on winTargetCount)
            let flashNames = [];
            for (let k = 0; k < winTargetCount; k++) {
                const rPlayer = players[Math.floor(Math.random() * players.length)];
                flashNames.push(rPlayer);
            }
            displayHtml = flashNames.map(f => {
                const color = f.color || '#ffffff';
                return `<div style="font-size: ${winTargetCount > 3 ? '2rem' : '3.5rem'}; color: ${color}; text-shadow: 0 0 10px ${color}80; margin: 0.5rem 0;">${f.name}</div>`;
            }).join('');
        }

        animationDisplay.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">${displayHtml}</div>`;
        
        await sleep(currentDelay);
    }

    // Done spinning
    isSpinning = false;
    spinBtn.disabled = false;
    
    // Slight pause before modal to let user read the names
    await sleep(500);
    handleWin(finalWinners, selectedPrizeId);
});

function handleWin(winnerPlayers, prizeId) {
    const actualPrize = prizes.find(p => p.id === prizeId);
    if (!actualPrize) return;

    winnerPlayers.forEach(winnerPlayer => {
        // Modify prize quantity
        actualPrize.quantity -= 1;

        // Remove player from list
        players = players.filter(p => p.id !== winnerPlayer.id);

        // Add to winners list
        winners.push({
            playerId: winnerPlayer.id,
            playerName: winnerPlayer.name,
            playerExtraInfo: winnerPlayer.extraInfo || {},
            prizeId: actualPrize.id,
            prizeName: actualPrize.name,
            time: new Date().toISOString()
        });
    });

    saveState(); // also calls updateUI -> renderPrizeSelection

    // Show Celebration
    triggerConfetti();
    
    // Display list of names in modal
    winnerNameEl.innerHTML = winnerPlayers.map(w => `<div>${w.name}</div>`).join('');
    winnerPrizeEl.textContent = `${actualPrize.name} (x${winnerPlayers.length})`;
    
    winnerModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
    animationDisplay.innerHTML = '<span class="placeholder-text">SẴN SÀNG</span>';
    // Deselect if prize run out
    renderPrizeSelection(); 
});

function triggerConfetti() {
    var count = 200;
    var defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

// Initial Call
updateUI();
