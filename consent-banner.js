// Function to send formatted data to Discord
function sendToDiscord(visitData) {
    const webhookUrl = 'https://discord.com/api/webhooks/1305621852294479963/c0ETq1wiqHluSw8EZ4MiyyMp5DucXbKWKUOcxfM6et0GI5OvMxhLraeVaf1llVxib1oe';

    const formattedMessage = `**Page Visit Detected**\n
- **Page URL**: ${visitData.page}
- **Page Name**: ${visitData.pageName || "N/A"}
- **Timestamp**: ${visitData.timestamp}
- **Device**: ${visitData.device}
- **Action**: ${visitData.action}`;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formattedMessage })
    });
}

// Display consent banner styled by styles.css
function showConsentBanner() {
    const banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.innerHTML = `
        <strong>Vi bruger cookies</strong> til at forbedre din oplevelse. 
        Ved at bruge vores site accepterer du vores brug af cookies.
        <button onclick="acceptConsent()">Accepter</button>
    `;
    document.body.appendChild(banner);
}

// Handle consent acceptance
function acceptConsent() {
    document.getElementById("consent-banner").style.display = "none";
    localStorage.setItem("consent", "true");
    sendToDiscord({
        page: window.location.href,
        pageName: "Consent Accepted",
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        action: "Consent Given"
    });

    // Prompt to reload the page
    const reload = confirm("For at sikre at samtykke træder i kraft, skal du opdatere siden. Vil du opdatere nu?");
    if (reload) {
        location.reload();
    }
}

// Track page visit
function trackPageVisit() {
    const pageName = window.location.pathname.split("/").pop();
    
    if (localStorage.getItem("consent")) {
        const visitData = {
            page: window.location.href,
            pageName: pageName,
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
            action: "Sidebesøg"
        };
        sendToDiscord(visitData);
    }
}

// Initialize banner if consent hasn't been given
if (!localStorage.getItem("consent")) {
    showConsentBanner();
} else {
    trackPageVisit();
}
