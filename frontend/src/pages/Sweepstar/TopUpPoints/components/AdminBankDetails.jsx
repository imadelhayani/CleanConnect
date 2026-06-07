import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
};

export default function AdminBankDetails({ codeData }) {
    return (
        <div className="rounded-xl bg-muted/40 p-5 space-y-3 border border-border/60">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Copy className="w-5 h-5 text-primary" />
                Admin Bank Details
            </h3>
            <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-muted-foreground">
                        Account Number:
                    </span>
                    <div className="flex items-center gap-2">
                        <code className="bg-muted/80 px-2 py-1 rounded font-mono text-sm">
                            {codeData.admin_bank_account}
                        </code>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                                copyToClipboard(codeData.admin_bank_account)
                            }
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-muted-foreground">
                        Account Holder:
                    </span>
                    <span className="font-medium">
                        {codeData.admin_bank_holder}
                    </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-muted-foreground">
                        Your Payment Code (Motif):
                    </span>
                    <div className="flex items-center gap-2">
                        <code className="bg-primary/10 px-2 py-1 rounded font-mono text-sm font-bold text-primary">
                            {codeData.code}
                        </code>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(codeData.code)}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
