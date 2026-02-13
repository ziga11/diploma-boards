export const boardElements = {
	profilePic: document.getElementById("profile-pic") as HTMLDivElement,
	userBoards: document.querySelector("#user-boards") as HTMLHeadingElement,
	boardList: document.querySelector(".board-list") as HTMLDivElement,
	addBoard: document.querySelector("#trigger-add-board") as HTMLButtonElement,
}

export const modalElements = {
	colorPicker: document.getElementById('board-color-picker') as HTMLInputElement,
	hexInput: document.getElementById('color-hex-input') as HTMLInputElement,

	presetButtons: document.querySelectorAll('.preset-color') as NodeListOf<HTMLButtonElement>,

	boardName: document.getElementById("new-board-name") as HTMLInputElement,
	addBoard: document.getElementById("trigger-add-board") as HTMLButtonElement,
}
