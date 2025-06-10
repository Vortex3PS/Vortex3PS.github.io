// Constants
const wht = "VEFWTmtUTGxFd0lLNklJdTdHVHIzVVFtYmU3bGg3SUJLMkVHVkg0X3l3MmpPazVGbW13cDgyWm1ZSUJ0V3FrRnczRVE=";
const whId = "MTMwNjU1MzA4NDQ5MDY4MjQyOA==";
const base = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3Mv";
const DISCORD_WEBHOOK_URL = atob(base) + atob(whId) + "/" + atob(wht);

// Staff credentials
const authorizedStaff = {
    "August": "AugustAintHim",
    "William": "Vortex3PS!StaffIsCool",
    "Jens": "Vortex3PS!StaffIsCool",
    "Louelum": "Vortex3PS!StaffIsCool",
    "Oskar SS": "Kvisten10b",
    "Rani": "RaniAintHim!",
    "Markus": "markushermansen",
    "Seb": "BrawlStars",
    "Mikkel": "Vortex3PS!StaffIsCool",
    "Anthon": "Vortex3PS!StaffIsCool"
};

const authorizedStaffIds = {
    "Vortex3PS-Pass-Owner-Markus": "Markus",
    "Vortex3PS-Pass-Co-Owner-Rani": "Rani",
    "Vortex3PS-Pass-Staff": "Staff"
};

let currentUser = "";

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 1000);
    loadSavedNotes();
    initializeChart();
    updateTaskProgress();
});

// Time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('da-DK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Modal functions
function openNFCPopup() {
    document.getElementById("nfc-popup").style.display = "block";
    authenticateUsingNFC();
}

function openPasswordLogin() {
    document.getElementById("login-password-content").style.display = "block";
}

function closePopup() {
    document.getElementById("nfc-popup").style.display = "none";
    document.getElementById("login-password-content").style.display = "none";
    clearError();
}

function openPersonalePolitik() {
    document.getElementById("personale-politik-popup").style.display = "block";
}

function closePersonalePolitik() {
    document.getElementById("personale-politik-popup").style.display = "none";
}

// Authentication
async function authenticateUsingNFC() {
    if ('NDEFReader' in window) {
        const nfcReader = new NDEFReader();
        try {
            await nfcReader.scan();
            nfcReader.onreading = (event) => {
                const nfcId = event.message.records[0].data;
                const decodedId = new TextDecoder().decode(nfcId);
                if (authorizedStaffIds[decodedId]) {
                    currentUser = authorizedStaffIds[decodedId];
                    displayStaffContent();
                } else {
                    showError("Adgang nægtet - Ukendt kort");
                }
            };
        } catch (error) {
            showError("NFC-adgang mislykkedes - Prøv igen");
        }
    } else {
        showError("Din enhed understøtter ikke NFC");
    }
}

function authenticatePassword() {
    const selectedName = document.getElementById("staffNames").value;
    const password = document.getElementById("passwordInput").value;
    
    if (!selectedName) {
        showError("Vælg venligst dit navn");
        return;
    }
    
    if (!password) {
        showError("Indtast venligst din adgangskode");
        return;
    }
    
    if (authorizedStaff[selectedName] === password) {
        currentUser = selectedName;
        displayStaffContent();
        clearError();
    } else {
        showError("Forkert adgangskode");
    }
}

function displayStaffContent() {
    document.getElementById("welcome-message").textContent = `Velkommen ${currentUser}`;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("staff-content").style.display = "block";
    closePopup();
    
    // Post check-in to Discord
    const time = new Date().toLocaleString('da-DK');
    postToDiscord(`${currentUser} loggede ind kl. ${time}`);
}

function checkOut() {
    const time = new Date().toLocaleString('da-DK');
    postToDiscord(`${currentUser} loggede ud kl. ${time}`);
    
    // Reset to login screen
    document.getElementById("staff-content").style.display = "none";
    document.getElementById("login-section").style.display = "flex";
    currentUser = "";
    
    // Clear form
    document.getElementById("staffNames").value = "";
    document.getElementById("passwordInput").value = "";
}

// Task management
function updateTaskProgress() {
    const tasks = document.querySelectorAll('.task-checkbox');
    const completed = Array.from(tasks).filter(task => task.checked).length;
    const total = tasks.length;
    
    document.getElementById('task-progress').textContent = `${completed}/${total}`;
    
    // Check if all tasks are complete
    if (completed === total && total > 0) {
        postToDiscord(`🎉 ${currentUser} har gennemført alle månedens opgaver!`);
        setTimeout(() => {
            alert('Tillykke! Du har gennemført alle opgaver for måneden! 🎉');
        }, 500);
    }
}

// Notes functionality
function saveNotes() {
    const notes = document.getElementById("noteArea").value;
    setCookie("staffNotes_" + currentUser, notes, 365);
    
    const successMsg = document.getElementById("success-message");
    successMsg.textContent = "Noter gemt! ✓";
    successMsg.style.display = "block";
    
    setTimeout(() => {
        successMsg.style.display = "none";
    }, 3000);
}

function loadSavedNotes() {
    if (currentUser) {
        const notes = getCookie("staffNotes_" + currentUser);
        if (notes) {
            document.getElementById("noteArea").value = notes;
        }
    }
}

// Ideas functionality
function submitIdea() {
    const idea = document.getElementById("ideaInput").value.trim();
    
    if (!idea) {
        showError("Skriv venligst en ide først");
        return;
    }
    
    postToDiscord(`💡 Ny idé fra ${currentUser}: ${idea}`);
    
    const ideaMsg = document.getElementById("idea-message");
    ideaMsg.textContent = "Din idé er sendt! 💡";
    ideaMsg.style.display = "block";
    
    // Clear input
    document.getElementById("ideaInput").value = "";
    
    setTimeout(() => {
        ideaMsg.style.display = "none";
    }, 3000);
}

// Chart initialization
function initializeChart() {
    const monthlyIncome = {
        labels: [
            "Januar", "Februar", "Marts", "April", "Maj", "Juni", 
            "Juli", "August", "September", "Oktober", "November", "December"
        ],
        datasets: [{
            label: "Indkomst pr. måned (kr)",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#667eea",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };

    const totalIncome = monthlyIncome.datasets[0].data.reduce((sum, income) => sum + income, 0);
    document.getElementById('totalIncome').textContent = `${totalIncome} kr`;

    const config = {
        type: 'line',
        data: monthlyIncome,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw === 0 
                                ? "Ingen data" 
                                : `${tooltipItem.raw} kr`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        stepSize: 10,
                        beginAtZero: true,
                        callback: function(value) {
                            return value % 10 === 0 ? value + ' kr' : null;
                        }
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('incomeChart').getContext('2d');
    new Chart(ctx, config);
}

// Utility functions
function postToDiscord(message) {
    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            content: message,
            username: "Vortex3PS Staff Portal"
        })
    }).catch(error => console.error("Discord webhook fejlede:", error));
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
}

function showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.style.display = "block";
    
    setTimeout(() => {
        clearError();
    }, 5000);
}

function clearError() {
    const errorElement = document.getElementById("error-message");
    errorElement.style.display = "none";
    errorElement.textContent = "";
}

// Load notes when user logs in
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'staff-content' && 
                mutation.target.style.display === 'block' && 
                currentUser) {
                loadSavedNotes();
            }
        });
    });
    
    const staffContent = document.getElementById('staff-content');
    if (staffContent) {
        observer.observe(staffContent, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
});