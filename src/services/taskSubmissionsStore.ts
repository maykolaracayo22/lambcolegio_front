export type TaskAttachmentKind = 'archivo' | 'enlace' | 'youtube';

export interface TaskAttachment {
  id: string;
  kind: TaskAttachmentKind;
  name?: string;
  url?: string;
  file?: Blob;
}

export interface TaskSubmission {
  id: string;
  taskId: number;
  studentId: number;
  studentName: string;
  submittedAt: string;
  attachments: TaskAttachment[];
  // Legacy fields are kept so deliveries created before this update remain readable.
  attachmentKind?: TaskAttachmentKind;
  attachmentName?: string;
  attachmentUrl?: string;
  file?: Blob;
}

const DB_NAME = 'colegio-task-submissions';
const STORE_NAME = 'submissions';
export const TASK_SUBMISSIONS_UPDATED = 'task-submissions-updated';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) return Promise.reject(new Error('Este navegador no permite guardar entregas.'));
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('taskId', 'taskId', { unique: false });
        store.createIndex('studentId', 'studentId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento de entregas.'));
  });

  return databasePromise;
}

function announceUpdate(): void {
  window.dispatchEvent(new CustomEvent(TASK_SUBMISSIONS_UPDATED));
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(TASK_SUBMISSIONS_UPDATED);
    channel.postMessage('updated');
    channel.close();
  }
}

export async function saveTaskSubmission(submission: TaskSubmission): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(submission);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('No se pudo guardar la entrega.'));
    transaction.onabort = () => reject(transaction.error || new Error('Se canceló el guardado de la entrega.'));
  });
  announceUpdate();
}

export async function deleteTaskSubmission(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('No se pudo cancelar el envío.'));
    transaction.onabort = () => reject(transaction.error || new Error('Se canceló la operación.'));
  });
  announceUpdate();
}

function normalizeSubmission(value: TaskSubmission): TaskSubmission {
  if (Array.isArray(value.attachments)) return value;
  const attachment: TaskAttachment = {
    id: `legacy-${value.id}`,
    kind: value.attachmentKind || (value.file ? 'archivo' : 'enlace'),
    ...(value.attachmentName ? { name: value.attachmentName } : {}),
    ...(value.attachmentUrl ? { url: value.attachmentUrl } : {}),
    ...(value.file ? { file: value.file } : {}),
  };
  return { ...value, attachments: [attachment] };
}

export async function listTaskSubmissions(taskIds?: number[]): Promise<TaskSubmission[]> {
  const database = await openDatabase();
  const all = await new Promise<TaskSubmission[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as TaskSubmission[]);
    request.onerror = () => reject(request.error || new Error('No se pudieron cargar las entregas.'));
  });
  if (!taskIds) return all.map(normalizeSubmission);
  const allowed = new Set(taskIds);
  return all.filter((submission) => allowed.has(submission.taskId)).map(normalizeSubmission);
}

export async function getTaskSubmission(id: string): Promise<TaskSubmission | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ? normalizeSubmission(request.result as TaskSubmission) : undefined);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el archivo entregado.'));
  });
}
