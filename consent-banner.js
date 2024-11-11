// Function to send data to Discord with cleaner formatting
function sendToDiscord(visitData) {
    const webhookUrl = 'https://discord.com/api/webhooks/1305621852294479963/c0ETq1wiqHluSw8EZ4MiyyMp5DucXbKWKUOcxfM6et0GI5OvMxhLraeVaf1llVxib1oe';
    
    const formattedMessage = `
**Page Visit Detected**
• **Page URL**: ${visitData.page}
• **Page Name**: ${visitData.pageName || "N/A"}
• **Timestamp**: ${visitData.timestamp}
• **Device**: ${visitData.device}
• **Action**: ${visitData.action}
    `;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formattedMessage })
    });
}

// Display consent banner with enhanced CSS
function showConsentBanner() {
    const banner = document.createElement("div");
    banner.innerHTML = `
        <div id="consent-banner" style="position:fixed;bottom:10px;width:100%;background-color: #2f3136;color:white;padding:15px;text-align:center;font-family: Arial, sans-serif;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);border-radius: 8px;z-index: 9999;">
            <strong>Vi bruger cookies</strong> til at forbedre din oplevelse. <span style="font-size: 14px; margin-top: 10px;">Ved at bruge vores site accepterer du vores brug af cookies.</span>
            <br><br>
            <button onclick="acceptConsent()" style="background-color: #28a745;color:white;border:none;padding:10px 20px;font-size:16px;border-radius:5px;cursor:pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);">Accepter</button>
        </div>
    `;
    document.body.appendChild(banner);
}

// Handle consent acceptance
function acceptConsent() {
    document.getElementById("consent-banner").style.display = "none";
    localStorage.setItem("consent", "true"); // Save consent status
    sendToDiscord({
        page: window.location.href,
        pageName: "Consent Accepted",
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        action: "Consent Given"
    }); // Log consent

    // Show prompt to reload the page
    const reload = confirm("For at sikre at samtykke træder i kraft, skal du opdatere siden. Vil du opdatere nu?");
    if (reload) {
        location.reload(); // Reload the page if user confirms
    }
}

// Track page visit
function trackPageVisit() {
    const pageName = window.location.pathname.split("/").pop(); // Get page name from URL
    
    if (localStorage.getItem("consent")) { // Ensure user consent before sending data
        const visitData = {
            page: window.location.href,
            pageName: pageName,
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
            action: "Sidebesøg"
        };
        sendToDiscord(visitData); // Send page visit data to Discord
    }
}

// Initialize banner if consent hasn't been given
if (!localStorage.getItem("consent")) {
    showConsentBanner();
} else {
    trackPageVisit();
}
