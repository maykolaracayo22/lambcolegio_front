// src/components/RudeFormModal.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  User,
  Home,
  Heart,
  Users,
  Upload,
  FileText,
  Camera,
  Syringe,
  Receipt,
  University,
  MessageCircle,
  Shield,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  QrCode
} from "lucide-react";

interface RudeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1: Datos del Estudiante
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  tipoDocumento: string;
  numeroDocumento: string;
  complemento: string;
  fechaNacimiento: string;
  paisNacimiento: string;
  departamentoNacimiento: string;
  localidadNacimiento: string;
  sexo: string;
  nivelEducativo: string;
  grado: string;
  discapacidad: string;
  registroDiscapacidad: string;
  idiomaAprendizaje: string;
  autoidentificacion: string;
  
  // Step 2: Dirección
  departamento: string;
  provincia: string;
  municipio: string;
  localidad: string;
  zonaBarrio: string;
  direccion: string;
  numeroVivienda: string;
  telefonoFijo: string;
  celular: string;
  correo: string;
  aguaCaniaeria: string;
  tieneBano: string;
  energiaElectrica: string;
  servicioBasura: string;
  tipoVivienda: string;
  accesoInternet: string[];
  
  // Step 3: Documentos
  certificadoNacimiento: File | null;
  certificadoVacunas: File | null;
  fotografias: File | null;
  comprobantePago: File | null;
}

