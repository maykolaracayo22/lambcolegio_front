import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Check, AlertTriangle } from "lucide-react";

interface DocumentUploaderProps {
  tipoDocumento: string;
  onUploadComplete: (url: string) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export function DocumentUploader({ 
  tipoDocumento, 
  onUploadComplete, 
  maxSize = 5, 
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] 
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Use: ${allowedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo excede el tamaño máximo de ${maxSize}MB`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Simular progreso de carga
      const simulateProgress = () => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      };
      const progressInterval = setInterval(simulateProgress, 500);

      // TODO: Implementar carga real al servidor
      const uploadPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          clearInterval(progressInterval);
          setProgress(100);
          resolve('https://ejemplo.com/ruta-al-archivo');
        }, 3000);
      });

      const url = await uploadPromise;
      onUploadComplete(url);
      
    } catch (err) {
      setError('Error al subir el archivo. Intente nuevamente.');
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{tipoDocumento}</span>
        <span className="text-xs text-muted-foreground">
          Max: {maxSize}MB
        </span>
      </div>

      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        {!uploading ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <Button asChild variant="ghost">
                <label>
                  Seleccionar Archivo
                  <input
                    type="file"
                    className="hidden"
                    accept={allowedTypes.join(',')}
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {allowedTypes.join(', ')}
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Subiendo archivo... {progress}%
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {progress === 100 && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Archivo subido exitosamente
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}