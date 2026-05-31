import React, { useState } from "react";
import {
    usePaymentVerifications,
    useApprovePayment,
    useRejectPayment,
} from "@/Hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    CheckCircle,
    XCircle,
    Eye,
    Wallet,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/avatarHelper";
import { Label } from "@radix-ui/react-dropdown-menu";

// Helper to get full screenshot URL
const getScreenshotUrl = (path) => {
    if (!path) return null;
    // If path already starts with http, return as is
    if (path.startsWith("http")) return path;
    // Otherwise, prepend the API base URL or storage URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    // Remove leading slash if any to avoid double slash
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}/storage/${cleanPath}`;
};

export default function PaymentVerifications() {
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [actionType, setActionType] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // For screenshot modal

    const {
        data: payments,
        isLoading,
        refetch,
    } = usePaymentVerifications(activeTab);
    const approveMutation = useApprovePayment();
    const rejectMutation = useRejectPayment();

    const handleApprove = (payment) => {
        setSelectedPayment(payment);
        setActionType("approve");
        setAdminNotes("");
    };

    const handleReject = (payment) => {
        setSelectedPayment(payment);
        setActionType("reject");
        setAdminNotes("");
    };

    const confirmAction = async () => {
        if (!selectedPayment) return;
        try {
            if (actionType === "approve") {
                await approveMutation.mutateAsync({
                    id: selectedPayment.id,
                    adminNotes,
                });
                toast.success("Payment approved. Points credited.");
            } else {
                await rejectMutation.mutateAsync({
                    id: selectedPayment.id,
                    adminNotes,
                });
                toast.success("Payment rejected.");
            }
            setSelectedPayment(null);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        Pending
                    </Badge>
                );
            case "approved":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                    >
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-8 md:p-12">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl dark:bg-primary/10" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/5" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Financial Review
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Payment Verifications
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Verify sweepstar top‑ups, approve or reject
                        transactions.
                    </p>
                </div>
            </div>

            <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Verification Queue
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab}>
                            {payments?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No {activeTab} payments.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {payments?.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="border rounded-lg p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                            src={
                                                                payment
                                                                    .sweepstar
                                                                    ?.avatar_url
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                payment
                                                                    .sweepstar
                                                                    ?.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                payment
                                                                    .sweepstar
                                                                    ?.name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                payment
                                                                    .sweepstar
                                                                    ?.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">
                                                        {payment.amount} points
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Code: {payment.code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Sender Account:
                                                    </span>{" "}
                                                    {
                                                        payment.sender_account_number
                                                    }
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Sender Name:
                                                    </span>{" "}
                                                    {
                                                        payment.sender_account_name
                                                    }
                                                </div>
                                            </div>

                                            {/* Screenshot Preview */}
                                            {payment.screenshot_path && (
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() =>
                                                            setPreviewImage(
                                                                getScreenshotUrl(
                                                                    payment.screenshot_path,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
                                                        View Screenshot
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {getStatusBadge(
                                                        payment.status,
                                                    )}
                                                </div>
                                                {payment.status ===
                                                    "pending" && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    payment,
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="mr-1 h-4 w-4" />{" "}
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() =>
                                                                handleReject(
                                                                    payment,
                                                                )
                                                            }
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" />{" "}
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                                {payment.admin_notes && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Notes:{" "}
                                                        {payment.admin_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Admin Action Dialog (Approve/Reject) */}
            <Dialog
                open={!!selectedPayment}
                onOpenChange={() => setSelectedPayment(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "approve"
                                ? "Approve Payment"
                                : "Reject Payment"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "approve"
                                ? "This will credit points to the sweepstar's account."
                                : "This will reject the payment request."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <p className="text-sm font-medium">
                                Code: {selectedPayment?.code}
                            </p>
                            <p className="text-sm font-medium">
                                Amount: {selectedPayment?.amount}
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="notes">
                                Admin Notes (optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSelectedPayment(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAction}
                            disabled={
                                approveMutation.isPending ||
                                rejectMutation.isPending
                            }
                            variant={
                                actionType === "approve"
                                    ? "default"
                                    : "destructive"
                            }
                        >
                            {approveMutation.isPending ||
                            rejectMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {actionType === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <Dialog
                open={!!previewImage}
                onOpenChange={() => setPreviewImage(null)}
            >
                <DialogContent className="max-w-4xl p-0 bg-black/90">
                    <div className="relative">
                        <img
                            src={previewImage}
                            alt="Payment Screenshot"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white hover:bg-white/20"
                            onClick={() => setPreviewImage(null)}
                        >
                            <XCircle className="h-6 w-6" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
