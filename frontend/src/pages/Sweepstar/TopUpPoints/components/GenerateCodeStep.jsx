import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet } from "lucide-react";

export default function GenerateCodeStep({ onRequestCode, isGenerating }) {
    return (
        <div className="space-y-6">
            <Alert className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                <AlertDescription className="text-sm">
                    Generate a unique payment code. Use this code as the payment
                    motif when transferring money to the admin bank account.
                    Once verified, points will be added to your balance.
                </AlertDescription>
            </Alert>
            <Button
                onClick={onRequestCode}
                disabled={isGenerating}
                className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Wallet className="mr-2 h-5 w-5" />
                        Generate Payment Code
                    </>
                )}
            </Button>
        </div>
    );
}
