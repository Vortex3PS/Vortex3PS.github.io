// Function to generate a UUID (universally unique identifier)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to fetch IP address using an alternative service (ipify)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Failed to fetch IP address:", error);
        return "Unavailable";
    }
}

// Function to fetch geolocation data using an alternative service (ipwhois)
async function getGeoLocation(ip) {
    try {
        const response = await fetch(`https://ipwho.is/${ip}`);
        const data = await response.json();
        return data.success ? `${data.city}, ${data.country}` : "Location Unavailable";
    } catch (error) {
        console.error("Failed to fetch geolocation:", error);
        return "Location Unavailable";
    }
}

// Function to send data to Discord with a 3-second delay per user
async function sendToDiscord(visitData) {
    const webhookUrl = 'https://discord.com/api/webhooks/1331696915993329684/A7Uf6-TOryJ7YcU94bMg0LwpEkjbpJXb1AdUbvivj6sBtwE2wnuQvCHUnWYBjLCK0zTl';

    const lastMessageTime = localStorage.getItem("lastMessageTime");
    const currentTime = Date.now();

    if (lastMessageTime && (currentTime - lastMessageTime) < 3000) return;

    localStorage.setItem("lastMessageTime", currentTime);

    const userIP = await getUserIP();
    const userLocation = await getGeoLocation(userIP);

    const formattedMessage = `**Page Visit Detected**\n
- **Page URL**: ${visitData.page}
- **Page Name**: ${visitData.pageName || "Index"}
- **Timestamp**: ${visitData.timestamp}
- **Device**: ${visitData.device}
- **IP Address**: ${userIP}
- **Location**: ${userLocation}
- **UUID**: ${visitData.uuid}
- **Action**: ${visitData.action}`;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formattedMessage })
    })
    .then(response => {
        if (!response.ok) {
            console.error("Failed to send message to Discord:", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error sending message to Discord:", error);
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

    location.reload();
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
