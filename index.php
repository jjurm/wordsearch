<!DOCTYPE html>
<html>
  <head>

    <title>Osmičky</title>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="osemsmerovky,generator,osemsmeroviek,wordsearch,crossword,crosswords,datanius">
    <meta name="description" content="Generujte vlastné osemsmerovky pre žiakov alebo len pre zábavu.">
    <meta name="robots" content="all,noarchive">
    <meta name="author" content="Datanius.com">

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:600&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
    <link href="assets/reset.css" rel="stylesheet" type="text/css">
    <style type="text/css">
    body {
      background: url(assets/images/bg.png) no-repeat;
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      background-size: cover;
      font-family: 'Open Sans', sans-serif, Arial;
      font-weight: 600;
      font-size: 14px;
      color: #313131;
      text-shadow: 1px 1px 0 #FFF;
    }
    * {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }
    h2 {
      font-size: 20px;
      margin-left: 10px;
    }
    input, .input {
      background: url(assets/images/bg_input.png) repeat-x;
      border: none;
      border-radius: 5px;
      outline: 0;
      width: 100%;
      height: 46px;
      font-family: 'Open Sans', sans-serif, Arial;
      font-size: 20px;
      color: #FFF;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
      padding: 10px;
      margin-top: 8px;
      position: relative;
      display: block;
    }
    .input {
      font-size: 24px !important;
    }
    .input.number .up, .input.number .down {
      background: url(assets/images/sprites_01.png) no-repeat;
      display: block;
      text-indent: -10000em;
      position: absolute;
      width: 20px;
      height: 20px;
    }
    .input.number .up {
      background-position: -383px -65px;
      top: 2px;
      right: 2px;
    }
    .input.number .down {
      background-position: -403px -65px;
      bottom: 2px;
      right: 2px;
    }
    .input.number.repeat {
      width: 175px;
    }
    .input.number.size {
      width: 80px;
    }
    ::-webkit-input-placeholder {
      color: #D6D6D6;
    }
    :-moz-placeholder {
      color: #D6D6D6;
    }
    ::-moz-placeholder {
      color: #D6D6D6;
    }
    :-ms-input-placeholder {
      color: #D6D6D6;
    }
    .yesno {
      background: url(assets/images/sprites_01.png) -383px -86px no-repeat;
      width: 175px;
      height: 46px;
      margin-top: 10px;
      cursor: pointer;
    }
    .yesno.no {
      background-position: -383px -132px;
    }
    .smery {
      width: 70px;
      height: 70px;
      margin: 10px auto;
    }
    .smery a {
      background: url(assets/images/sprites_01.png) -424px -66px no-repeat;
      margin: 2px;
      display: block;
      float: left;
      width: 19px;
      height: 19px;
    }
    .smery a.push {
      background: url(assets/images/sprites_01.png) -443px -66px no-repeat;
    }
    .generate {
      background: url(assets/images/sprites_01.png) 0 0 no-repeat;
      display: block;
      text-indent: -10000em;
      width: 383px;
      height: 67px;
    }
    .generate:hover {
      background-position: 0 -67px;
    }
    .generate:hover:active {
      background-position: 0 -134px;
    }
    hr, .separator {
      margin: 10px;
      margin-bottom: 5px;
      border: none;
      border-bottom: 1px solid #343434;
      box-shadow: 1px 1px 0 0 rgba(255, 255, 255, 0.5);
    }
    .separator {
      width: 1px;
      height: 100px;
      vertical-align: middle;
      display: inline-block;
      border-right: 1px solid #343434;
      margin-left: 5px;
      margin-right: 0;
    }
    .half {
      width: 180px;
      display: inline-block;
      vertical-align: middle;
    }
    #slovnik {
      position: relative;
    }
    #slovnik input {
      padding-right: 50px;
    }
    #slovnik .add {
      background: url(assets/images/sprites_01.png) -385px 0 no-repeat;
      display: block;
      position: absolute;
      width: 37px;
      height: 37px;
      top: 5px;
      right: 5px;
    }
    #slovnik .add:hover {
      background-position: -426px 0;
    }
    #slovnik .add:hover:active {
      background-position: -466px 0;
    }
    #slovacont {
      margin-top: 5px;
      height: 340px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 5px;
      padding: 5px;
    }
    #slova {
      height: 100%;
      padding-right: 5px;
      list-style: none;
      overflow-y: auto;
    }
    #slova li {
      position: relative;
      background: url(assets/images/bg_item.png) repeat-x;
      width: 100%;
      height: 40px;
      border-radius: 5px;
      font-size: 20px;
      padding: 10px;
      margin-bottom: 5px;
    }
    #slova li span {
      overflow: hidden;
      width: 310px;
    }
    #slova li a {
      background: url(assets/images/sprites_01.png) -470px -43px no-repeat;
      display: block;
      position: absolute;
      width: 28px;
      height: 28px;
      top: 6px;
      right: 6px;
    }
    #slova li a:hover {
      background-position: -498px -43px;
    }
    #slova li a:hover:active {
      background-position: -526px -43px;
    }
    #slova::-webkit-scrollbar {
      width: 10px;
    }
    #slova::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
    }
    #slova::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 10px;
    }
    header {
      background: url(assets/images/header.png) no-repeat;
      width: 1000px;
      height: 400px;
      margin: auto;
    }
    section {
      width: 100%;
      margin-top: -90px;
    }
    section .stripe {
      background: url(assets/images/bg_mainsection.png) repeat-x;
      height: 80px;
    }
    section .bottomneed {
      background: rgba(255, 255, 255, 0.55);
      width: 100%;
    }
    section .maincontainer {
      width: 800px;
      overflow: hidden;
      margin: auto;
    }
    section .inside {
      width: 1600px;
      padding-bottom: 220px;
      overflow: hidden;
    }
    section .main {
      background: url(assets/images/bg_main.png) 50% 0 no-repeat;
      padding-bottom: 50px;
    }
    section .main, .generated {
      width: 800px;
      float: left;
    }
    section .main span.left {
      padding-left: 10px;
    }
    section .main span.bigger {
      font-size: 16px;
    }
    section .main .panel {
      padding: 8px;
      width: 400px;
      display: inline-block;
    }
    .back {
      background: url(assets/images/sprites_01.png) 0 -224px no-repeat;
      display: block;
      float: left;
      width: 83px;
      height: 360px;
      opacity: 0.7;
    }
    .back:hover {
      opacity: 1;
    }
    #ws table {
      border-collapse: collapse;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    #ws table, #ws table td {
      border: 2px ridge #777;
    }
    #ws table td {
      text-align: center;
      vertical-align: middle;
      height: 30px;
      width: 30px;
    }
    </style>

    <script type="text/javascript" src="assets/jquery.min.js"></script>
    <script type="text/javascript" src="control.js"></script>
    <script type="text/javascript">
      /*var js=document.createElement("script");
      js.type="text/javascript";
      js.src="http://code.jquery.com/jquery.min.js";
      document.getElementsByTagName("head")[0].appendChild(js);
      var refs = new Object();
      $("table.z tr").each(function() {
        var m = $(this);
        var f = $(this).find("td.ID-dimension-data-0 .ID-item").html();
        if(f !== undefined) {
          if(f.indexOf("/?ref=") >= 0) {
            var n = parseInt(m.find(".ID-metric-data-1").html().replace(/&nbsp;/i, ""));
            var r = f.split("?ref=")[1];
            var rn = parseInt(refs[r]);
            if(isNaN(rn)) rn = 0;
            refs[r] = rn + n;
          }
        }
      });*/
      function finished(output) {
        $("#generating").hide();
        $("#ws").show();
        $("#ws table").remove();
        $("#ws").prepend('<table />');
        var t = $("#ws table");
        var p = output.p;
        for (var i = 0; i < p[0].length; i++) {
          t.append('<tr />');
          for (var i2 = 0; i2 < p.length; i2++) {
            t.find("tr:last").append('<td>'+p[i2][i]+'</td>');
          }
        }
        $("#usedw").html(output.words.used.join(", "));
      }
      $(function() {
        $(".input.number").each(function() {
          var me = $(this);
          me.append("<span>" + me.attr("value") + "</span><a href=\"#\" class=\"up\">up</a><a href=\"#\" class=\"down\">dw</a>");
          me.find("a.up, a.down").bind("mousedown mouseup click", numberEvent);
        });
        var intv = null;
            tmou = null;
        function numberEvent(e) {
          var btn = $(this);
          var prnt = btn.closest(".input");
          if(e.type == "mousedown") {
            if(!intv) {
              tmou = setTimeout(function() {
                pridajuber(prnt, btn.hasClass("up"));
                intv = setInterval(function() {
                  if(tmou != null)
                    pridajuber(prnt, btn.hasClass("up"));
                }, 150);
              }, 200);
            }
          }else if(e.type == "mouseup") {
            if(!intv) pridajuber(prnt, btn.hasClass("up"))
            clearTimeout(tmou);
            tmou = null;
            clearInterval(intv);
            intv = null;
          }
        }
        function pridajuber(prnt, up) {
          var now = parseInt(prnt.attr("value"));
          if(up && now < prnt.attr("max")) prnt.attr("value", now + 1);
          else if(!up && now > prnt.attr("min")) prnt.attr("value", now - 1);
          prnt.find("span").html(prnt.attr("value"));
        }

        $(".yesno").click(function(e) {
          if(!$(this).hasClass("no")) $(this).addClass("no");
          else $(this).removeClass("no");
        });

        var smery = {SZ: -45, S: 0, SV: 45, Z: -90, V: 90, JZ: -135, J: -180, JV: 135};
        $(".smery a").each(function() {
          var smer = $(this);
          if(smer.attr("data-smer") != "NO") {
            smer.addClass("push").click(clicksmer).find("img").css("transform", "rotate(" + smery[smer.attr("data-smer")] + "deg)");
          }
        });
        function clicksmer(e) {
          if(!$(this).hasClass("push")) $(this).addClass("push");
          else $(this).removeClass("push");
        }

        $(".generate, .osmicka").click(function() {
          $("#generating").show();
          $("#ws").hide();
          var dirs = []; //$(".smery a.push[data-smer!=NO]").map(function(a,b){return $(b).attr("smer")})
          var words = [];
          $(".smery a.push[data-smer!=NO]").each(function(){
            dirs.push(parseInt($(this).attr("smer"), 10));
          });
          $("#slova li span").each(function(){
            words.push($(this).html());
          });
          var settings = {
            "clue": [true, $("#clue").val()],
            "words_count": $(".input.repeat span").html(),
            "prevent_full_overlay": !$(".yesno").is(".no"),
            "allowed_directions": dirs,
            "size": [$(".input.size span").eq(0).html(), $(".input.size span").eq(1).html()],
            "words": words
          };
          $(".main").animate({"margin-left": "-100%"}, 1000);
          WordSearch.start(settings);
        });

        $(".back").click(function() {
          $(".main").animate({"margin-left": 0}, 1000);
        });

        $("#word").keydown(function(e) {
          if(e.keyCode == 13) addword();
        });

        $("#slovnik .add").click(addword);
        function addword() {
          var word = $("#word").val().trim();
          if(word.length) {
            $("#slova").prepend("<li><span>" + word + "</span><a href=\"#\"></a></li>");
            $("#word").val("").focus();
          }
        }

        $("#slova li a").live("click", removeword);
        function removeword(e) {
          $(this).parent().remove();
        }

        $("a[href='#']").live("click", function(e) {
          e.preventDefault();
        });
      });
    </script>
  </head>

  <body>
    <header></header>
    <section>
      <div class="stripe"></div>
      <div class="bottomneed">
        <div class="maincontainer">
          <div class="inside">

            <div class="main">
              <div class="panel">
                <h2>Riešenie osemsmerovky:</h2>
                  <input type="text" id="clue" placeholder="tajnička" autofocus>
                <hr>
                <div class="half" style="margin-top: 15px;">
                  <span class="left">Počet opakovaní slova:</span>
                  <div class="input number repeat" value="1" min="1" max="999"></div>
                </div>
                <div class="separator"></div>
                <div class="half" style="margin-left: 10px;">
                  <span>Zabrániť prekrývaniu celých slov:</span>
                  <div class="yesno"></div>
                </div>
                <hr>
                <div class="half">
                  <span class="left">Smery generovania slov:</span>
                  <div class="smery">
                    <a href="#" smer="7" data-smer="SZ"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="0" data-smer="S"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="1" data-smer="SV"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="6" data-smer="Z"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" onclick="return false;" data-smer="NO"></a>
                    <a href="#" smer="2" data-smer="V"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="5" data-smer="JZ"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="4" data-smer="J"><img src="assets/images/smer.png" alt="" /></a>
                    <a href="#" smer="3" data-smer="JV"><img src="assets/images/smer.png" alt="" /></a>
                  </div>
                </div>
                <div class="separator"></div>
                <div class="half" style="margin-left: 10px;">
                  <span>Rozmery osemsmerovky:</span>
                  <br>
                  <div style="display: inline-block; margin-top: 10px;">
                    <span class="bigger">Stĺpce:</span>
                    <div class="input number size" value="10" min="3" max="40"></div>
                  </div>
                  <div style="display: inline-block; margin-left: 10px;">
                    <span class="bigger">Riadky:</span>
                    <div class="input number size" value="10" min="3" max="40"></div>
                  </div>
                </div>
                <hr>
                <a href="#" class="generate">Generovať</a>
              </div>

              <div class="separator" style="height: 380px; vertical-align: top; margin-top: 40px; margin-left: -5px;"></div>

              <div class="panel" style="margin-left: -5px; vertical-align: top;">
                <h2>Slovník:</h2>
                <div id="slovnik">
                  <input type="text" id="word" placeholder="Zadajte slovo do osemsmerovky" autocomplete="off">
                  <a href="#" class="add"></a>
                  <div id="slovacont">
                    <ul id="slova"></ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="generated">
              <a href="#" class="back"></a>
              <h2>Vygenerovaná osemsmerovka:</h2>
              <div id="generating" style="padding-left:120px; padding-top:50px;">
                <image src="assets/images/loader.gif" /><br><br>
                Generuje sa osemsmerovka, prosím čakajte...
              </div>
              <div id="ws" style="padding-left:120px; padding-top:50px;font-size:1.2em;">
                <!-- Table -->
                Použité slová:<br>
                <div id="usedw"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  </body>
</html>