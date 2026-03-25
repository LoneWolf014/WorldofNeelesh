// +-------------------+
// | SITE NOTICE POPUP |
// +-------------------+
const siteNotice      = document.getElementById("siteNotice");
const siteNoticeClose = document.getElementById("siteNoticeClose");
const siteNoticeBtn   = document.getElementById("siteNoticeBtn");

function dismissNotice() {
    siteNotice.classList.add("hidden");
}

siteNoticeClose.addEventListener("click", dismissNotice);
siteNoticeBtn.addEventListener("click", dismissNotice);

// Also close if user clicks the dark backdrop
siteNotice.addEventListener("click", (e) => {
    if (e.target === siteNotice) dismissNotice();
});