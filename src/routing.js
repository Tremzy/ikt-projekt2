document.addEventListener("DOMContentLoaded", () => {
    const navbarlist = document.getElementById("nbl");
    let navitems = navbarlist.querySelectorAll(".nav-link");

    if (window.location.href.split("/").at(-1).replaceAll("#", "") == "") {
        history.pushState({ ref:"index.html" }, "", "index.html");
    }


    navitems.forEach(item => {
        if (item.getAttribute("href") === window.location.href.split("/").slice(-2).join("/")) {
            item.setAttribute("aria-current", "page");
            item.classList.add("active");
        }
        item.addEventListener("click", event => {
            event.preventDefault();
            console.log(item.getAttribute("href"))
            routePage(item.getAttribute("href"));
        });
    });

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.ref) {
            routePage("src/"+event.state.ref, false);
        }
    });
});

function getCookie(index) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        if (decodeURIComponent(cookie).split("=")[0] === index) {
            return decodeURIComponent(cookie.split("=")[1]);
        }
    }
    return false;
}

function setCookie(index, val) {
    const expiration = new Date(Date.now() + 3600 * 1000).toUTCString();
    const cookie = `${encodeURIComponent(index)}=${encodeURIComponent(val)}; expires=${expiration}`;
    document.cookie = cookie;
}

function routePage(ref, pushHistory = true) {
    console.log(`Routing to: ${ref}`);
    fetch("../"+ref)
        .then(res => {
            if (!res.ok) throw new Error("Page not found or inaccessible");
            return res.text();
        })
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const newLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        const newHref = "../" + ref.split("/").slice(0, -1).join("/") + "/style.css";
        let existing = document.getElementById("dynamic-style");

        if (existing) {
            existing.setAttribute("href", newHref);
        }
        else {
            const styleLink = document.createElement("link");
            styleLink.id = "dynamic-style";
            styleLink.rel = "stylesheet";
            styleLink.href = newHref;
            document.head.appendChild(styleLink);
            const currentLinks = document.querySelectorAll('link[rel="stylesheet"]');
            currentLinks.forEach(cLink => {
                const currentLinkHref = cLink.getAttribute("href");
                if (currentLinkHref == "style.css") {
                    cLink.rel = "alternate stylesheet";
                }
            })
        }

        let remoteHtml = doc.getElementById("app").innerHTML;
        document.getElementById("app").innerHTML = remoteHtml;

        if (pushHistory) {
            history.pushState({ ref: "../"+ref }, "", "../"+ref);
        }

        updateActiveNavbar("../"+ref);
    })
        .catch(err => {
            console.error(err);
            document.getElementById("app").innerHTML = "<h1>404 - Page not found</h1>";
            //alert("Page not found");
        });
}

function updateActiveNavbar(ref) {
    const navbarlist = document.getElementById("nbl");
    let navitems = navbarlist.querySelectorAll(".nav-link");

    navitems.forEach(item => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
        
        if (item.getAttribute("href") === window.location.href.split("/").slice(-2).join("/")) {
            item.setAttribute("aria-current", "page");
            item.classList.add("active");
        }
    });
}
