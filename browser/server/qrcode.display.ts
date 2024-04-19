import QRCode from 'qrcode';

export class QrCodeDisplay {
  init() {
    const div = document.getElementById('qr-code');
    if (div) {
      div.innerHTML = "";
      const url = window.location.toString().replace("server", "player");
      QRCode.toDataURL(url)
        .then(dataUrl => {
          const img = document.createElement('img');
          div.append(img);
          img.src = dataUrl;
          img.height = 250;
          img.width = 250;
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      this.init();
    }
  }
}