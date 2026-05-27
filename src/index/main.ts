import { initializeApp } from '../init';
import { fillApiKeys, fillNotifications, populateBoards, setToolbar } from './utils';
import { renderEndpoints } from './api-docs';
import './events';

document.addEventListener("DOMContentLoaded", async () => {
        const initialized = await initializeApp();
        if (!initialized) return;

        setToolbar();
        fillApiKeys();
        populateBoards();
        fillNotifications();
        renderEndpoints('boards');
});
