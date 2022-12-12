var r = new Array(1000);

for (var i = 0; i < 1000; i++) {
  // u = Math.random(); //0 ~ 1
  // v = Math.random(); //0 ~ 1
  r[i] = Math.sqrt(-2*Math.log(Math.random())) * Math.cos(2*Math.PI*Math.random());
};
