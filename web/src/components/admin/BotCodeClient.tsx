"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  Code2,
  Upload,
  Trash2,
  Archive,
  FileText,
  Loader2,
  File,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-input rounded-lg flex items-center justify-center text-muted-foreground text-sm">
      <Loader2 className="w-4 h-4 animate-spin ml-2" />
      جارٍ تحميل المحرر...
    </div>
  ),
});

interface CodeFile {
  id: string;
  filename: string;
  content: string;
  version: number;
  fileSize: number;
  description: string | null;
  updatedAt: string;
}

interface Backup {
  id: string;
  backupName: string;
  fileCount: number;
  createdBy: string;
  createdAt: string;
}

export function BotCodeClient({
  files,
  backups,
}: {
  files: CodeFile[];
  backups: Backup[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(files[0] ?? null);
  const [editedContent, setEditedContent] = useState(files[0]?.content ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "backups">("editor");
  const [dragOver, setDragOver] = useState(false);

  function selectFile(file: CodeFile) {
    if (isDirty && !confirm("لديك تعديلات غير محفوظة. هل تريد الخروج؟")) return;
    setSelectedFile(file);
    setEditedContent(file.content);
    setIsDirty(false);
  }

  function handleEditorChange(value: string | undefined) {
    setEditedContent(value ?? "");
    setIsDirty(value !== selectedFile?.content);
  }

  async function handleCreateBackup() {
    startTransition(async () => {
      const res = await fetch("/api/admin/bot-code/backup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إنشاء نسخة احتياطية");
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل إنشاء النسخة الاحتياطية");
      }
    });
  }

  async function handleSaveFile() {
    if (!selectedFile || !isDirty) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/bot-code/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedFile.id, content: editedContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حفظ الملف");
        setIsDirty(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل الحفظ");
      }
    });
  }

  async function handleDeleteFile(fileId: string, filename: string) {
    if (!confirm(`هل تريد حذف ${filename}؟`)) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/bot-code/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم حذف ${filename}`);
        if (selectedFile?.id === fileId) {
          const remaining = files.filter((f) => f.id !== fileId);
          setSelectedFile(remaining[0] ?? null);
          setEditedContent(remaining[0]?.content ?? "");
        }
        router.refresh();
      } else {
        toast.error(data.error ?? "فشل الحذف");
      }
    });
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file || !file.name.endsWith(".py")) {
        toast.error("يمكن رفع ملفات .py فقط");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const content = ev.target?.result as string;
        startTransition(async () => {
          const res = await fetch("/api/admin/bot-code/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, content }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(`تم رفع ${file.name}`);
            router.refresh();
          } else {
            toast.error(data.error ?? "فشل الرفع");
          }
        });
      };
      reader.readAsText(file);
    },
    [router]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">إدارة كود البوت</h1>
          <p className="page-subtitle">{files.length} ملف Python</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateBackup}
            disabled={isPending || files.length === 0}
            className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 border border-border text-sm font-medium px-3 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
            نسخة احتياطية
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/20 rounded-xl p-1 w-fit">
        {(["editor", "backups"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "editor" ? <Code2 className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {tab === "editor" ? "محرر الكود" : "النسخ الاحتياطية"}
          </button>
        ))}
      </div>

      {activeTab === "editor" ? (
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: "600px" }}>
          {/* File list */}
          <div className="col-span-3 space-y-1">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground transition-all cursor-pointer mb-3",
                dragOver ? "border-green-500/50 bg-green-950/20 text-green-400" : "border-border hover:border-border/80"
              )}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" />
              اسحب ملف .py هنا
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <File className="w-8 h-8 mx-auto mb-2 opacity-30" />
                لا توجد ملفات
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => selectFile(file)}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                    selectedFile?.id === file.id
                      ? "bg-green-500/10 border border-green-900/30"
                      : "hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText
                      className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        selectedFile?.id === file.id ? "text-green-400" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-mono truncate">{file.filename}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id, file.filename); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Editor */}
          <div className="col-span-9">
            {selectedFile ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold">{selectedFile.filename}</span>
                    <span className="text-xs text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">
                      v{selectedFile.version}
                    </span>
                    {isDirty && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        تم التعديل
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isDirty && (
                      <button
                        onClick={handleSaveFile}
                        disabled={isPending}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        حفظ
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden border border-border">
                  <MonacoEditor
                    height="580px"
                    language="python"
                    theme="vs-dark"
                    value={editedContent}
                    onChange={handleEditorChange}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                      lineNumbers: "on",
                      renderLineHighlight: "line",
                      tabSize: 4,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-left">
                  آخر تحديث: {formatDate(selectedFile.updatedAt)} ·{" "}
                  {(selectedFile.fileSize / 1024).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                اختر ملفاً من القائمة أو ارفع ملف .py جديد
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Backups list */
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-bold text-sm">النسخ الاحتياطية ({backups.length})</h3>
          </div>
          {backups.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
              لا توجد نسخ احتياطية بعد
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium text-sm">{backup.backupName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {backup.fileCount} ملف · بواسطة {backup.createdBy}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(backup.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
