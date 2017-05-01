var level;

window.onload = () => {
    var page1 = document.getElementsByClassName("page1")[0];
    var page2 = document.getElementsByClassName("page2")[0];
    var menu = document.getElementsByClassName("menu")[0];

    var levels = document.getElementsByClassName("level-list")[0].children;

    page1.addEventListener('click', function() {
        page1.setAttribute('class', 'slide-out');
        page2.setAttribute('class', 'slide-out');
    });

    for(var levelLi of levels){
        levelLi.addEventListener('click', function() {
            level = this.children[0].innerText;
            game.state.start('Game');
            menu.style.display = "none";
        })
    }
}

