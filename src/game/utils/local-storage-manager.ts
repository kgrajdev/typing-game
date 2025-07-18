// utils/local-storage-manager.ts
export default class LocalStorageManager {
    private key: string;
    private hostURL: string;
    
    constructor() {
        this.key = 'wordrush_game_state';
        this.hostURL = window.location.hostname;
    }

    save(state: any) {
        const json = JSON.stringify(state);

        // Check if we are running on localhost
        const isDev = this.hostURL === 'localhost';

        const dataToStore = isDev ? json : btoa(json); // Only encode if not localhost
        localStorage.setItem(this.key, dataToStore);
    }

    load() {
        const rawData = localStorage.getItem(this.key);
        if (!rawData) return null;

        const isDev = window.location.hostname === 'localhost';

        try {
            const json = isDev ? rawData : atob(rawData); // Only decode if not localhost
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to decode or parse saved data:', e);
            return null;
        }
    }

    hardReset() {
        const rawData = localStorage.getItem(this.key);
        if (!rawData) return null;

        try {
            localStorage.removeItem(this.key);
        } catch (e) {
            console.error('Failed to decode or parse saved data:', e);
            return null;
        }

    }
    
    isLocalStorageAvailable(){
        let localStorageTest = 'simple test for local storage access';
        try {
            localStorage.setItem('word-rush-game-local-storage-test', localStorageTest);
            localStorage.removeItem('word-rush-game-local-storage-test');
            return true;
        } catch(e) {
            console.error('Local Storage Access Needed');
            alert('Access to Local Storage is needed for the game.');
            return false;
        }
    }
}
