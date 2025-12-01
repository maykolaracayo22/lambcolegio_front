import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type Field =
  | { type: "text" | "email" | "number" | "date"; name: string; label: string; placeholder?: string; required?: boolean; min?: number; max?: number; disabled?: boolean }
  | { type: "textarea"; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[]; required?: boolean }
  | { type: "switch"; name: string; label: string; note?: string };

interface CrudFormDialogProps<T extends Record<string, unknown>> {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  initialValues: T;
  onSubmit: (values: T) => void;
  submitLabel?: string;
}

export default function CrudFormDialog<T extends Record<string, unknown>>({
  open, onOpenChange, title, description, fields, initialValues, onSubmit, submitLabel = "Guardar",
}: CrudFormDialogProps<T>) {
  const [values, setValues] = React.useState<T>(initialValues);

  React.useEffect(() => setValues(initialValues), [initialValues, open]);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value } as T));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => {
            if (f.type === "select") {
              return (
                <div key={f.name} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Select value={String(values[f.name] ?? "")} onValueChange={(v) => set(f.name, v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      {f.options.map((op) => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (f.type === "textarea") {
              return (
                <div key={f.name} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Textarea value={String(values[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
                </div>
              );
            }
            if (f.type === "switch") {
              return (
                <div key={f.name} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>{f.label}</Label>
                    {f.note && <p className="text-xs text-muted-foreground">{f.note}</p>}
                  </div>
                  <Switch checked={Boolean(values[f.name])} onCheckedChange={(v) => set(f.name, v)} />
                </div>
              );
            }
            // text/email/number/date
            return (
              <div key={f.name} className="space-y-2">
                <Label>{f.label}</Label>
                <Input
                  type={f.type}
                  value={f.type === "number" ? Number(values[f.name] ?? 0) : String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  min={f.type === "number" ? f.min : undefined}
                  max={f.type === "number" ? f.max : undefined}
                  onChange={(e) => set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                />
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
