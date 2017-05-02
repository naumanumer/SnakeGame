var level;

window.onload = () => {
    var page1 = document.getElementsByClassName("page1")[0];
    var page2 = document.getElementsByClassName("page2")[0];
    var menu = document.getElementsByClassName("menu")[0];
    var over = document.getElementsByClassName("over")[0];

    var levels = document.getElementsByClassName("level-list")[0].children;

    page1.addEventListener('click', function() {
        page1.setAttribute('class', 'slide-out');
        page2.setAttribute('class', 'slide-out');
        setTimeout(() => {
            page2.style.top = "0";
            page1.style.display = "none";
        }, 500)
    });

    for (var levelLi of levels) {
        levelLi.addEventListener('click', function() {
            level = this.children[0].innerText;
            game.state.start('Game');
            page2.style.display = "none";
            menu.style.display = "none";
        })
    }

    over.addEventListener('click', function() {
        this.style.display = "none";
        page2.style.display = "block";
    })
}