"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpenText,
  Check,
  CreditCard,
  Gamepad2,
  Layers,
  Pencil,
  Plus,
  Puzzle,
  RefreshCcw,
  Save,
  Search,
  Upload,
  UsersRound
} from "lucide-react";
import { SvgStrokeTool } from "./SvgStrokeTool";

const emptyForm = {
  id: "",
  name: "",
  glyph: "",
  latin: "",
  category: "wrehasta",
  order: 0,
  isPremium: false,
  svgUrl: "",
  imageUrl: "",
  targetStrokeCount: 0,
  audioUrl: "",
  notes: ""
};

const quizModes = [
  ["nyurat", "Kuis Nyurat", "Menulis aksara di kanvas stroke recognition."],
  ["kata", "Tebak Kata Bolak Balik", "Aksara ke Latin dan Latin ke aksara."],
  ["huruf", "Tebak Huruf Bolak Balik", "Anacaraka, swara, dan angka dua arah."],
  ["match", "Pencocokan Kata", "Drag kata Latin ke kartu aksara."],
  ["maca", "Membaca Aksara Bali", "Baca aksara lalu jawab bacaan Latin."],
  ["kahoot", "Mode Kahoot", "Soal acak dari semua bank kuis."]
];

function toForm(item) {
  if (!item) return emptyForm;
  return {
    id: item.id || "",
    name: item.name || "",
    glyph: item.glyph || item.char || "",
    latin: item.latin || "",
    category: item.category || "wrehasta",
    order: Number(item.order || 0),
    isPremium: Boolean(item.is_premium || item.isPremium),
    svgUrl: item.svg_url || item.svgUrl || "",
    imageUrl: item.image_url || item.imageUrl || "",
    targetStrokeCount: Number(item.target_stroke_count || item.targetStrokeCount || 0),
    audioUrl: item.audio_url || item.audioUrl || "",
    notes: item.notes || ""
  };
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.68rem] font-black uppercase tracking-[0.13em] text-[#5F5850]/70">{label}</span>
      {children}
    </label>
  );
}

