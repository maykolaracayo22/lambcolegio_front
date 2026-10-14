// src/components/TeacherSelector.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchTeachers, type Teacher } from "@/services/teachersApi";

interface TeacherSelectorProps {
  value?: number | null;
  onChange: (teacherId: number | null, teacher: Teacher | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TeacherSelector({
  value,
  onChange,
  placeholder = "Seleccionar tutor...",
  disabled = false,
}: TeacherSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (search.length < 2) {
      setTeachers([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchTeachers(search);
        setTeachers(results);
      } catch (err) {
        console.error("Error buscando docentes:", err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Load initial teacher if value is set
  useEffect(() => {
    if (value && !selectedTeacher) {
      // Could fetch by ID here if needed
    }
  }, [value, selectedTeacher]);

  const handleSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    onChange(teacher.id, teacher);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedTeacher(null);
    onChange(null, null);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
            disabled={disabled}
          >
            {selectedTeacher ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {selectedTeacher.nombres} {selectedTeacher.apellidos}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar docente por nombre..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              )}
              {!loading && search.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
              {!loading && search.length >= 2 && teachers.length === 0 && (
                <CommandEmpty>No se encontraron docentes.</CommandEmpty>
              )}
              {!loading && teachers.length > 0 && (
                <CommandGroup heading="Docentes disponibles">
                  {teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={String(teacher.id)}
                      onSelect={() => handleSelect(teacher)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTeacher?.id === teacher.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {teacher.nombres} {teacher.apellidos}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {teacher.codigo_docente} • {teacher.email || "Sin email"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTeacher && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default TeacherSelector;
