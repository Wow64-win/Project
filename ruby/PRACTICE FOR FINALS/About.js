
/*** MOBILE NAVBAR ***/

const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navbar-menu");

menu.addEventListener("click", function() {
    menuLinks.classList.toggle("open");
});


/*** CLOSE MENU AFTER CLICKING A LINK ***/

document.querySelectorAll(".navbar-links, .navbar-btn a").forEach(link => {

    link.addEventListener("click", function() {
        menuLinks.classList.remove("open");
    });

});


/*** CHARACTER ROTATION ***/

const characters = document.querySelectorAll(".character");

characters.forEach(character => {

    const image = character.querySelector("img");

    let rotationY = 0;
    let rotationX = 0;

    let startX = 0;
    let startY = 0;

    let dragging = false;


    function updateRotation() {

        image.style.transform =
            `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;

    }


    character.addEventListener("pointerdown", function(e) {

        dragging = true;

        startX = e.clientX;
        startY = e.clientY;

        character.setPointerCapture(e.pointerId);

    });


    character.addEventListener("pointermove", function(e) {

        if (!dragging) return;

        let moveX = e.clientX - startX;
        let moveY = e.clientY - startY;

        rotationY += moveX * 0.8;
        rotationX -= moveY * 0.3;

        rotationX = Math.max(-20, Math.min(20, rotationX));

        startX = e.clientX;
        startY = e.clientY;

        updateRotation();

    });


    character.addEventListener("pointerup", function() {

        dragging = false;

    });


    character.addEventListener("pointercancel", function() {

        dragging = false;

    });

});


/*** MOUSE FOLLOWING SPOTLIGHT ***/

const hero = document.querySelector(".hero");

hero.addEventListener("mousemove", function(e) {

    const rect = hero.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hero.style.setProperty("--mouse-x", `${x}px`);
    hero.style.setProperty("--mouse-y", `${y}px`);

});


/*** RESET SPOTLIGHT ***/

hero.addEventListener("mouseleave", function() {

    hero.style.setProperty("--mouse-x", "50%");
    hero.style.setProperty("--mouse-y", "50%");

});
