import QRCodeStyling from "qr-code-styling";

export class QrCodeDisplay {
  _qrCodeDiv?: HTMLDivElement;
  url: string = "";
  qrCode?: QRCodeStyling;

  constructor() {
    this.url = window.location.toString().replace("server", "player");
  }

  getQrCodeDiv() {
    if (!this._qrCodeDiv) {
      this._qrCodeDiv = window.document.body.querySelector(".qr-code") ?? undefined;
      this.qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "svg",
        data: this.url,
        dotsOptions: {
          color: "#ffffff",
          type: "rounded"
        },
        backgroundOptions: {
          color: "#000000",
        },
        /*
        image: "./img/onepoint.png",
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: 0.5,
          margin: 0
        }
        */
      });
    }
    return this._qrCodeDiv!;
  }

  init() {
    const div = this.getQrCodeDiv();
    if (div) {
      div.innerHTML = "";
      this.qrCode!.append(div);
    } else {
      setTimeout(() => {
        this.init();
      }, 100);
    }
  }
}