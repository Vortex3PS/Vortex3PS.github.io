// Function to fetch IP address using an external service
async function getUserIP() {
    try {
        const response = await fetch('https://ipinfo.io/json?token=YOUR_TOKEN_HERE');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Failed to fetch IP address:", error);
        return "Unavailable";
    }
}

// Function to send data to Discord with a 3-second delay per user
async function sendToDiscord(visitData) {
    const webhookUrl = 'https://discord.com/api/webhooks/1305621852294479963/c0ETq1wiqHluSw8EZ4MiyyMp5DucXbKWKUOcxfM6et0GI5OvMxhLraeVaf1llVxib1oe';

    // Check the last message timestamp
    const lastMessageTime = localStorage.getItem("lastMessageTime");
    const currentTime = Date.now();

    // If 3 seconds haven't passed since the last message, do not send
    if (lastMessageTime && (currentTime - lastMessageTime) < 3000) return;

    // Update the last message timestamp
    localStorage.setItem("lastMessageTime", currentTime);

    // Fetch user IP
    const userIP = await getUserIP();
    
    // Format message for Discord with IP address
    const formattedMessage = `**Page Visit Detected**\n
- **Page URL**: ${visitData.page}
- **Page Name**: ${visitData.pageName || "N/A"}
- **Timestamp**: ${visitData.timestamp}
- **Device**: ${visitData.device}
- **IP Address**: ${userIP}
- **Action**: ${visitData.action}`;

    // Send message to Discord
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
        Læs mere i vores <a href="privacy-policy.html" target="_blank">Privatlivspolitik</a>. 
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