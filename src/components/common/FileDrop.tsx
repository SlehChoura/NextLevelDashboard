import { useRef, useState, type DragEvent } from "react"

export function FileDrop({
  onFile,
  accept,
  hint,
}: {
  onFile: (file: File) => void
  accept: string
  hint: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
        dragging ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)]"
      }`}
    >
      <p className="text-sm font-medium text-[var(--color-text)]">
        Glissez-déposez un fichier ici, ou cliquez pour parcourir
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
