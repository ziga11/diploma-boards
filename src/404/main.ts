const backBtn = document.querySelector("btn-secondary") as HTMLAnchorElement;

backBtn.addEventListener("click", () => {
        history.replaceState(null, '', '/404.html');
        window.location.href = '/404.html';
});
