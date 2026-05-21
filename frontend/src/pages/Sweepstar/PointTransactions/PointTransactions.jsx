import React from "react";
import { usePointTransactions } from "@/Hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function PointTransactions() {
    const { data: transactions, isLoading } = usePointTransactions();

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Point Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No transactions yet.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions?.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
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
                                            >
                                                {tx.type === "credit"
                                                    ? "Credit"
                                                    : "Debit"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell
                                            className={
                                                tx.type === "credit"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        >
                                            {tx.type === "credit" ? "+" : "-"}
                                            {tx.amount}
                                        </TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
