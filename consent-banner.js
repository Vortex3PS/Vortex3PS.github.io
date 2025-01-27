// Function to generate a UUID (universally unique identifier)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
    // Base64 encoded webhook URL
    const encodedWebhookUrl = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTMwNTYyMTg1MjI5NDQ3OTk2My9jMEVUcTF3aXFIbHVTdzhFWjRNaXl5TXA1RHVjWGJLV0tVT2N4Zk02ZXQwR0k1T3ZNeGhMcmFlVmFmMWxsVnhpYjFvZQ==';

    // Decode the Base64 encoded webhook URL
    const webhookUrl = atob(encodedWebhookUrl);

    // Check the last message timestamp
    const lastMessageTime = localStorage.getItem("lastMessageTime");
    const currentTime = Date.now();

    // If 3 seconds haven't passed since the last message, do not send
    if (lastMessageTime && (currentTime - lastMessageTime) < 3000) return;

    // Update the last message timestamp
    localStorage.setItem("lastMessageTime", currentTime);

    // Fetch user IP
    const userIP = await getUserIP();

    // Format message for Discord with IP address and UUID
    const formattedMessage = `**Page Visit Detected**\n
- **Page URL**: ${visitData.page}
- **Page Name**: ${visitData.pageName || "Index"}
- **Timestamp**: ${visitData.timestamp}
- **Device**: ${visitData.device}
- **IP Address**: ${userIP}
- **UUID**: ${visitData.uuid}
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
        <img src="https://github.com/Vortex3PS/Vortex3PS.github.io/blob/main/cookie.png?raw=true" />
        <button onclick="acceptConsent()">Accepter</button>
    `;
    document.body.appendChild(banner);
}

// Handle consent acceptance
function acceptConsent() {
    document.getElementById("consent-banner").style.display = "none";
    localStorage.setItem("consent", "true");

    // Generate a UUID and store it in localStorage
    const uuid = generateUUID();
    localStorage.setItem("uuid", uuid);

    sendToDiscord({
        page: window.location.href,
        pageName: "Consent Accepted",
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        uuid: uuid,
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
    const uuid = localStorage.getItem("uuid");
    
    if (localStorage.getItem("consent") && uuid) {
        const visitData = {
            page: window.location.href,
            pageName: pageName,
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
            uuid: uuid,
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
