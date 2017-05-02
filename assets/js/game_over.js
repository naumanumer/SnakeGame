var Game_Over = {
    create : function() {
        var menu = document.getElementsByClassName("menu")[0];
        var over = document.getElementsByClassName("over")[0];
        var scopeSpan = document.getElementById("score");


        menu.style.display = "block";
        over.style.display = "block";
        scopeSpan.innerText = score;

    }
};