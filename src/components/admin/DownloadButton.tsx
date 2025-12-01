// src/components/admin/DownloadButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/services/exporter";
import { Loader2, Download } from "lucide-react";

type Props = {
  label: string;
  action: () => Promise<{ filename: string; mime?: string; content: string | Uint8Array }>;
};

export function DownloadButton({ label, action }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const res = await action();
      downloadFile(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
