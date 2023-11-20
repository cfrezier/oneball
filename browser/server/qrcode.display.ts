import QRCodeStyling from "qr-code-styling";

export class QrCodeDisplay {
  init() {
    const canvas = document.getElementById('qr-code');
    if (canvas) {
      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        type: "svg",
        data: window.location.toString().replace("server.html", "/player.html"),
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

      qrCode.append(canvas);
    } else {
      this.init();
    }
  }
}