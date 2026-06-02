import React, { useState } from "react";
import {
    usePaymentVerifications,
    useApprovePayment,
    useRejectPayment,
} from "@/Hooks/usePayments";
import PaginationComponent from "@/components/ui/PaginationComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/avatarHelper";

export default function PaymentVerifications() {
    const [activeTab, setActiveTab] = useState("pending");
    const [page, setPage] = useState(1);
    const {
        data: paginatedData,
        isLoading,
        refetch,
    } = usePaymentVerifications(activeTab, page);

    // ✅ Extract data and build meta
    const payments = paginatedData?.data ?? [];
    const meta = paginatedData
        ? {
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
          }
        : null;

    const approveMutation = useApprovePayment();
    const rejectMutation = useRejectPayment();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [actionType, setActionType] = useState(null);

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

    if (isLoading)
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/8 to-transparent p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border mb-6">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        Financial Review
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Payment Verifications
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Verify sweepstar top‑ups, approve or reject transactions.
                </p>
            </div>

            <Card className="rounded-xl border-border/60 bg-background/50">
                <CardHeader>
                    <CardTitle>Verification Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => {
                            setActiveTab(val);
                            setPage(1);
                        }}
                    >
                        <TabsList className="mb-4">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab}>
                            {payments.length === 0 ? (
                                <p className="text-center py-8">
                                    No {activeTab} payments.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="border rounded-lg p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
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
                                            <div className="flex justify-between">
                                                {payment.status ===
                                                    "pending" && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600"
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
                                                            className="text-red-600"
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {meta && meta.last_page > 1 && (
                                <PaginationComponent
                                    meta={meta}
                                    onPageChange={setPage}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

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
                    </DialogHeader>
                    <div>
                        <Textarea
                            placeholder="Admin notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                        />
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
                            variant={
                                actionType === "approve"
                                    ? "default"
                                    : "destructive"
                            }
                        >
                            {actionType === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
