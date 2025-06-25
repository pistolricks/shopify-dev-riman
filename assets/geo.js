function start() {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            position => {
                console.log("position: ", position);
            },
            error => {
                console.log("error: ", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 6000
            }
        );
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    start();
});
