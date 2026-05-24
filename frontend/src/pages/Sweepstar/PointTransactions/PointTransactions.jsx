import React from "react";
import { usePointTransactions } from "@/Hooks/usePayments";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export default function PointTransactions() {
    const { data: transactions, isLoading } = usePointTransactions();

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-lg">
                        Loading transaction history...
                    </p>
                </div>
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
                        <History className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            Point Ledger
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Point Transactions
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        View your credit and debit history. Points are earned
                        from verified payments or spent when accepting missions.
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <Card className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Transaction History
                    </CardTitle>
                    <CardDescription>
                        All your point movements in one place
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {transactions?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 rounded-full bg-muted/40 mb-4">
                                <History className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No transactions yet
                            </h3>
                            <p className="text-muted-foreground max-w-sm">
                                When you top up points or accept missions,
                                transactions will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border/60 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions?.map((tx) => (
                                        <TableRow
                                            key={tx.id}
                                            className="hover:bg-muted/20"
                                        >
                                            <TableCell className="font-mono text-xs">
                                                {format(
                                                    new Date(tx.created_at),
                                                    "MMM d, yyyy HH:mm",
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        tx.type === "credit"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                    className="gap-1"
                                                >
                                                    {tx.type === "credit" ? (
                                                        <>
                                                            <TrendingUp className="w-3 h-3" />
                                                            Credit
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-3 h-3" />
                                                            Debit
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    tx.type === "credit"
                                                        ? "text-green-600 dark:text-green-400 font-semibold"
                                                        : "text-red-600 dark:text-red-400 font-semibold"
                                                }
                                            >
                                                {tx.type === "credit"
                                                    ? "+"
                                                    : "-"}
                                                {tx.amount}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {tx.description || "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
