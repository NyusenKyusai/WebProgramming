let socket = io();
let divs = [];

socket.on("css", function (data) {
  console.log(data);

  for (let i = 0; i < data.length; i++) {
    let css = data[i];
    let div = divs[i];

    if (!div) {
      $("body").append("<div id='id" + i + "'>");

      div = divs[i] = $("#id" + i);
    }

    div.css(css.css);
  }
});
