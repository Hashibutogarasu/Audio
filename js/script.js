var canvas1 = document.getElementById('canvas1');
var canvas2 = document.getElementById('canvas2');
var ctx1 = canvas1.getContext('2d') ;
var ctx2 = canvas2.getContext('2d') ;
var frequency = document.getElementById( 'frequency' ) ;
var scale = document.getElementById('scale') ;
 
ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
ctx2.clearRect(0, 0, canvas2.width, canvas2.height);   
 
ctx1.lineWidth = ctx2.lineWidth =  1;
ctx1.strokeStyle = ctx2.strokeStyle = 'rgb(0, 0, 255)';
 
ctx1.fillStyle = ctx2.fillStyle = 'rgb(255, 255, 255)';
 
var audioCtx;
var audioSourceNode;      
var analyserNode;
var data1,data2;
 
var audioEle;
 
var firstflg = true;

var hztext = "";
var bom;
var blob;

var hz = [
    29.135,
    30.868,
    32.703,
    34.648,
    36.708,
    38.891,
    41.203,
    43.654,
    46.249,
    48.999,
    51.913,
    58.27,
    61.735,
    65.406,
    69.296,
    73.416,
    77.782,
    82.407,
    87.307,
    92.499,
    97.999,
    103.826,
    116.541,
    123.471,
    130.813,
    138.591,
    146.832,
    155.563,
    164.814,
    174.614,
    184.997,
    195.998,
    207.652,
    233.082,
    246.942,
    261.626,
    277.183,
    293.665,
    311.127,
    329.628,
    349.228,
    369.994,
    391.995,
    415.305,
    466.164,
    493.883,
    523.251,
    554.365,
    587.33,
    622.254,
    659.255,
    698.456,
    739.989,
    783.991,
    830.609,
    932.328,
    987.767,
    1046.502,
    1108.731,
    1174.659,
    1244.508,
    1318.51,
    1396.913,
    1479.978,
    1567.982,
    1661.219,
    1864.655,
    1975.533,
    2093.005,
    2217.461,
    2349.318,
    2489.016,
    2637.02,
    2793.826,
    2959.955,
    3135.963,
    3322.438,
    3729.31,
    3951.066,
    4186.009
];

var text_code = document.getElementById('text_code');

function play(){

    hztext = "";
   
    try{    
        if(firstflg){
        // AudioContextの生成
        audioCtx =  new AudioContext(); 
        firstflg = false;  
    }
      
    if(audioEle){
        audioEle.pause();
    }
    
    audioEle = new Audio();    
    
    if (document.getElementById("m1").checked) audioEle.src = './audio/crazy_cooking.mp3';
    if (document.getElementById("m2").checked) audioEle.src = './audio/The Odd Man.mp3';
    if (document.getElementById("m3").checked) audioEle.src = './audio/waveform_spectrum_sine.mp3';
    if (document.getElementById("m4").checked) audioEle.src = './audio/waveform_spectrum_triangle.mp3';
    if (document.getElementById("m5").checked) audioEle.src = './audio/waveform_spectrum_square.mp3';
    if (document.getElementById("m6").checked) audioEle.src = './audio/waveform_spectrum_sawtooth.mp3';
    if (document.getElementById("m7").checked) audioEle.src = './audio/nc43641.wav';
    if (document.getElementById("m8").checked) audioEle.src = document.getElementById('m7_text').value;
    
    audioEle.autoplay = true;
    audioEle.preload = 'auto';
    
    // MediaElementAudioSourceNodeの生成
    if(audioSourceNode){
        audioSourceNode.disconnect();
    }
    audioSourceNode = audioCtx.createMediaElementSource(audioEle);
    
    // AnalyserNodeの生成 
    // ※音声の時間と周波数を解析する
    if(analyserNode){
        analyserNode.disconnect();
    }
    analyserNode = audioCtx.createAnalyser();
    
    // FFT(高速フーリエ変換)においての周波数領域
    analyserNode.fftSize = 256;
       
    data1 = new Uint8Array(analyserNode.fftSize);
    data2 = new Uint8Array(analyserNode.fftSize / 4);
 
    // オーディオノードの設定
    audioSourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    
    draw();

    hztext = hztext.slice(1);
    hztext = hztext.slice(hztext.length);

  }catch(e){
    alert(e);
  }
} 
 
function draw() {
    
    requestAnimationFrame(draw);
  
    // TimeDomain(波形データ)
    analyserNode.getByteTimeDomainData(data1);  
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    
    ctx1.strokeStyle = 'rgb(0, 0, 255)';
    ctx1.beginPath();
    ctx1.moveTo(0, data1[0]);
    for(var i = 0; i < data1.length; i++) {
        ctx1.lineTo(i, data1[i]);
    }
    ctx1.stroke();

    ctx1.strokeStyle = 'rgb(255, 0, 0)';  
    ctx1.beginPath();
        ctx1.moveTo(0, 127);
        ctx1.lineTo(256, 127);
    ctx1.stroke();

    // Frequency(周波数スペクトル)
    analyserNode.getByteFrequencyData(data2);
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

    // 周波数を簡易的に表示する
    ctx2.beginPath();
    ctx2.moveTo(0,  255 - data2[0]);
    for(var i = 0; i < data2.length; i++) {
        ctx2.lineTo(i*4, 255 - data2[i]);
        
        frequency.innerHTML = data1[i];

        scale.innerHTML = hz.indexOf(getClosestNum(data1[i],hz));
        hztext += data1[i] + ",";
    }
    ctx2.stroke();
};


function getClosestNum(num, ar){
   //近似値を保持しておく変数
   var closest;
   //配列かどうか、要素があるか判定
   if(Object.prototype.toString.call(ar) ==='[object Array]' && ar.length>0){
     //まず配列の最初の要素を近似値として保持する
     closest = ar[0];
     //配列の要素を順次比較していく
     for(var i=0;i<ar.length;i++){ 
        //この時点での近似値と、指定値の差異を絶対値で保持しておく
        var closestDiff = Math.abs(num - closest);
        //読み込んだ値と比較し、差異を絶対値で保持しておく
        var currentDiff = Math.abs(num - ar[i]);
        //新しく比較した値のほうが近かったら、近似値として保持しておく
        if(currentDiff < closestDiff){
            closest = ar[i];
        }
      }
     //ループが終わったら、近似値を返す
      return closest;
    }
 //配列じゃなかったらfalse
 return false;
}

 
function stop(){  
  audioEle.pause();
}

function generate_code(evt){

  const blob = new Blob([hztext], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.download = 'audio.txt';
  a.href = url;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}