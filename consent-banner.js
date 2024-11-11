// Funktion til at sende data til Discord
function sendToDiscord(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1305621852294479963/c0ETq1wiqHluSw8EZ4MiyyMp5DucXbKWKUOcxfM6et0GI5OvMxhLraeVaf1llVxib1oe';
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    });
}

// Vis samtykkebanner
function showConsentBanner() {
    const banner = document.createElement("div");
    banner.innerHTML = `
        <div id="consent-banner" style="position:fixed;bottom:10px;width:100%;background:#000;color:#fff;padding:10px;text-align:center;">
            Vi bruger cookies til at forbedre din oplevelse. <button onclick="acceptConsent()">Accepter</button>
        </div>
    `;
    document.body.appendChild(banner);
}

// Håndter samtykke
function acceptConsent() {
    document.getElementById("consent-banner").style.display = "none";
    localStorage.setItem("consent", "true"); // Gem samtykke
    sendToDiscord("Bruger har accepteret tracking: Accepteret"); // Log samtykke
}

// Track sidebesøg
function trackPageVisit() {
    const pageName = window.location.pathname.split("/").pop(); // Få sidens navn fra URL
    
    if (localStorage.getItem("consent")) { // Sørg for at brugeren har givet samtykke
        const visitData = {
            page: window.location.href,
            pageName: pageName,
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
            action: "Sidebesøg"
        };
        sendToDiscord(JSON.stringify(visitData)); // Send data til Discord
    }
}

// Initialiser banner, hvis samtykke ikke er givet
if (!localStorage.getItem("consent")) {
    showConsentBanner();
} else {
    trackPageVisit();
}
