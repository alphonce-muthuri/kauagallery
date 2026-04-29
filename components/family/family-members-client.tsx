"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
import type { FamilyMember } from "@/sanity/queries";

export function FamilyMembersClient({
  initialMembers,
}: {
  initialMembers: FamilyMember[];
}) {
  const { isLoaded, isSignedIn } = useUser();
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function saveMemberName(id: string, nextName: string) {
    const clean = nextName.trim();
    if (!clean) return;
    const prev = members;
    setMembers((list) => list.map((m) => (m._id === id ? { ...m, name: clean } : m)));
    try {
      const res = await fetch("/api/family-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Update failed (${res.status})`);
    } catch (err) {
      setMembers(prev);
      toast.error("Could not update member", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  async function inviteMember() {
    const name = newName.trim();
    if (!name) {
      toast.error("Please enter a name.");
      return;
    }

    if (isLoaded && !isSignedIn) {
      toast.error("Please sign in to invite family.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Inviting family member…");
    try {
      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: newAvatarUrl.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Invite failed (${res.status})`);

      const created = data?.member as FamilyMember | undefined;
      if (created) setMembers((list) => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));

      toast.success("Family member added.", { id: toastId });
      setInviteOpen(false);
      setNewName("");
      setNewAvatarUrl("");
    } catch (err) {
      toast.error("Invite failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Family
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">
            The people in our library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite the people who matter, so everyone can add and relive memories together.
          </p>
        </div>
        <Button
          className="self-start sm:self-auto"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="size-4" /> Invite family
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member._id}>
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <Avatar className="size-12 text-base">
                <AvatarFallback>{member.name.trim().charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <Input
                defaultValue={member.name}
                onBlur={(event) => {
                  void saveMemberName(member._id, event.target.value);
                }}
                aria-label={`Edit name for ${member.name || "member"}`}
                className="h-11 w-full rounded-lg bg-transparent text-base font-semibold sm:h-9 sm:text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={inviteOpen} onOpenChange={(next) => !submitting && setInviteOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite family member</DialogTitle>
            <DialogDescription>
              Add someone to the family list so they show up in the library.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                placeholder="e.g. Jane"
                value={newName}
                disabled={submitting}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-avatar">Avatar URL (optional)</Label>
              <Input
                id="member-avatar"
                placeholder="https://..."
                value={newAvatarUrl}
                disabled={submitting}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setInviteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void inviteMember()} disabled={submitting}>
              {submitting ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

