import { initializeApp } from '../init';
import { initColorPick, initToolbar, populateBoards } from './utils';

const initialized = await initializeApp();
if (initialized) {
	populateBoards();
	initToolbar();
	initColorPick();
}