function inputClass() {
  return "min-h-10 rounded border border-[#2A2520]/12 bg-white px-3 text-sm font-semibold text-[#25221E] outline-none transition focus:border-[#8B1F18] focus:ring-2 focus:ring-[#8B1F18]/12 disabled:bg-[#F4F1EA] disabled:text-[#5F5850]/60";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function canDisplaySvg(src) {
  return typeof src === "string" && (src.startsWith("/") || src.startsWith("blob:") || src.startsWith("data:image/svg+xml"));
}

function SvgPreview({ src, glyph, label, compact = false }) {
  const displayable = canDisplaySvg(src);
  return (
    <div
      className={`relative overflow-hidden rounded border border-[#2A2520]/10 bg-white ${
        compact ? "h-24" : "min-h-48"
      }`}
    >
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#8B1F18_1px,transparent_1px),linear-gradient(90deg,#8B1F18_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className={`relative flex items-center justify-center p-4 ${compact ? "h-24" : "min-h-48"}`}>
        {displayable ? (
          // eslint-disable-next-line @next/next/no-img-element -- SVG reference dari admin perlu tampil apa adanya, termasuk blob preview sebelum upload.
          <img
            src={src}
            alt={`Preview SVG ${label || "aksara"}`}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="text-center">
            {glyph ? <div className="bali-text text-6xl leading-none text-[#8B1F18]/75">{glyph}</div> : null}
            <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5F5850]/55">
              SVG belum tampil
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ListGlyphPreview({ glyph }) {
  const glyphLength = Array.from(String(glyph || "")).length;
  const fontSize = glyphLength > 2 ? 20 : glyphLength > 1 ? 27 : 34;
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded border border-[#2A2520]/10 bg-white text-[#8B1F18]">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <text
          x="32"
          y="34"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          className="bali-text"
          fill="currentColor"
        >
          {glyph}
        </text>
      </svg>
    </span>
  );
}

function targetStrokeCount(item) {
  return Number(item?.target_stroke_count || item?.targetStrokeCount || 0);
}

function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: "bg-[#EFEEE9] text-[#5F5850]",
    brick: "bg-[#8B1F18]/10 text-[#8B1F18]",
    green: "bg-[#4A7C59]/10 text-[#4A7C59]",
    gold: "bg-[#C9A227]/15 text-[#825122]"
  };

  return (
    <span className={`inline-flex rounded px-2.5 py-1 text-[0.66rem] font-black uppercase tracking-[0.1em] ${styles[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, meta }) {
  return (
    <div className="rounded border border-[#2A2520]/10 bg-white p-4 shadow-[0_8px_22px_rgba(42,37,32,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#5F5850]/70">{label}</p>
          <p className="mt-3 text-3xl font-black text-[#25221E]">{value}</p>
          <p className="mt-1 text-xs font-semibold text-[#8B1F18]">{meta}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded bg-[#8B1F18]/10 text-[#8B1F18]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded border border-[#2A2520]/10 bg-[#F7F4EE] p-4 text-sm font-semibold leading-6 text-[#5F5850]">
      {children}
    </div>
  );
}

function SectionShell({ eyebrow, title, description, children }) {
  return (
    <section className="rounded border border-[#2A2520]/10 bg-white p-5 shadow-[0_8px_22px_rgba(42,37,32,0.035)]">
      <div>
        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8B1F18]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-[#25221E]">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#5F5850]">{description}</p>}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function AdminContentManager({
  initialSection = "overview",
  initialCategories = [],
  initialAksara = [],
  initialQuizGroups = [],
  initialUsers = [],
  initialStrokeAttempts = [],
  initialQuizAttempts = [],
  initialGameSessions = [],
  initialPayments = []
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialAksara);
  const [form, setForm] = useState(initialAksara[0] ? toForm(initialAksara[0]) : emptyForm);
  const [contentCategory, setContentCategory] = useState("all");
  const [contentQuery, setContentQuery] = useState("");
  const [svgFile, setSvgFile] = useState(null);
  const [svgPreviewUrl, setSvgPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedItem = useMemo(() => items.find((item) => item.id === form.id), [items, form.id]);
  const currentSvgUrl = svgPreviewUrl || form.svgUrl || selectedItem?.svg_url || "";
  const filteredItems = useMemo(
    () => {
      const query = contentQuery.trim().toLowerCase();
      return items
        .filter((item) => contentCategory === "all" || item.category === contentCategory)
        .filter((item) => {
          if (!query) return true;
          return [item.id, item.name, item.latin, item.category, item.glyph || item.char]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        })
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.latin || a.name).localeCompare(String(b.latin || b.name)));
    },
    [contentCategory, contentQuery, items]
  );
  const quizItemCount = useMemo(
    () => initialQuizGroups.reduce((total, group) => total + Number(group.count || group.items?.length || 0), 0),
    [initialQuizGroups]
  );
  const activityCount = initialStrokeAttempts.length + initialQuizAttempts.length;
  const svgToolAksara = useMemo(() => {
    if (!selectedItem) return null;
    return {
      ...selectedItem,
      glyph: form.glyph || selectedItem.glyph || selectedItem.char,
      latin: form.latin || selectedItem.latin,
      name: form.name || selectedItem.name,
      image_url: form.imageUrl || selectedItem.image_url,
      svg_url: form.svgUrl || selectedItem.svg_url,
      target_stroke_count: Number(form.targetStrokeCount || selectedItem.target_stroke_count || 0)
    };
  }, [form, selectedItem]);

  useEffect(() => {
    return () => {
      if (svgPreviewUrl) URL.revokeObjectURL(svgPreviewUrl);
    };
  }, [svgPreviewUrl]);

  function handleSvgFileChange(file) {
    setSvgFile(file);
    setSvgPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  function setValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectAksara(item) {
    setForm(toForm(item));
    handleSvgFileChange(null);
  }

  function startNewAksara() {
    setForm({
      ...emptyForm,
      category: contentCategory !== "all" ? contentCategory : categories[0]?.id || emptyForm.category
    });
    handleSvgFileChange(null);
  }

  function changeContentCategory(categoryId) {
    setContentCategory(categoryId);
    const firstMatch = items.find((item) => categoryId === "all" || item.category === categoryId);
    if (firstMatch) selectAksara(firstMatch);
  }

  async function reload() {
    setStatus("Memuat ulang data konten...");
    const [categoryResponse, aksaraResponse] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/aksara")
    ]);
    const categoryBody = await categoryResponse.json();
    const aksaraBody = await aksaraResponse.json();
    if (!categoryResponse.ok || !aksaraResponse.ok) {
      setStatus(categoryBody.error || aksaraBody.error || "Data belum bisa dimuat.");
      return;
    }
    setCategories(categoryBody.data.categories || []);
    setItems(aksaraBody.data.aksara || []);
    setStatus("Data konten terbaru sudah dimuat.");
  }

  async function saveAksara(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const editing = Boolean(selectedItem);
    try {
      const response = await fetch(editing ? `/api/admin/aksara/${encodeURIComponent(form.id)}` : "/api/admin/aksara", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Aksara belum bisa disimpan.");
      const savedId = body.data?.aksara?.id || form.id;
      if (svgFile && savedId) {
        const uploaded = await uploadSvg(savedId, svgFile);
        setStatus(`Aksara tersimpan. SVG reference: ${uploaded.svgUrl} (${uploaded.strokeCount || 0} goresan).`);
      } else {
        setStatus("Aksara tersimpan.");
      }
      handleSvgFileChange(null);
      setForm(emptyForm);
      await reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Aksara belum bisa disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadSvg(aksaraId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/api/admin/aksara/${encodeURIComponent(aksaraId)}/svg`, {
      method: "POST",
      body: formData
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "SVG belum bisa diupload.");
    return body.data;
  }

  async function uploadSelectedSvg() {
    if (!selectedItem?.id || !svgFile) {
      setStatus("Pilih aksara dan file SVG dulu.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const uploaded = await uploadSvg(selectedItem.id, svgFile);
      setValue("svgUrl", uploaded.svgUrl);
      setValue("targetStrokeCount", Number(uploaded.strokeCount || 0));
      handleSvgFileChange(null);
      setStatus(`SVG reference tersimpan: ${uploaded.svgUrl} (${uploaded.strokeCount || 0} goresan).`);
      await reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "SVG belum bisa diupload.");
    } finally {
      setSaving(false);
    }
  }

  async function saveGeneratedSvg(svgText, strokeCount) {
    if (!selectedItem?.id) {
      throw new Error("Pilih aksara dari daftar dulu.");
    }
    setSaving(true);
    setStatus("");
    try {
      const file = new File([svgText], `${selectedItem.id}.svg`, { type: "image/svg+xml" });
      const uploaded = await uploadSvg(selectedItem.id, file);
      setValue("svgUrl", uploaded.svgUrl);
      setValue("targetStrokeCount", Number(uploaded.strokeCount || strokeCount || 0));
      setStatus(`SVG tool tersimpan: ${uploaded.svgUrl}`);
      await reload();
      return uploaded;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 space-y-6">

      {activeSection === "overview" && (
        <SectionShell
          eyebrow="Ringkasan"
          title="Semua modul aplikasi."
          description="Pantau sumber materi, pengguna, aktivitas belajar, game kelas, dan status pembayaran dari panel admin."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Layers} label="Kategori" value={categories.length} meta="kelompok materi" />
            <StatCard icon={BookOpenText} label="Aksara" value={items.length} meta="konten latihan" />
            <StatCard icon={Puzzle} label="Item kuis" value={quizItemCount} meta="bank soal aktif" />
            <StatCard icon={UsersRound} label="Akun" value={initialUsers.length} meta="admin dan siswa" />
            <StatCard icon={Activity} label="Aktivitas" value={activityCount} meta="stroke + kuis" />
            <StatCard icon={Gamepad2} label="Game session" value={initialGameSessions.length} meta="kelas dibuat" />
            <StatCard icon={CreditCard} label="Pembayaran" value={initialPayments.length} meta="transaksi tercatat" />
            <StatCard icon={Check} label="Konten SVG" value={items.filter((item) => item.svg_url).length} meta="siap stroke" />
            <StatCard icon={Pencil} label="Panduan goresan" value={items.filter((item) => targetStrokeCount(item) > 0).length} meta="balinese-goresan.md" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl bg-[#FBF7EE] p-5">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8B1F18]">Aksi cepat</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setActiveSection("content")} className="rounded-xl bg-[#8B1F18] px-4 py-3 text-sm font-black text-white">
                  Kelola aksara
                </button>
                <button type="button" onClick={() => setActiveSection("quiz")} className="rounded-xl border border-[#2A2520]/12 bg-white px-4 py-3 text-sm font-black text-[#4A3F37]">
                  Lihat bank kuis
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-[#FBF7EE] p-5">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8B1F18]">Catatan role</p>
              <p className="mt-3 leading-7 text-[#4A3F37]/75">
                Admin hanya mengelola aplikasi. Latihan dan kuis dipakai siswa, sedangkan host game dipakai akun guru.
              </p>
            </div>
          </div>
        </SectionShell>
      )}

      {activeSection === "content" && (
        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
            <section className="overflow-hidden rounded border border-[#2A2520]/10 bg-white shadow-[0_8px_22px_rgba(42,37,32,0.035)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#2A2520]/10 px-4 py-3">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8B1F18]">Katalog</p>
                  <h2 className="mt-1 text-xl font-black text-[#25221E]">Aksara</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={reload}
                    className="grid h-9 w-9 place-items-center rounded border border-[#2A2520]/10 bg-white text-[#5F5850] transition hover:border-[#8B1F18]/35 hover:text-[#8B1F18]"
                    aria-label="Muat ulang data"
                    title="Muat ulang data"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={startNewAksara}
                    className="grid h-9 w-9 place-items-center rounded bg-[#8B1F18] text-white transition hover:bg-[#741A15]"
                    aria-label="Aksara baru"
                    title="Aksara baru"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 border-b border-[#2A2520]/10 bg-[#FAFAF7] p-4">
                <Field label="Kategori">
                  <select
                    className={inputClass()}
                    value={contentCategory}
                    onChange={(event) => changeContentCategory(event.target.value)}
                  >
                    <option value="all">Semua kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="grid gap-2">
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.13em] text-[#5F5850]/70">Cari</span>
                  <span className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F5850]/55" />
                    <input
                      className={`${inputClass()} w-full pl-9`}
                      value={contentQuery}
                      onChange={(event) => setContentQuery(event.target.value)}
                      placeholder="Nama, latin, kategori, ID"
                    />
                  </span>
                </label>
                <p className="text-xs font-bold text-[#5F5850]/70">
                  Menampilkan {filteredItems.length} dari {items.length} konten.
                </p>
              </div>

              <div className="max-h-[68vh] overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectAksara(item)}
                    aria-pressed={selectedItem?.id === item.id}
                    className={`flex w-full items-center gap-3 border-b border-[#2A2520]/[0.07] px-4 py-3 text-left transition last:border-b-0 ${
                      selectedItem?.id === item.id ? "bg-[#8B1F18]/10 shadow-[inset_3px_0_0_#8B1F18]" : "hover:bg-[#F7F4EE]"
                    }`}
                  >
                    <ListGlyphPreview glyph={item.glyph || item.char} />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center justify-between gap-3">
                        <span className="truncate text-sm font-black text-[#25221E]">{item.latin || item.name}</span>
                        <span className="text-xs font-black tabular-nums text-[#5F5850]/55">{Number(item.order || 0)}</span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge>{item.category}</Badge>
                        <Badge tone={item.svg_url ? "green" : "brick"}>{item.svg_url ? "SVG" : "Kosong"}</Badge>
                        {targetStrokeCount(item) > 0 && <Badge tone="gold">{targetStrokeCount(item)} stroke</Badge>}
                      </span>
                    </span>
                  </button>
                ))}
                {!filteredItems.length && (
                  <div className="p-4">
                    <EmptyState>Belum ada aksara yang cocok dengan filter ini.</EmptyState>
                  </div>
                )}
              </div>
            </section>

            {status && (
              <div className="rounded border border-[#2A2520]/10 bg-white px-4 py-3 text-sm font-bold leading-6 text-[#5F5850] shadow-[0_8px_22px_rgba(42,37,32,0.035)]" role="status">
                {status}
              </div>
            )}
          </aside>

          <section className="overflow-hidden rounded border border-[#2A2520]/10 bg-white shadow-[0_8px_22px_rgba(42,37,32,0.035)]">
            <div className="flex flex-col gap-3 border-b border-[#2A2520]/10 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8B1F18]">Konten aksara</p>
                <h2 className="mt-1 text-2xl font-black text-[#25221E]">{selectedItem ? "Edit aksara" : "Tambah aksara baru"}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5850]">
                  {selectedItem ? "Edit metadata dan referensi SVG untuk materi yang dipilih." : "Isi data dasar dulu, lalu simpan sebelum membuka tool SVG."}
                </p>
              </div>
              <button
                type="button"
                onClick={startNewAksara}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-[#2A2520]/12 bg-white px-4 text-sm font-black text-[#5F5850] transition hover:border-[#8B1F18]/35 hover:text-[#8B1F18]"
              >
                <Plus className="h-4 w-4" />
                Baru
              </button>
            </div>

            <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="p-5">
                <div className="mb-5 grid gap-3 rounded border border-[#2A2520]/10 bg-[#FAFAF7] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
                  <ListGlyphPreview glyph={form.glyph || selectedItem?.glyph || selectedItem?.char} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={selectedItem ? "brick" : "neutral"}>{selectedItem ? selectedItem.category : "Belum dipilih"}</Badge>
                      {selectedItem?.svg_url && <Badge tone="green">SVG aktif</Badge>}
                      {form.isPremium && <Badge tone="gold">Premium</Badge>}
                    </div>
                    <h3 className="mt-2 truncate text-lg font-black text-[#25221E]">
                      {selectedItem ? form.latin || form.name : "Pilih aksara dari daftar kiri"}
                    </h3>
                    <p className="mt-1 break-all text-xs font-semibold leading-5 text-[#5F5850]/75">
                      {selectedItem
                        ? currentSvgUrl || "SVG belum tersedia. Upload file atau gambar ulang dengan tool di bawah."
                        : "Tekan Baru untuk membuat konten atau pilih item katalog untuk edit."}
                    </p>
                  </div>
                </div>

                <form onSubmit={saveAksara} className="grid gap-4 sm:grid-cols-2">
              <Field label="ID konten">
                <input className={inputClass()} value={form.id} onChange={(event) => setValue("id", event.target.value)} placeholder="otomatis jika kosong" disabled={Boolean(selectedItem)} />
              </Field>
              <Field label="Nama">
                <input className={inputClass()} value={form.name} onChange={(event) => setValue("name", event.target.value)} placeholder="Ki" required />
              </Field>
              <Field label="Aksara Bali">
                <input className={`${inputClass()} bali-text text-3xl`} value={form.glyph} onChange={(event) => setValue("glyph", event.target.value)} placeholder="ᬓ" required />
              </Field>
              <Field label="Latin">
                <input className={inputClass()} value={form.latin} onChange={(event) => setValue("latin", event.target.value)} placeholder="ka" />
              </Field>
              <Field label="Kategori">
                <select className={inputClass()} value={form.category} onChange={(event) => setValue("category", event.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Urutan">
                <input className={inputClass()} type="number" value={form.order} onChange={(event) => setValue("order", Number(event.target.value))} />
              </Field>
              <Field label="Target goresan">
                <input className={inputClass()} type="number" min="0" value={form.targetStrokeCount} onChange={(event) => setValue("targetStrokeCount", Number(event.target.value))} />
              </Field>
              <label className="flex min-h-10 items-center gap-3 rounded border border-[#2A2520]/12 bg-[#FAFAF7] px-3 text-sm font-black text-[#5F5850]">
                <input type="checkbox" checked={form.isPremium} onChange={(event) => setValue("isPremium", event.target.checked)} className="h-4 w-4 accent-[#8B1F18]" />
                Konten premium
              </label>
              <div className="rounded border border-[#2A2520]/10 bg-[#FAFAF7] p-4 sm:col-span-2">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                  <Field label="Upload SVG">
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={(event) => handleSvgFileChange(event.target.files?.[0] || null)}
                      className="block min-h-10 w-full rounded border border-[#2A2520]/12 bg-white px-3 py-2 text-sm font-semibold text-[#25221E] file:mr-3 file:rounded file:border-0 file:bg-[#8B1F18] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={uploadSelectedSvg}
                    disabled={saving || !selectedItem || !svgFile}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-[#2A2520]/12 bg-white px-4 text-sm font-black text-[#5F5850] transition hover:border-[#8B1F18]/35 hover:text-[#8B1F18] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Upload className="h-4 w-4" />
                    Upload SVG
                  </button>
                </div>
                <p className="mt-3 break-all text-xs font-bold text-[#5F5850]/65">
                  {svgFile ? `File dipilih: ${svgFile.name}` : currentSvgUrl || "Belum ada SVG."}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Field label="Catatan">
                  <textarea className={`${inputClass()} min-h-28 py-3`} value={form.notes} onChange={(event) => setValue("notes", event.target.value)} placeholder="Catatan pembelajaran atau konteks budaya" />
                </Field>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#8B1F18] px-4 text-sm font-black text-white transition hover:bg-[#741A15] disabled:opacity-50 sm:col-span-2"
              >
                <Save className="h-4 w-4" />
                Simpan aksara
              </button>
            </form>

            {selectedItem ? (
              <SvgStrokeTool
                key={svgToolAksara?.id || "svg-tool-empty"}
                aksara={svgToolAksara}
                saving={saving}
                onSave={saveGeneratedSvg}
              />
            ) : (
              <div className="mt-5 rounded border border-dashed border-[#8B1F18]/25 bg-[#FAFAF7] p-5 text-sm font-bold leading-6 text-[#5F5850]">
                Tool SVG aktif setelah aksara dipilih atau data baru disimpan.
              </div>
            )}


              </div>
              <aside className="border-t border-[#2A2520]/10 bg-[#FAFAF7] p-5 xl:border-l xl:border-t-0">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8B1F18]">Preview SVG</p>
                <div className="mt-3">
                  <SvgPreview
                    src={currentSvgUrl}
                    glyph={form.glyph || selectedItem?.glyph || selectedItem?.char}
                    label={form.latin || form.name || selectedItem?.latin || selectedItem?.name}
                  />
                </div>
                <div className="mt-4 divide-y divide-[#2A2520]/10 rounded border border-[#2A2520]/10 bg-white text-sm">
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-semibold text-[#5F5850]">ID</span>
                    <span className="truncate font-black text-[#25221E]">{form.id || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-semibold text-[#5F5850]">Kategori</span>
                    <span className="truncate font-black text-[#25221E]">{form.category || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-semibold text-[#5F5850]">Goresan</span>
                    <span className="font-black text-[#25221E]">{form.targetStrokeCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-semibold text-[#5F5850]">Akses</span>
                    <span className="font-black text-[#25221E]">{form.isPremium ? "Premium" : "Gratis"}</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}

      {activeSection === "quiz" && (
        <SectionShell
          eyebrow="Bank kuis"
          title="Sumber soal untuk semua mode."
          description="Materi ini dipakai oleh kuis nyurat, tebak kata, tebak huruf, matching, membaca, dan mode Kahoot."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {quizModes.map(([id, name, description]) => (
              <div key={id} className="rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] p-5">
                <Badge tone="brick">{id}</Badge>
                <h3 className="mt-4 text-xl font-black">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4A3F37]/70">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {initialQuizGroups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-[#2A2520]/10 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8B1F18]">{group.id}</p>
                    <h3 className="mt-1 text-2xl font-black">{group.name}</h3>
                  </div>
                  <Badge tone="gold">{group.count} item</Badge>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FBF7EE] px-3 py-3">
                      <div>
                        <p className="text-sm font-black">{item.latin}</p>
                        <p className="text-xs font-semibold text-[#4A3F37]/55">{item.group}</p>
                      </div>
                      <span className="bali-text text-3xl leading-none text-[#8B1F18]">{item.glyph}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {activeSection === "users" && (
        <SectionShell eyebrow="Pengguna" title="Akun admin, guru, dan siswa." description="Pantau akun yang aktif, role, tier, dan tanggal pendaftaran.">
          <div className="grid gap-3">
            {initialUsers.map((user) => (
              <div key={user.id} className="grid gap-3 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-black">{user.display_name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4A3F37]/65">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={user.role === "admin" ? "brick" : "neutral"}>{user.role}</Badge>
                  <Badge tone={user.tier === "premium" ? "gold" : "neutral"}>{user.tier}</Badge>
                </div>
                <p className="text-sm font-semibold text-[#4A3F37]/60">{formatDate(user.created_at)}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {activeSection === "activity" && (
        <SectionShell eyebrow="Aktivitas" title="Riwayat latihan dan kuis." description="Gunakan ini untuk memantau apakah fitur belajar benar-benar dipakai siswa.">
          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <h3 className="text-xl font-black">Stroke attempts</h3>
              <div className="mt-4 grid gap-3">
                {initialStrokeAttempts.length ? initialStrokeAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl bg-[#FBF7EE] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{attempt.display_name || attempt.email || "Siswa"}</p>
                        <p className="mt-1 text-sm text-[#4A3F37]/65">{attempt.aksara_name || attempt.aksara_id || "Stroke"}</p>
                      </div>
                      <Badge tone={attempt.passed ? "green" : "brick"}>{attempt.score}</Badge>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#4A3F37]/55">{formatDate(attempt.created_at)}</p>
                  </div>
                )) : <EmptyState>Belum ada aktivitas stroke.</EmptyState>}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black">Quiz attempts</h3>
              <div className="mt-4 grid gap-3">
                {initialQuizAttempts.length ? initialQuizAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl bg-[#FBF7EE] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{attempt.display_name || attempt.email || "Siswa"}</p>
                        <p className="mt-1 text-sm text-[#4A3F37]/65">{attempt.mode} - {attempt.correct_count}/{attempt.total_count}</p>
                      </div>
                      <Badge tone={attempt.passed ? "green" : "brick"}>{attempt.score}</Badge>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#4A3F37]/55">{formatDate(attempt.created_at)}</p>
                  </div>
                )) : <EmptyState>Belum ada aktivitas kuis.</EmptyState>}
              </div>
            </div>
          </div>
        </SectionShell>
      )}

      {activeSection === "game" && (
        <SectionShell eyebrow="Game" title="Sesi kelas dan Kahoot." description="Pantau room game yang pernah dibuat, PIN, status, jumlah soal, dan pemain.">
          <div className="grid gap-3">
            {initialGameSessions.length ? initialGameSessions.map((session) => (
              <div key={session.id} className="grid gap-3 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] p-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                <div>
                  <p className="font-black">{session.title}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4A3F37]/65">Host: {session.host_name || "Guru"} - PIN {session.pin}</p>
                </div>
                <Badge tone={session.status === "live" ? "green" : "brick"}>{session.status}</Badge>
                <p className="text-sm font-black">{session.question_count} soal / {session.player_count} pemain</p>
                <p className="text-sm font-semibold text-[#4A3F37]/60">{formatDate(session.created_at)}</p>
              </div>
            )) : <EmptyState>Belum ada sesi game.</EmptyState>}
          </div>
        </SectionShell>
      )}

      {activeSection === "payments" && (
        <SectionShell eyebrow="Pembayaran" title="Transaksi dan premium." description="Pantau transaksi paket belajar yang dibuat dari aplikasi.">
          <div className="grid gap-3">
            {initialPayments.length ? initialPayments.map((payment) => (
              <div key={payment.id} className="grid gap-3 rounded-2xl border border-[#2A2520]/10 bg-[#FBF7EE] p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div>
                  <p className="font-black">{payment.display_name || payment.email || payment.order_id}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4A3F37]/65">{payment.order_id} - {payment.payment_type || "payment"}</p>
                </div>
                <Badge tone={payment.status === "success" ? "green" : "gold"}>{payment.status}</Badge>
                <p className="text-sm font-black">Rp {Number(payment.amount || 0).toLocaleString("id-ID")}</p>
              </div>
            )) : <EmptyState>Belum ada transaksi pembayaran.</EmptyState>}
          </div>
        </SectionShell>
      )}
    </div>
  );
}
