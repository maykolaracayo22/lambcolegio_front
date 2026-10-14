import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createAnnouncement, listAdminAnnouncements, type Announcement } from "@/services/announcementsApi";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyForm = () => ({
  title: "",
  category: "Comunicado",
  summary: "",
  content: "",
  image_url: "",
  published_at: today(),
  is_published: true,
});

export default function ComunicadosAdmin() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAdminAnnouncements());
    } catch (requestError: any) {
      const message = requestError.response?.data?.message || "No se pudieron cargar los comunicados.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAnnouncements(); }, [loadAnnouncements]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAnnouncement({
        ...form,
        image_url: form.image_url.trim() || null,
        published_at: form.published_at || null,
      });
      toast.success(form.is_published ? "Noticia publicada correctamente." : "Borrador guardado correctamente.");
      setForm(emptyForm());
      await loadAnnouncements();
    } catch (requestError: any) {
      const validation = requestError.response?.data?.errors;
      const message = validation
        ? Object.values(validation).flat().join(" ")
        : requestError.response?.data?.message || "No se pudo guardar la noticia.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-purple-600" />
          <h1 className="text-3xl font-bold">Comunicados y Novedades</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Crea noticias que aparecerán en la página principal del colegio.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Nueva noticia</CardTitle>
            <CardDescription>Los comunicados publicados se mostrarán en el carrusel de la portada.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="news-title">Título</Label>
                <Input id="news-title" required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título de la noticia" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="news-category">Categoría</Label>
                  <Input id="news-category" required maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Ej.: Actividad institucional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="news-date">Fecha de publicación</Label>
                  <Input id="news-date" type="date" value={form.published_at} onChange={(event) => setForm({ ...form, published_at: event.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-summary">Resumen para la tarjeta</Label>
                <Textarea id="news-summary" required maxLength={2000} rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Breve texto que se verá en la portada" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-content">Detalle completo</Label>
                <Textarea id="news-content" required maxLength={20000} rows={6} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Escribe toda la información del comunicado" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-image">URL de imagen (opcional)</Label>
                <Input id="news-image" type="url" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://..." />
              </div>
              <label className="flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} className="h-4 w-4 accent-purple-600" />
                <span><strong>Publicar inmediatamente</strong><span className="block text-muted-foreground">Si desmarcas esta opción, se guardará como borrador.</span></span>
              </label>
              <Button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700">
                {saving ? "Guardando..." : form.is_published ? "Publicar noticia" : "Guardar borrador"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Noticias creadas</CardTitle>
              <CardDescription>Los borradores solo son visibles aquí.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => void loadAnnouncements()} disabled={loading} aria-label="Actualizar noticias">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {loading ? <p className="text-sm text-muted-foreground">Cargando noticias...</p> : items.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Todavía no hay noticias creadas.</p>
            ) : items.map((item) => (
              <article key={item.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={item.is_published ? "default" : "secondary"}>{item.is_published ? "Publicado" : "Borrador"}</Badge>
                  <span className="text-xs text-muted-foreground">{item.published_at || "Sin fecha"}</span>
                </div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
