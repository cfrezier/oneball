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
        image: "./img/onepoint.png",
        dotsOptions: {
          color: "#ffffff",
          type: "rounded"
        },
        backgroundOptions: {
          color: "transparent",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 20
        }
      });

      qrCode.append(div);
    } else {
      this.init();
    }
  }
}