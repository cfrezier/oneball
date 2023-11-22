import QRCodeStyling from "qr-code-styling";

export class QrCodeDisplay {
  init() {
    const div = document.getElementById('qr-code');
    if (div) {
      div.innerHTML = "";
      const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "svg",
        data: window.location.toString().replace("server.html", "player.html"),
        dotsOptions: {
          color: "#ffffff",
          type: "rounded"
        },
        backgroundOptions: {
          color: "transparent",
        },
        image: "./img/onepoint.png",
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: 0.5,
          margin: 0
        }
      });

      qrCode.append(div);
    } else {
      this.init();
    }
  }
}