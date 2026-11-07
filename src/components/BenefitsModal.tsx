import { HeartHandshake, Gift, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export function BenefitsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="glass-strong max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg p-7">
    <DialogTitle className="text-2xl">A little help. A global community.</DialogTitle>
    <DialogDescription>Benefits of sharing your valid referral code</DialogDescription>
    <div className="space-y-6 py-3">
      <div className="flex gap-4"><Gift className="shrink-0 text-gold" /><div><h3 className="font-bold">Reward opportunities</h3><p className="mt-1 text-sm text-muted-foreground">Help others discover Umrah competition opportunities. Eligibility and rewards depend on the official Nusuk programme; no reward or winning entry is guaranteed.</p></div></div>
      <div className="flex gap-4"><Globe className="shrink-0 text-cyan" /><div><h3 className="font-bold">Reach pilgrims worldwide</h3><p className="mt-1 text-sm text-muted-foreground">Your shared key joins the public board, where fellow pilgrims can discover it.</p></div></div>
      <div className="flex gap-4"><HeartHandshake className="shrink-0 text-primary" /><div><h3 className="font-bold">Mutual help & Sadaqah</h3><p className="mt-1 text-sm text-muted-foreground">Share with sincere intentions and support one another on the journey. Small acts of generosity can make a difference.</p></div></div>
    </div>
  </DialogContent></Dialog>;
}