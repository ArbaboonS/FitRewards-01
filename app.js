document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    const googleFitButton = document.getElementById("google-fit-button");
    const syncButton = document.getElementById("sync-button");
    const earnButton = document.getElementById("earn-button");
    const saveAddressButton = document.getElementById("save-address-button");

    // Screen Elements
    const welcomeScreen = document.getElementById("welcome-screen");
    const googleFitScreen = document.getElementById("google-fit-screen");
    const statsScreen = document.getElementById("stats-screen");
    const walletScreen = document.getElementById("wallet-screen");
    const activityDataElem = document.getElementById("activity-data");

    // Hide all screens
    function hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    }

    // Show specific screen
    function showScreen(screen) {
        hideAllScreens();
        screen.classList.remove('hidden');
        screen.classList.add('visible');
    }

    // Initial Screen
    showScreen(welcomeScreen);

    startButton.addEventListener("click", () => {
        showScreen(googleFitScreen);
    });

    googleFitButton.addEventListener("click", handleGoogleFitLogin);

    syncButton.addEventListener("click", () => {
        fetchActivityData().then(updateActivityData);
    });

    earnButton.addEventListener("click", () => {
        // Here you would handle converting activity data to tokens
        showScreen(walletScreen);
    });

    saveAddressButton.addEventListener("click", saveWalletAddress);

    // Google Fit Login Handler
    function handleGoogleFitLogin() {
        // Implement Google Fit OAuth2.0 login and permissions request
        gapi.load('client:auth2', initGoogleFitClient);
    }

    function initGoogleFitClient() {
        gapi.client.init({
            apiKey: 'YOUR_API_KEY', // Replace with your actual API Key if needed
            clientId: '207424655934-368peeuhgbblfsq4eircn1pmb7q74fhr.apps.googleusercontent.com',
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"],
            scope: "https://www.googleapis.com/auth/fitness.activity.read"
        }).then(() => {
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                fetchActivityData().then(updateActivityData);
                showScreen(statsScreen);
            } else {
                gapi.auth2.getAuthInstance().signIn().then(() => {
                    fetchActivityData().then(updateActivityData);
                    showScreen(statsScreen);
                });
            }
        });
    }

    function fetchActivityData() {
        return gapi.client.fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                "aggregateBy": [{
                    "dataTypeName": "com.google.step_count.delta",
                    "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                }],
                "bucketByTime": { "durationMillis": 86400000 }, // 1 day
                "startTimeMillis": 0,
                "endTimeMillis": Date.now()
            }
        }).then(response => {
            const steps = response.result.bucket[0].dataset[0].point[0].value[0].intVal;
            return { steps };
        });
    }

    function updateActivityData(data) {
        activityDataElem.innerText = `Steps: ${data.steps}`;
    }

    function saveWalletAddress() {
        const walletAddress = document.getElementById("wallet-address").value;
        if (isValidWalletAddress(walletAddress)) {
            // Save wallet address for future transactions
            localStorage.setItem('walletAddress', walletAddress);
            alert('Wallet address saved successfully!');
        } else {
            alert('Invalid wallet address!');
        }
    }

    function isValidWalletAddress(address) {
        // Perform basic validation of wallet address
        return typeof address === 'string' && address.length >= 20;
    }
});
