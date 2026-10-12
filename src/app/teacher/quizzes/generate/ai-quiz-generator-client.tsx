"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  FileText,
  UploadCloud,
  FileUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Save,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveAiGeneratedQuiz } from "@/lib/actions/quiz-actions";

export interface GeneratedQuestionItem {
  id?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation?: string;
  marks: number;
}

interface ClassOption {
  id: string;
  name: string;
}

interface AiQuizGeneratorClientProps {
  classes: ClassOption[];
}

type SourceType = "docx" | "text";
type GeneratorState = "idle" | "generating" | "review" | "saving";

export function AiQuizGeneratorClient({ classes }: AiQuizGeneratorClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Generator Configuration State
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("docx");
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Mixed");
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(1);

  // Workflow & Review States
  const [state, setState] = useState<GeneratorState>("idle");
  const [loadingStep, setLoadingStep] = useState<string>("Generating your quiz...");
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Question Edit Modal State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<GeneratedQuestionItem>({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    explanation: "",
    marks: 1,
  });

  // Manual Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<GeneratedQuestionItem>({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    explanation: "",
    marks: marksPerQuestion || 1,
  });

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast.error("Please select a valid .docx Word document.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5 MB.");
      return;
    }

    setDocxFile(file);
  };

  // Generate Questions via Server API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId) {
      toast.error("Please select a classroom.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a quiz title.");
      return;
    }

    if (sourceType === "docx" && !docxFile) {
      toast.error("Please upload a .docx document.");
      return;
    }

    if (sourceType === "text" && (!pastedText.trim() || pastedText.trim().length < 30)) {
      toast.error("Please paste at least 30 characters of educational content.");
      return;
    }

    setState("generating");
    setLoadingStep(
      sourceType === "docx"
        ? "Uploading & extracting document content..."
        : "Analyzing study material..."
    );

    try {
      let response: Response;

      if (sourceType === "docx" && docxFile) {
        setLoadingStep("Extracting readable text from Word document...");
        const formData = new FormData();
        formData.append("file", docxFile);
        formData.append("classId", selectedClassId);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("questionCount", String(questionCount));
        formData.append("difficulty", difficulty);
        formData.append("marks", String(marksPerQuestion));

        setLoadingStep("Generating your quiz with AI...");
        response = await fetch("/api/teacher/quizzes/generate", {
          method: "POST",
          body: formData,
        });
      } else {
        setLoadingStep("Generating your quiz with AI...");
        response = await fetch("/api/teacher/quizzes/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClassId,
            title: title.trim(),
            description: description.trim(),
            sourceContent: pastedText.trim(),
            questionCount,
            difficulty,
            marks: marksPerQuestion,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate quiz questions.");
      }

      setGeneratedQuestions(data.questions);
      setGenerationNotice(data.notice || null);
      setState("review");
      toast.success(`Successfully generated ${data.questions.length} questions!`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Quiz generation failed. Please try again.");
      setState("idle");
    }
  };

  // Open Edit Modal for a Question
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setEditQuestion({ ...generatedQuestions[index] });
    setEditModalOpen(true);
  };

  // Save Edits to a Question
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;

    if (!editQuestion.question.trim()) {
      toast.error("Question cannot be empty.");
      return;
    }
    if (
      !editQuestion.optionA.trim() ||
      !editQuestion.optionB.trim() ||
      !editQuestion.optionC.trim() ||
      !editQuestion.optionD.trim()
    ) {
      toast.error("All 4 options (A-D) must be provided.");
      return;
    }

    const updated = [...generatedQuestions];
    updated[editingIndex] = {
      ...editQuestion,
      question: editQuestion.question.trim(),
      optionA: editQuestion.optionA.trim(),
      optionB: editQuestion.optionB.trim(),
      optionC: editQuestion.optionC.trim(),
      optionD: editQuestion.optionD.trim(),
      marks: editQuestion.marks > 0 ? editQuestion.marks : 1,
    };

    setGeneratedQuestions(updated);
    setEditModalOpen(false);
    toast.success(`Question ${editingIndex + 1} updated.`);
  };

  // Delete a Question
  const handleDeleteQuestion = (index: number) => {
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    toast.info("Question deleted.");
  };

  // Add Question Manually to Preview List
  const handleAddQuestionManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (
      !newQuestion.optionA.trim() ||
      !newQuestion.optionB.trim() ||
      !newQuestion.optionC.trim() ||
      !newQuestion.optionD.trim()
    ) {
      toast.error("All 4 options must be filled.");
      return;
    }

    setGeneratedQuestions([
      ...generatedQuestions,
      {
        ...newQuestion,
        question: newQuestion.question.trim(),
        optionA: newQuestion.optionA.trim(),
        optionB: newQuestion.optionB.trim(),
        optionC: newQuestion.optionC.trim(),
        optionD: newQuestion.optionD.trim(),
      },
    ]);

    setNewQuestion({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      explanation: "",
      marks: marksPerQuestion || 1,
    });
    setAddModalOpen(false);
    toast.success("New question added to preview!");
  };

  // Save Quiz as Draft
  const handleSaveAsDraft = () => {
    if (generatedQuestions.length === 0) {
      toast.error("Cannot save quiz without any questions. Please add at least one question.");
      return;
    }

    setState("saving");
    startTransition(async () => {
      try {
        const result = await saveAiGeneratedQuiz({
          classId: selectedClassId,
          title: title.trim(),
          description: description.trim() || undefined,
          questions: generatedQuestions,
        });

        toast.success("Draft quiz saved! You can now review and publish it.");
        router.push(`/teacher/quizzes/${result.quizId}`);
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to save draft quiz.");
        setState("review");
      }
    });
  };

  const selectedClassName =
    classes.find((c) => c.id === selectedClassId)?.name || "Selected Classroom";
  const totalPossibleMarks = generatedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link href="/teacher/quizzes">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Quizzes</span>
          </Link>
        </Button>

        <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-400 font-semibold gap-1.5 py-1 px-3">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>AI Automation Engine</span>
        </Badge>
      </div>

      {/* STATE 1: SETUP FORM */}
      {(state === "idle" || state === "generating") && (
        <Card className="border bg-card/90 shadow-md">
          <CardHeader className="space-y-2 pb-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight">
                  Generate Quiz with AI
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Upload study documents (.docx) or paste syllabus notes to automatically build structured MCQ assessments.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Class & Title row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="quizClass" className="text-xs font-semibold text-slate-200">
                    Classroom <span className="text-rose-400">*</span>
                  </Label>
                  {classes.length === 0 ? (
                    <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      You must create a classroom before generating quizzes.
                    </p>
                  ) : (
                    <select
                      id="quizClass"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      disabled={state === "generating"}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id} className="bg-slate-900 text-slate-100">
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quizTitle" className="text-xs font-semibold text-slate-200">
                    Quiz Title <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="quizTitle"
                    placeholder="e.g. Data Structures Unit 1 AI Quiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={state === "generating"}
                    className="text-xs h-9 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="quizDesc" className="text-xs font-semibold text-slate-200">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="quizDesc"
                  placeholder="e.g. AI-generated quiz from Data Structures study material."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={state === "generating"}
                  className="text-xs h-9 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                  maxLength={200}
                />
              </div>

              {/* Source Type Selector */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-slate-200">
                  Source Study Material <span className="text-rose-400">*</span>
                </Label>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setSourceType("docx")}
                    disabled={state === "generating"}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      sourceType === "docx"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileUp className="h-4 w-4" />
                    <span>Upload Word Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceType("text")}
                    disabled={state === "generating"}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      sourceType === "text"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Paste Text</span>
                  </button>
                </div>

                {/* Sub-form: DOCX Upload */}
                {sourceType === "docx" && (
                  <div className="mt-3 p-5 rounded-xl border border-dashed border-slate-700 bg-slate-850/50 space-y-3">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Upload Microsoft Word Document (.docx)
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Maximum file size 5MB. Readable text will be parsed server-side.
                        </p>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs">
                        <span>Browse .docx File</span>
                        <input
                          type="file"
                          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          disabled={state === "generating"}
                          className="hidden"
                        />
                      </label>

                      {docxFile && (
                        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="truncate max-w-xs">{docxFile.name}</span>
                          <span className="text-[10px] opacity-75">
                            ({(docxFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form: Paste Text */}
                {sourceType === "text" && (
                  <div className="space-y-1.5 mt-2">
                    <textarea
                      placeholder="Paste your study material, lecture notes, textbook excerpt, or syllabus notes here..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      disabled={state === "generating"}
                      rows={6}
                      maxLength={50000}
                      className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-800/90 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required={sourceType === "text"}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Minimum 30 characters recommended.</span>
                      <span>{pastedText.length} / 50,000 characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Parameters: Count, Difficulty, Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <Label htmlFor="qCount" className="text-xs font-semibold text-slate-200">
                    Number of Questions
                  </Label>
                  <select
                    id="qCount"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    disabled={state === "generating"}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5} className="bg-slate-900">5 Questions</option>
                    <option value={10} className="bg-slate-900">10 Questions</option>
                    <option value={15} className="bg-slate-900">15 Questions</option>
                    <option value={20} className="bg-slate-900">20 Questions</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qDifficulty" className="text-xs font-semibold text-slate-200">
                    Difficulty Level
                  </Label>
                  <select
                    id="qDifficulty"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as "Easy" | "Medium" | "Hard" | "Mixed")
                    }
                    disabled={state === "generating"}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mixed" className="bg-slate-900">Mixed Difficulty</option>
                    <option value="Easy" className="bg-slate-900">Easy</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="Hard" className="bg-slate-900">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qMarks" className="text-xs font-semibold text-slate-200">
                    Marks per Question
                  </Label>
                  <Input
                    id="qMarks"
                    type="number"
                    min={1}
                    max={20}
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(parseInt(e.target.value, 10) || 1)}
                    disabled={state === "generating"}
                    className="text-xs h-9 bg-slate-800/90 border-slate-700 text-slate-100 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit & Generate Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={state === "generating"}
                  className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Link href="/teacher/quizzes">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={state === "generating" || classes.length === 0}
                  className="text-xs font-semibold gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 px-5"
                >
                  {state === "generating" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{loadingStep}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STATE 2: REVIEW & EDIT SCREEN */}
      {(state === "review" || state === "saving") && (
        <div className="space-y-6">
          {/* Header Summary Banner */}
          <Card className="border bg-card/90 shadow-xs">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedClassName}</span>
                </Badge>

                <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 font-semibold">
                  UNSAVED DRAFT REVIEW
                </Badge>
              </div>

              <div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  {title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {description || "AI-generated quiz awaiting teacher verification."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {/* Question stats & valid count */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/20 border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Generated</span>
                  <span className="font-extrabold text-foreground text-sm">
                    {generatedQuestions.length} Questions
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Valid & Ready</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {generatedQuestions.length} Questions
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Marks</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    {totalPossibleMarks} Points
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Difficulty</span>
                  <span className="font-extrabold text-indigo-400 text-sm">
                    {difficulty}
                  </span>
                </div>
              </div>

              {/* Deduplication Notice */}
              {generationNotice && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                  <span>{generationNotice}</span>
                </div>
              )}

              {/* Action buttons bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setState("idle")}
                    disabled={state === "saving"}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Generate Again</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalOpen(true)}
                    disabled={state === "saving"}
                    className="text-xs font-semibold gap-1.5 hover:border-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question Manually</span>
                  </Button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAsDraft}
                  disabled={state === "saving" || generatedQuestions.length === 0}
                  className="text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 px-5"
                >
                  {state === "saving" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Draft...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save as Draft</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  AI Generated Questions ({generatedQuestions.length})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review each question below. You can edit options, correct answers, marks, or delete any question.
                </p>
              </div>
            </div>

            {generatedQuestions.length === 0 ? (
              <Card className="border border-dashed bg-card/50">
                <CardContent className="py-10 text-center space-y-3">
                  <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-60" />
                  <div className="text-sm font-bold">All questions removed</div>
                  <Button
                    size="sm"
                    onClick={() => setAddModalOpen(true)}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <Card key={idx} className="border bg-card/90 shadow-xs relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold font-mono">
                              Question {idx + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-bold tracking-tight pt-1">
                            {q.question}
                          </CardTitle>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(idx)}
                            disabled={state === "saving"}
                            className="h-8 w-8 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10"
                            title="Edit Question"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(idx)}
                            disabled={state === "saving"}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { key: "A", text: q.optionA },
                          { key: "B", text: q.optionB },
                          { key: "C", text: q.optionC },
                          { key: "D", text: q.optionD },
                        ].map((opt) => {
                          const isCorrect = q.correctOption === opt.key;
                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-lg border flex items-center justify-between font-medium ${
                                isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "bg-muted/20 border-border text-foreground"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold opacity-75">
                                  {opt.key}:
                                </span>
                                <span>{opt.text}</span>
                              </span>
                              {isCorrect && (
                                <Badge variant="default" className="text-[9px] bg-emerald-500 text-white px-1.5 py-0 shrink-0">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="text-[11px] text-muted-foreground bg-muted/15 p-2.5 rounded-lg border">
                          <span className="font-semibold text-foreground">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT QUESTION DIALOG */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Edit Question {editingIndex !== null ? editingIndex + 1 : ""}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modify question phrasing, choices, correct option, or assigned marks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Question Text</Label>
              <textarea
                value={editQuestion.question}
                onChange={(e) =>
                  setEditQuestion({ ...editQuestion, question: e.target.value })
                }
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option A</Label>
                <Input
                  value={editQuestion.optionA}
                  onChange={(e) =>
                    setEditQuestion({ ...editQuestion, optionA: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option B</Label>
                <Input
                  value={editQuestion.optionB}
                  onChange={(e) =>
                    setEditQuestion({ ...editQuestion, optionB: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option C</Label>
                <Input
                  value={editQuestion.optionC}
                  onChange={(e) =>
                    setEditQuestion({ ...editQuestion, optionC: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option D</Label>
                <Input
                  value={editQuestion.optionD}
                  onChange={(e) =>
                    setEditQuestion({ ...editQuestion, optionD: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Correct Option</Label>
                <select
                  value={editQuestion.correctOption}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      correctOption: e.target.value as "A" | "B" | "C" | "D",
                    })
                  }
                  className="w-full text-xs h-8 px-2.5 rounded-md border border-slate-700 bg-slate-800/90 text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Marks</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={editQuestion.marks}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion,
                      marks: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Explanation (Optional)</Label>
              <Input
                value={editQuestion.explanation || ""}
                onChange={(e) =>
                  setEditQuestion({ ...editQuestion, explanation: e.target.value })
                }
                className="text-xs h-8 bg-slate-800/90 border-slate-700"
                placeholder="Reason why the option is correct..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD QUESTION MANUALLY DIALOG */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Question to Quiz</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new multiple-choice question to this draft quiz.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddQuestionManually} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Question Text</Label>
              <textarea
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
                rows={2}
                placeholder="e.g. What is the time complexity of binary search?"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option A</Label>
                <Input
                  value={newQuestion.optionA}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, optionA: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option B</Label>
                <Input
                  value={newQuestion.optionB}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, optionB: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option C</Label>
                <Input
                  value={newQuestion.optionC}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, optionC: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-indigo-400">Option D</Label>
                <Input
                  value={newQuestion.optionD}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, optionD: e.target.value })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Correct Option</Label>
                <select
                  value={newQuestion.correctOption}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      correctOption: e.target.value as "A" | "B" | "C" | "D",
                    })
                  }
                  className="w-full text-xs h-8 px-2.5 rounded-md border border-slate-700 bg-slate-800/90 text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Marks</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={newQuestion.marks}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      marks: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="text-xs h-8 bg-slate-800/90 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">
                Add to Quiz
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
