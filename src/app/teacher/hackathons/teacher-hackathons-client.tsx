"use client";

import { useState } from "react";
import { AppUser } from "@/types";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy,
  Plus,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  Trash2,
  Loader2,
  Globe,
  FileText,
} from "lucide-react";
import {
  extractHackathonDetails,
  saveHackathon,
  deleteHackathon,
} from "@/lib/actions/hackathon-actions";

interface HackathonItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  organizer: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  registrationDeadline: Date | null;
  published: boolean;
  createdAt: Date;
}

interface TeacherHackathonsClientProps {
  initialHackathons: HackathonItem[];
  user: AppUser;
}

export function TeacherHackathonsClient({
  initialHackathons,
  user,
}: TeacherHackathonsClientProps) {
  const [now] = useState(() => Date.now());
  const [hackathons, setHackathons] = useState<HackathonItem[]>(initialHackathons);
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [extractText, setExtractText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewData, setReviewData] = useState({
    id: "",
    title: "",
    organizer: "",
    description: "",
    url: "",
    location: "Online",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    published: true,
  });

  const handleStartExtract = async () => {
    if (!extractUrl.trim() && !extractText.trim()) return;
    setIsExtracting(true);
    try {
      const res = await extractHackathonDetails({
        url: extractUrl.trim() || undefined,
        rawText: extractText.trim() || undefined,
      });

      if (res.success && res.data) {
        setReviewData({
          id: "",
          title: res.data.title || "",
          organizer: res.data.organizer || "",
          description: res.data.description || "",
          url: res.data.url || extractUrl.trim() || "https://",
          location: res.data.location || "Online",
          startDate: res.data.startDate || "",
          endDate: res.data.endDate || "",
          registrationDeadline: res.data.registrationDeadline || "",
          published: true,
        });
        setIsExtractOpen(false);
        setIsReviewOpen(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to extract hackathon details.";
      alert(errorMsg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveHackathon = async (publishImmediate: boolean) => {
    setIsSaving(true);
    try {
      const res = await saveHackathon({
        id: reviewData.id || undefined,
        title: reviewData.title,
        description: reviewData.description,
        url: reviewData.url,
        organizer: reviewData.organizer,
        location: reviewData.location,
        startDate: reviewData.startDate || null,
        endDate: reviewData.endDate || null,
        registrationDeadline: reviewData.registrationDeadline || null,
        published: publishImmediate,
      });

      if (res.success && res.hackathon) {
        setIsReviewOpen(false);
        // Refresh local state
        setHackathons((prev) => {
          const filtered = prev.filter((h) => h.id !== res.hackathon.id);
          return [res.hackathon, ...filtered];
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save hackathon.";
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hackathon entry?")) return;
    try {
      await deleteHackathon(id);
      setHackathons((prev) => prev.filter((h) => h.id !== id));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete hackathon.";
      alert(errorMsg);
    }
  };

  return (
    <DashboardShell user={user} title="Hackathon Management">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Hackathons & Competitions
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Curate, extract from URL/flyer text, and publish exciting hackathon opportunities for your students to compete and innovate.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setExtractUrl("");
                setExtractText("");
                setIsExtractOpen(true);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Extract & Add Hackathon</span>
            </Button>
          </div>
        </div>

        {/* Hackathon List Grid */}
        {hackathons.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No Hackathons Added Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Extract hackathon details from Devpost, MLH, Unstop, or event text to share with students.
                </p>
              </div>
              <Button
                onClick={() => setIsExtractOpen(true)}
                variant="outline"
                className="gap-2 border-indigo-500/30 hover:bg-indigo-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Hackathon</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hackathons.map((h) => {
              const deadline = h.registrationDeadline ? new Date(h.registrationDeadline) : null;
              const isPast = deadline ? deadline.getTime() < now : false;

              return (
                <Card
                  key={h.id}
                  className="flex flex-col justify-between border-border/80 hover:border-indigo-500/50 transition-all shadow-xs overflow-hidden"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant={h.published ? "default" : "secondary"}
                        className={h.published ? "bg-emerald-600 hover:bg-emerald-700 text-[10px]" : "text-[10px]"}
                      >
                        {h.published ? "Published to Students" : "Draft"}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(h.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Delete hackathon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-1">
                      {h.title}
                    </CardTitle>

                    {h.organizer && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{h.organizer}</span>
                      </div>
                    )}

                    <CardDescription className="text-xs line-clamp-2">
                      {h.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{h.location || "Online"}</span>
                      </div>

                      {deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className={isPast ? "text-destructive font-semibold" : ""}>
                            Deadline: {deadline.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1.5 h-8 border-indigo-500/20 hover:bg-indigo-500/10"
                      >
                        <a href={h.url} target="_blank" rel="noopener noreferrer">
                          <span>View Event Page</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog 1: Extract Event Details */}
        <Dialog open={isExtractOpen} onOpenChange={setIsExtractOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span>Extract Hackathon Details</span>
              </DialogTitle>
              <DialogDescription>
                Provide a website URL or paste event announcement text. The AI system extracts and prepares all fields for your review before publication.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Hackathon Website URL</span>
                </Label>
                <Input
                  placeholder="https://devpost.com/hackathons/example"
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  disabled={isExtracting}
                  className="text-xs"
                />
              </div>

              <div className="relative text-center my-1">
                <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase font-bold">
                  Or Paste Text
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Event Announcement Text</span>
                </Label>
                <textarea
                  placeholder="Paste email, flyer text, or description..."
                  value={extractText}
                  onChange={(e) => setExtractText(e.target.value)}
                  disabled={isExtracting}
                  rows={4}
                  className="w-full p-2.5 text-xs bg-muted/20 border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsExtractOpen(false)}
                disabled={isExtracting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartExtract}
                disabled={(!extractUrl.trim() && !extractText.trim()) || isExtracting}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting Details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Review Extracted Details</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog 2: Teacher Review & Edit Before Publication */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Review Hackathon Details Before Publishing</span>
              </DialogTitle>
              <DialogDescription>
                Verify and edit the extracted details. Only accurate information will be visible to students once published.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="font-semibold">Hackathon Title *</Label>
                <Input
                  value={reviewData.title}
                  onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                  placeholder="e.g. Global AI Innovation Challenge 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Organizer / Host</Label>
                  <Input
                    value={reviewData.organizer}
                    onChange={(e) => setReviewData({ ...reviewData, organizer: e.target.value })}
                    placeholder="e.g. Major League Hacking / Google"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Location / Mode</Label>
                  <Input
                    value={reviewData.location}
                    onChange={(e) => setReviewData({ ...reviewData, location: e.target.value })}
                    placeholder="Online / City, Country"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Registration URL *</Label>
                <Input
                  value={reviewData.url}
                  onChange={(e) => setReviewData({ ...reviewData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Description</Label>
                <textarea
                  value={reviewData.description}
                  onChange={(e) => setReviewData({ ...reviewData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-muted/20 border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
                  placeholder="Key themes, prizes, tracks..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Registration Deadline</Label>
                  <Input
                    type="date"
                    value={reviewData.registrationDeadline}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, registrationDeadline: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Start Date</Label>
                  <Input
                    type="date"
                    value={reviewData.startDate}
                    onChange={(e) => setReviewData({ ...reviewData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={reviewData.endDate}
                    onChange={(e) => setReviewData({ ...reviewData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReviewOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSaveHackathon(false)}
                disabled={!reviewData.title.trim() || !reviewData.url.trim() || isSaving}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSaveHackathon(true)}
                disabled={!reviewData.title.trim() || !reviewData.url.trim() || isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Publish to Students</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