const RudeFormModal = ({ isOpen, onClose }: RudeFormModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombres: "",
    tipoDocumento: "",
    numeroDocumento: "",
    complemento: "",
    fechaNacimiento: "",
    paisNacimiento: "Bolivia",
    departamentoNacimiento: "",
    localidadNacimiento: "",
    sexo: "",
    nivelEducativo: "",
    grado: "",
    discapacidad: "",
    registroDiscapacidad: "",
    idiomaAprendizaje: "",
    autoidentificacion: "",
    
    // Step 2
    departamento: "",
    provincia: "",
    municipio: "",
    localidad: "",
    zonaBarrio: "",
    direccion: "",
    numeroVivienda: "",
    telefonoFijo: "",
    celular: "",
    correo: "",
    aguaCaniaeria: "",
    tieneBano: "",
    energiaElectrica: "",
    servicioBasura: "",
    tipoVivienda: "",
    accesoInternet: [],
    
    // Step 3
    certificadoNacimiento: null,
    certificadoVacunas: null,
    fotografias: null,
    comprobantePago: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Generar QR Code al cargar el componente
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = () => {
    // Crear un canvas para generar el QR
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Tamaño del QR
      canvas.width = 120;
      canvas.height = 120;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Patrón simple del QR (en una implementación real usarías una librería QR)
      ctx.fillStyle = '#000000';
      
      // Patrón de esquina superior izquierda
      ctx.fillRect(10, 10, 25, 25);
      ctx.clearRect(15, 15, 15, 15);
      
      // Patrón de esquina superior derecha
      ctx.fillRect(85, 10, 25, 25);
      ctx.clearRect(90, 15, 15, 15);
      
      // Patrón de esquina inferior izquierda
      ctx.fillRect(10, 85, 25, 25);
      ctx.clearRect(15, 90, 15, 15);
      
      // Algunos puntos adicionales
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(40 + i * 10, 40 + j * 10, 5, 5);
          }
        }
      }
      
      // Convertir a URL de datos
      setQrCodeUrl(canvas.toDataURL());
    }
  };

  // Descargar PDF RUDE
  const downloadRudePDF = () => {
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    
    // En una implementación real, esto apuntaría a tu archivo en la carpeta assets
    // Por ahora simulamos la descarga
    const pdfUrl = '/assets/rude.pdf'; // Ajusta esta ruta según tu estructura de carpetas
    
    link.href = pdfUrl;
    link.download = 'formulario_rude.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Si el archivo no existe, mostrar mensaje
    setTimeout(() => {
      // Esto es solo para simulación - en producción el archivo debería existir
      alert('Si el archivo no se descarga automáticamente, asegúrate de que el archivo rude.pdf esté en la carpeta public/assets/');
    }, 1000);
  };

  // Grados por nivel educativo
  const gradosPorNivel: { [key: string]: { value: string; label: string }[] } = {
    inicial: [
      { value: "prekinder", label: "Pre-Kinder (3 años)" },
      { value: "kinder1", label: "Kinder 1 (4 años)" },
      { value: "kinder2", label: "Kinder 2 (5 años)" },
    ],
    primaria: Array.from({ length: 6 }, (_, i) => ({
      value: `primaria${i + 1}`,
      label: `${i + 1}° de Primaria`,
    })),
    secundaria: Array.from({ length: 6 }, (_, i) => ({
      value: `secundaria${i + 1}`,
      label: `${i + 1}° de Secundaria`,
    })),
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejo de archivos
  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Navegación entre pasos
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Envío del formulario
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Formulario enviado:", formData);
      alert("¡Preinscripción enviada correctamente! Recibirás una confirmación por WhatsApp.");
      onClose();
      
      // Resetear formulario
      setFormData({
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombres: "",
        tipoDocumento: "",
        numeroDocumento: "",
        complemento: "",
        fechaNacimiento: "",
        paisNacimiento: "Bolivia",
        departamentoNacimiento: "",
        localidadNacimiento: "",
        sexo: "",
        nivelEducativo: "",
        grado: "",
        discapacidad: "",
        registroDiscapacidad: "",
        idiomaAprendizaje: "",
        autoidentificacion: "",
        departamento: "",
        provincia: "",
        municipio: "",
        localidad: "",
        zonaBarrio: "",
        direccion: "",
        numeroVivienda: "",
        telefonoFijo: "",
        celular: "",
        correo: "",
        aguaCaniaeria: "",
        tieneBano: "",
        energiaElectrica: "",
        servicioBasura: "",
        tipoVivienda: "",
        accesoInternet: [],
        certificadoNacimiento: null,
        certificadoVacunas: null,
        fotografias: null,
        comprobantePago: null,
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Error al enviar el formulario. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[95vh] overflow-hidden flex flex-col w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm mb-3">
                <FileText className="h-4 w-4" />
                Formulario RUDE - Preinscripción 2025
              </div>
              <h2 className="text-2xl font-bold">
                Complete el formulario para la preinscripción de su hijo/a
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-blue-800 flex items-center justify-center md:justify-start gap-2">
                <QrCode className="h-4 w-4" />
                Código QR de la Institución
              </h3>
              <p className="text-sm text-blue-600">Escanea para más información</p>
            </div>
            
            <div className="flex items-center gap-4">
              {qrCodeUrl && (
                <div className="bg-white p-2 rounded-lg shadow-sm border">
                  <img 
                    src={qrCodeUrl} 
                    alt="Código QR" 
                    className="w-20 h-20"
                  />
                </div>
              )}
              
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-800">Colegio "Bolivia"</div>
                <div className="text-xs text-blue-600">RUE: 123456789</div>
                <div className="text-xs text-blue-600">La Paz - Bolivia</div>
              </div>
              
              <Button 
                onClick={downloadRudePDF}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
                Descargar RUDE PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="space-y-2">
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-sm">
              <div className={`flex items-center gap-1 ${currentStep >= 1 ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}>
                <User className="h-3 w-3" />
                <span>Datos Estudiante</span>
              </div>
              <div className={`flex items-center gap-1 ${currentStep >= 2 ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}>
                <Home className="h-3 w-3" />
                <span>Dirección</span>
              </div>
              <div className={`flex items-center gap-1 ${currentStep >= 3 ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}>
                <Upload className="h-3 w-3" />
                <span>Documentos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Importante:</strong> Todos los campos marcados con * son obligatorios
            </AlertDescription>
          </Alert>

          {/* Step 1: Datos del Estudiante */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    I. DATOS DE LA O EL ESTUDIANTE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Nombre Completo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Apellido Paterno <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.apellidoPaterno}
                        onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
                        placeholder="Ingrese apellido paterno"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Apellido Materno <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.apellidoMaterno}
                        onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
                        placeholder="Ingrese apellido materno"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Nombre(s) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.nombres}
                        onChange={(e) => handleInputChange("nombres", e.target.value)}
                        placeholder="Ingrese nombres"
                        required
                      />
                    </div>
                  </div>

                  {/* Documento de Identificación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.tipoDocumento} onValueChange={(value) => handleInputChange("tipoDocumento", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ci">Cédula de Identidad</SelectItem>
                          <SelectItem value="certificado">Certificado de Nacimiento</SelectItem>
                          <SelectItem value="extranjero">Cédula de Extranjero</SelectItem>
                          <SelectItem value="diplomatico">Cédula Diplomática</SelectItem>
                          <SelectItem value="dni">Documento Nacional de Identidad</SelectItem>
                          <SelectItem value="pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="declaracion">Declaración Jurada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Número de Documento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.numeroDocumento}
                        onChange={(e) => handleInputChange("numeroDocumento", e.target.value)}
                        placeholder="Número de documento"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Complemento</Label>
                      <Input
                        value={formData.complemento}
                        onChange={(e) => handleInputChange("complemento", e.target.value)}
                        placeholder="Complemento"
                      />
                    </div>
                  </div>

                  {/* Fecha y Lugar de Nacimiento */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        País de Nacimiento <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.paisNacimiento} onValueChange={(value) => handleInputChange("paisNacimiento", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bolivia">Bolivia</SelectItem>
                          <SelectItem value="Otro">Otro País</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Departamento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.departamentoNacimiento}
                        onChange={(e) => handleInputChange("departamentoNacimiento", e.target.value)}
                        placeholder="Departamento"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Localidad <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.localidadNacimiento}
                        onChange={(e) => handleInputChange("localidadNacimiento", e.target.value)}
                        placeholder="Localidad"
                        required
                      />
                    </div>
                  </div>

                  {/* Sexo y Nivel Educativo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Sexo <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Nivel Educativo Solicitado <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.nivelEducativo} 
                        onValueChange={(value) => {
                          handleInputChange("nivelEducativo", value);
                          handleInputChange("grado", ""); // Resetear grado al cambiar nivel
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inicial">Educación Inicial</SelectItem>
                          <SelectItem value="primaria">Educación Primaria</SelectItem>
                          <SelectItem value="secundaria">Educación Secundaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Grado <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.grado} 
                        onValueChange={(value) => handleInputChange("grado", value)}
                        disabled={!formData.nivelEducativo}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grado..." />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.nivelEducativo && gradosPorNivel[formData.nivelEducativo]?.map((grado) => (
                            <SelectItem key={grado.value} value={grado.value}>
                              {grado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Discapacidad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Presenta alguna discapacidad? <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.discapacidad} 
                        onValueChange={(value) => handleInputChange("discapacidad", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.discapacidad === "Si" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Nº de Registro de Discapacidad <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={formData.registroDiscapacidad}
                          onChange={(e) => handleInputChange("registroDiscapacidad", e.target.value)}
                          placeholder="Número de registro"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Autoidentificación Cultural */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Idioma en el que aprendió a hablar <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.idiomaAprendizaje} 
                        onValueChange={(value) => handleInputChange("idiomaAprendizaje", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espanol">Español</SelectItem>
                          <SelectItem value="aymara">Aymara</SelectItem>
                          <SelectItem value="quechua">Quechua</SelectItem>
                          <SelectItem value="guarani">Guaraní</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Con cuál pueblo o nación se autoidentifica? <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["aymara", "quechua", "guarani", "afroboliviano", "ninguno", "otro"].map((pueblo) => (
                          <div key={pueblo} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`autoidentificacion-${pueblo}`}
                              name="autoidentificacion"
                              value={pueblo}
                              checked={formData.autoidentificacion === pueblo}
                              onChange={(e) => handleInputChange("autoidentificacion", e.target.value)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <Label htmlFor={`autoidentificacion-${pueblo}`} className="text-sm capitalize">
                              {pueblo === "afroboliviano" ? "Afroboliviano" : pueblo}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" disabled>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={nextStep}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Dirección y Aspectos Socioeconómicos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5 text-blue-600" />
                    II. DIRECCIÓN Y ASPECTOS SOCIOECONÓMICOS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Esta información es para uso exclusivo de la Unidad Educativa y fines estadísticos
                    </AlertDescription>
                  </Alert>

                  {/* Dirección Completa */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Departamento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.departamento}
                        onChange={(e) => handleInputChange("departamento", e.target.value)}
                        placeholder="Departamento"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Provincia <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.provincia}
                        onChange={(e) => handleInputChange("provincia", e.target.value)}
                        placeholder="Provincia"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Municipio <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.municipio}
                        onChange={(e) => handleInputChange("municipio", e.target.value)}
                        placeholder="Municipio"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Localidad/Comunidad <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.localidad}
                        onChange={(e) => handleInputChange("localidad", e.target.value)}
                        placeholder="Localidad"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Zona/Barrio <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.zonaBarrio}
                        onChange={(e) => handleInputChange("zonaBarrio", e.target.value)}
                        placeholder="Zona/Barrio"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Dirección (Avenida/Calle)</Label>
                      <Input
                        value={formData.direccion}
                        onChange={(e) => handleInputChange("direccion", e.target.value)}
                        placeholder="Dirección"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">N° Vivienda</Label>
                      <Input
                        value={formData.numeroVivienda}
                        onChange={(e) => handleInputChange("numeroVivienda", e.target.value)}
                        placeholder="Número"
                      />
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Teléfono Fijo</Label>
                      <Input
                        value={formData.telefonoFijo}
                        onChange={(e) => handleInputChange("telefonoFijo", e.target.value)}
                        placeholder="Teléfono fijo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Celular de Contacto <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.celular}
                        onChange={(e) => handleInputChange("celular", e.target.value)}
                        placeholder="Número de celular"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={formData.correo}
                        onChange={(e) => handleInputChange("correo", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Servicios Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Tiene acceso a agua por cañería de red? <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.aguaCaniaeria} 
                        onValueChange={(value) => handleInputChange("aguaCaniaeria", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Tiene baño en su vivienda? <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.tieneBano} 
                        onValueChange={(value) => handleInputChange("tieneBano", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Usa energía eléctrica? <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.energiaElectrica} 
                        onValueChange={(value) => handleInputChange("energiaElectrica", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        ¿Servicio de recojo de basura? <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.servicioBasura} 
                        onValueChange={(value) => handleInputChange("servicioBasura", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Tipo de vivienda <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.tipoVivienda} 
                        onValueChange={(value) => handleInputChange("tipoVivienda", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="propia">Propia</SelectItem>
                          <SelectItem value="alquilada">Alquilada</SelectItem>
                          <SelectItem value="prestada">Prestada</SelectItem>
                          <SelectItem value="anticretico">Anticrético</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Acceso a Internet */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      ¿Dónde accede a internet? (Puede marcar varios) <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { value: "casa", label: "En su vivienda" },
                        { value: "colegio", label: "En el colegio" },
                        { value: "publico", label: "Lugares públicos" },
                        { value: "celular", label: "Teléfono celular" },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`internet-${option.value}`}
                            checked={formData.accesoInternet.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange("accesoInternet", [...formData.accesoInternet, option.value]);
                              } else {
                                handleInputChange(
                                  "accesoInternet",
                                  formData.accesoInternet.filter((item) => item !== option.value)
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`internet-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={nextStep}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Documentos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-blue-600" />
                    III. DOCUMENTOS REQUERIDOS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Suba los siguientes documentos escaneados en formato PDF o imagen (JPG, PNG)
                    </AlertDescription>
                  </Alert>

                  {/* Documentos Obligatorios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        id: "certificadoNacimiento",
                        icon: FileText,
                        title: "Certificado de Nacimiento",
                        description: "Original escaneado",
                        required: true,
                        field: "certificadoNacimiento" as keyof FormData,
                      },
                      {
                        id: "certificadoVacunas",
                        icon: Syringe,
                        title: "Certificado de Vacunas",
                        description: "Carnet de vacunación actualizado",
                        required: true,
                        field: "certificadoVacunas" as keyof FormData,
                      },
                      {
                        id: "fotografias",
                        icon: Camera,
                        title: "Fotografías Carnet",
                        description: "2 fotografías fondo azul",
                        required: true,
                        field: "fotografias" as keyof FormData,
                      },
                      {
                        id: "comprobantePago",
                        icon: Receipt,
                        title: "Comprobante de Pago",
                        description: "Pago de matrícula",
                        required: true,
                        field: "comprobantePago" as keyof FormData,
                      },
                    ].map((doc) => (
                      <div
                        key={doc.id}
                        className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                      >
                        <doc.icon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-lg mb-2">{doc.title}</h4>
                        <p className="text-muted-foreground mb-2">{doc.description}</p>
                        {doc.required && (
                          <Badge variant="destructive" className="mb-3">
                            * Requerido
                          </Badge>
                        )}
                        {formData[doc.field] ? (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                            <span className="text-green-700 text-sm">
                              Archivo seleccionado: {(formData[doc.field] as File)?.name}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-blue-600">
                            Click para seleccionar archivo
                          </div>
                        )}
                        <input
                          ref={(el) => (fileInputRefs.current[doc.id] = el)}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.png,.jpeg"
                          onChange={(e) => handleFileChange(doc.field, e.target.files?.[0] || null)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Información de Pago */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <University className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-blue-800">Información para el Pago:</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Banco:</strong> BANCO UNION</p>
                            <p><strong>Cuenta Corriente:</strong> 123-456-789</p>
                            <p><strong>Nombre:</strong> Colegio "Bolivia"</p>
                          </div>
                          <div>
                            <p><strong>NIT:</strong> 123456789</p>
                            <p><strong>Concepto:</strong> Matrícula 2025</p>
                            <p><strong>Monto:</strong> Bs. 400.00</p>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* WhatsApp Info */}
                  <Alert className="bg-green-50 border-green-200">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div>
                        <h6 className="font-semibold text-green-800 mb-1">
                          ¿Necesitas ayuda con el pago?
                        </h6>
                        <p className="text-green-700 mb-1">
                          Escríbenos por WhatsApp: <strong>+591 76543210</strong>
                        </p>
                        <small className="text-green-600">
                          Horario: Lunes a Viernes 8:00 - 16:00
                        </small>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Preinscripción
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-slate-50">
          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-3 w-3" />
              <span>
                La información recabada será utilizada únicamente para fines de políticas públicas educativas
              </span>
            </div>
            <div>
              Resolución Ministerial Nº 0031/2025, 17 de enero del 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RudeFormModal;