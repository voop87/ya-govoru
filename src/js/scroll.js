const anchors = document.querySelectorAll('a[href*="#"]');

for (let anchor of anchors) {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();

		const blockID = anchor.getAttribute("href").substr(1);

		document.getElementById(blockID).scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	});
}

const scrollBtn = document.querySelector(".scroll-to-top");

function scrollTop() {
	window.scrollTo({ top: 0, behavior: "smooth" });
	scrollBtn.classList.remove("show");
}

function windowScrollListener() {
	if (window.scrollY > 500) {
		scrollBtn.classList.add("show");
	} else {
		scrollBtn.classList.remove("show");
	}
}

window.addEventListener("scroll", windowScrollListener);

scrollBtn.addEventListener("click", scrollTop);
