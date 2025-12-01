import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Info } from 'lucide-react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// PaymentQR: genera un QR real (dataURL) para que el usuario lo escanee con la app del banco.
export default function PaymentQR({ bank, amount, reference, emv = true }: { bank: string; amount: number; reference: string; emv?: boolean }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // Construye payload EMV (simplificado) y calcula CRC16-CCITT (False)
  const buildEMV = ({ amount, reference, merchantName = bank, merchantCity = 'LA PAZ', country = 'BO', currency = '068' }:
    { amount: number; reference: string; merchantName?: string; merchantCity?: string; country?: string; currency?: string }) => {
    const tlv = (id: string, value: string) => {
      const len = value.length.toString().padStart(2, '0');
      return `${id}${len}${value}`;
    };

    // 26 Merchant Account Information - subfield 00 (GUI) + 01 (account)
    const gui = tlv('00', 'UNION.BO'); // identificador genérico — adaptar según especificación del banco
    const acct = tlv('01', reference);
    const merchantAccount = tlv('26', gui + acct);

    const payload = [] as string[];
    payload.push(tlv('00', '01')); // Payload Format Indicator
    payload.push(tlv('01', '12')); // Point of Initiation Method (12 = dynamic)
    payload.push(merchantAccount);
    payload.push(tlv('52', '0000')); // Merchant Category Code (0000 = not specified)
    payload.push(tlv('53', currency)); // Currency (numeric ISO 4217)
    payload.push(tlv('54', amount.toFixed(2))); // Amount
    payload.push(tlv('58', country));
    payload.push(tlv('59', merchantName));
    payload.push(tlv('60', merchantCity));
    // Additional data field template (62) - use subfield 05 for reference
    const additional = tlv('05', reference);
    payload.push(tlv('62', additional));

    // Concatenate and add CRC placeholder
    const withoutCrc = payload.join('') + '6304';
    const crc = crc16(withoutCrc).toUpperCase();
    return withoutCrc + crc;
  };

  // CRC16-CCITT (False) implementation
  const crc16 = (input: string) => {
    const buf = new TextEncoder().encode(input);
    let crc = 0xFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= (buf[i] << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        else crc = (crc << 1) & 0xFFFF;
      }
    }
    return crc.toString(16).padStart(4, '0');
  };

  useEffect(() => {
    let mounted = true;
    const payload = emv ? buildEMV({ amount, reference, merchantName: bank }) : `bank=${bank};amount=${amount};ref=${reference}`;
    QRCode.toDataURL(payload, { width: 300, margin: 2 })
      .then(url => { if (mounted) setQrDataUrl(url); })
      .catch(() => { if (mounted) setQrDataUrl(null); });
    return () => { mounted = false; };
  }, [emv, amount, reference, bank]);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      alert('Referencia copiada al portapapeles');
    } catch (e) {
      alert('No se pudo copiar. Por favor, copia manualmente: ' + reference);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return alert('QR no listo');
    fetch(qrDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr_${reference}.png`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Error al descargar el QR'));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-48 h-48 bg-white rounded-md shadow flex items-center justify-center">
        {qrDataUrl ? (
          // Imagen real del QR
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={qrDataUrl} alt={`QR de pago ${bank} Bs ${amount}`} width={180} height={180} />
        ) : (
          <div className="text-sm text-muted-foreground">Generando QR…</div>
        )}
      </div>

      <div className="text-center text-sm">
        <div className="font-medium">{bank} — Bs {amount}</div>
        <div className="text-muted-foreground">Ref: {reference}</div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={copyReference}>
          <Copy className="mr-2 h-4 w-4" /> Copiar referencia
        </Button>
        <Button variant="outline" size="sm" onClick={downloadQR}>
          <Download className="mr-2 h-4 w-4" /> Descargar QR
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Info className="mr-2 h-4 w-4" /> Cómo pagar
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Puedes escanear el QR con la app del banco (Banco Unión) o abrirlo en tu celular y usar la opción de pago.
      </div>

      {/* Dialog con instrucciones paso a paso para padres */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cómo pagar con QR</DialogTitle>
            <DialogDescription>
              Sigue estos pasos desde tu celular o desde la app del banco para realizar el pago de forma segura.
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
            <li>Abrir la app del Banco Unión en tu celular.</li>
            <li>Ir a la opción de "Pagar" o "Escanear QR".</li>
            <li>Apuntar la cámara al código QR mostrado en pantalla.</li>
            <li>Verificar que el monto sea Bs {amount} y la referencia {reference}.</li>
            <li>Confirmar el pago siguiendo las instrucciones de la app.</li>
            <li>Guarda o captura el comprobante y, si lo deseas, comparte al colegio por WhatsApp.</li>
          </ol>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
